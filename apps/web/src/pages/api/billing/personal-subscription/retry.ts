import type { NextApiRequest, NextApiResponse } from 'next'
import { Json } from '@edutime/shared'
import { getAuthenticatedUser } from '@/utils/supabase/api-auth'
import { paymentProvider } from '@/utils/payments'
import { calculateCheckoutAmount } from '@/utils/payments/pricing'
import { createPayrexxClientFromEnv } from '@/utils/payments/payrexxClient'

type RetryResponse = {
  checkoutUrl?: string
  sessionId?: string
  error?: string
}

type JsonObject = Record<string, Json>

function asRecord(v: unknown): Record<string, unknown> | null {
  if (v != null && typeof v === 'object' && !Array.isArray(v)) {
    return v as Record<string, unknown>
  }
  return null
}

function extractGatewayId(providerSubscriptionId: string | null | undefined, metadata: Json | null): number | null {
  const parsedProviderId = Number(providerSubscriptionId)
  if (Number.isFinite(parsedProviderId) && parsedProviderId > 0) {
    return parsedProviderId
  }

  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return null
  }

  const metadataObj = metadata as Record<string, unknown>
  const candidates: unknown[] = [
    metadataObj.payrexx_gateway_id,
    metadataObj.gateway_id,
    metadataObj.gatewayId,
    (metadataObj.transaction as Record<string, unknown> | undefined)?.gatewayId,
    ((metadataObj.transaction as Record<string, unknown> | undefined)?.gateway as Record<
      string,
      unknown
    > | null)?.id,
  ]

  for (const candidate of candidates) {
    const parsed = Number(candidate)
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed
    }
  }

  return null
}

function extractSubscriptionId(metadata: Json | null): number | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return null
  }

  const metadataObj = metadata as Record<string, unknown>
  const rootSubscription = metadataObj.subscription as Record<string, unknown> | undefined
  const txSubscription = (metadataObj.transaction as Record<string, unknown> | undefined)?.subscription as
    | Record<string, unknown>
    | undefined

  const candidates: unknown[] = [
    metadataObj.subscription_id,
    metadataObj.subscriptionId,
    rootSubscription?.id,
    txSubscription?.id,
  ]

  for (const candidate of candidates) {
    const parsed = Number(candidate)
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed
    }
  }

  return null
}

const nowIso = () => new Date().toISOString()

export default async function handler(req: NextApiRequest, res: NextApiResponse<RetryResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const auth = await getAuthenticatedUser(req)
    if (!auth) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { data: summaryRaw, error: summaryError } = await auth.supabase.rpc(
      'api_get_personal_subscription_summary',
    )

    if (summaryError) {
      console.error('Failed to validate current personal state before retry:', summaryError)
      return res.status(500).json({ error: 'Could not validate current license state' })
    }

    const summary = asRecord(summaryRaw as Json)
    if (summary?.entitlement != null) {
      const ent = asRecord(summary.entitlement)
      if (ent?.id) {
        return res.status(409).json({ error: 'A personal license is already active' })
      }
    }

    const subscription = summary ? asRecord(summary.subscription) : null
    const subId = subscription?.id ? String(subscription.id) : undefined
    const metadata = (subscription?.metadata ?? null) as Json | null

    if (
      subscription &&
      String(subscription.status || '') === 'active' &&
      subscription.cancel_at_period_end !== true
    ) {
      const payrexxClient = createPayrexxClientFromEnv()
      if (!payrexxClient) {
        return res.status(500).json({ error: 'Missing Payrexx configuration on server' })
      }

      const providerSubId =
        subscription.provider_subscription_id == null ? '' : String(subscription.provider_subscription_id)
      let gatewayId = extractGatewayId(providerSubId, metadata)
      if (!gatewayId && subscription.resolved_checkout_payrexx_gateway_id != null) {
        const g = Number(subscription.resolved_checkout_payrexx_gateway_id)
        if (Number.isFinite(g) && g > 0) {
          gatewayId = g
        }
      }
      const managedSubscriptionId = extractSubscriptionId(metadata)

      if (managedSubscriptionId) {
        await payrexxClient.cancelSubscription(managedSubscriptionId)
      } else if (gatewayId) {
        await payrexxClient.deleteGateway(gatewayId)
      } else {
        return res.status(409).json({ error: 'No cancellable Payrexx reference found on previous subscription' })
      }

      const canceledAt = nowIso()
      const previousMetadata =
        metadata && typeof metadata === 'object' && !Array.isArray(metadata) ? (metadata as JsonObject) : {}

      const merge: JsonObject = {
        ...previousMetadata,
        canceled_at_period_end_at: canceledAt,
        canceled_via: 'retry_checkout',
        cancellation_mode: managedSubscriptionId ? 'subscription_cancel' : 'gateway_cancel',
        cancellation_gateway_id: gatewayId,
        cancellation_subscription_id: managedSubscriptionId,
      }

      const { error: updateError } = await auth.supabase.rpc('api_mark_personal_subscription_cancel_pending', {
        p_canceled_at: canceledAt,
        p_metadata_merge: merge as unknown as Json,
      })

      if (updateError) {
        console.error('Failed to persist old subscription cancellation during retry:', updateError)
        return res.status(500).json({ error: 'Could not persist previous subscription cancellation' })
      }
    }

    const { data: userData } = await auth.supabase
      .from('users')
      .select('first_name, last_name, language')
      .eq('user_id', auth.user.id)
      .single()

    const amountInfo = calculateCheckoutAmount('annual', 1)
    if (amountInfo.requiresCustomPricing) {
      return res.status(500).json({ error: 'Invalid annual pricing configuration' })
    }

    const checkout = await paymentProvider.createCheckoutSession({
      plan: 'annual',
      userId: auth.user.id,
      userEmail: auth.user.email,
      firstName: userData?.first_name || undefined,
      lastName: userData?.last_name || undefined,
      language: userData?.language || req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'de',
    })

    const { error: insertError } = await auth.supabase.rpc('api_create_personal_checkout_session', {
      p_amount_cents: amountInfo.amountCents,
      p_currency: 'CHF',
      p_reference_id: checkout.sessionId,
      p_payrexx_gateway_id: checkout.gatewayId || null,
      p_payrexx_gateway_link: checkout.checkoutUrl,
      p_billing_cycle: 'annual',
      p_expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      p_metadata: {
        source: 'web_retry_personal_checkout_api',
        plan: 'annual',
        user_id: auth.user.id,
        retry: true,
        previous_subscription_id: subId || null,
      },
    })

    if (insertError) {
      console.error('Failed to store retry checkout session:', insertError)
      return res.status(500).json({ error: 'Failed to create retry checkout session' })
    }

    return res.status(200).json({
      checkoutUrl: checkout.checkoutUrl,
      sessionId: checkout.sessionId,
    })
  } catch (error) {
    console.error('Failed to create personal retry checkout:', error)
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    })
  }
}
