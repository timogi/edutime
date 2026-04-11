import type { NextApiRequest, NextApiResponse } from 'next'
import { Json } from '@edutime/shared'
import { getAuthenticatedUser } from '@/utils/supabase/api-auth'
import { createPayrexxClientFromEnv } from '@/utils/payments/payrexxClient'

type CancelResponse = {
  canceledAt?: string
  alreadyCanceled?: boolean
  error?: string
}

type JsonObject = Record<string, Json>

function asRecord(v: unknown): Record<string, unknown> | null {
  if (v != null && typeof v === 'object' && !Array.isArray(v)) {
    return v as Record<string, unknown>
  }
  return null
}

function extractGatewayId(providerSubscriptionId: string, metadata: Json | null): number | null {
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

export default async function handler(req: NextApiRequest, res: NextApiResponse<CancelResponse>) {
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
      console.error('Failed to load personal subscription for cancellation:', summaryError)
      return res.status(500).json({ error: 'Could not load subscription' })
    }

    const summary = asRecord(summaryRaw as Json)
    const subscription = summary ? asRecord(summary.subscription) : null

    if (!subscription?.id) {
      return res.status(404).json({ error: 'No active personal subscription found' })
    }

    if (String(subscription.status || '') !== 'active') {
      return res.status(404).json({ error: 'No active personal subscription found' })
    }

    if (subscription.cancel_at_period_end === true) {
      return res.status(200).json({
        canceledAt: subscription.canceled_at ? String(subscription.canceled_at) : undefined,
        alreadyCanceled: true,
      })
    }

    const metadata = (subscription.metadata ?? null) as Json | null
    const providerSubId = subscription.provider_subscription_id == null ? '' : String(subscription.provider_subscription_id)

    let gatewayId = extractGatewayId(providerSubId, metadata)
    if (!gatewayId && subscription.resolved_checkout_payrexx_gateway_id != null) {
      const g = Number(subscription.resolved_checkout_payrexx_gateway_id)
      if (Number.isFinite(g) && g > 0) {
        gatewayId = g
      }
    }

    if (!gatewayId) {
      return res.status(409).json({ error: 'No cancellable Payrexx gateway id found for this subscription' })
    }

    const payrexxClient = createPayrexxClientFromEnv()
    if (!payrexxClient) {
      return res.status(500).json({ error: 'Missing Payrexx configuration on server' })
    }

    const subscriptionId = extractSubscriptionId(metadata)
    if (subscriptionId) {
      await payrexxClient.cancelSubscription(subscriptionId)
    } else {
      await payrexxClient.deleteGateway(gatewayId)
    }

    const canceledAt = new Date().toISOString()
    const previousMetadata =
      metadata && typeof metadata === 'object' && !Array.isArray(metadata) ? (metadata as JsonObject) : {}

    const merge: JsonObject = {
      ...previousMetadata,
      canceled_at_period_end_at: canceledAt,
      canceled_via: 'web_settings',
      cancellation_mode: subscriptionId ? 'subscription_cancel' : 'gateway_cancel',
      cancellation_gateway_id: gatewayId,
      cancellation_subscription_id: subscriptionId,
    }

    const { error: updateError } = await auth.supabase.rpc('api_mark_personal_subscription_cancel_pending', {
      p_canceled_at: canceledAt,
      p_metadata_merge: merge as unknown as Json,
    })

    if (updateError) {
      console.error('Failed to persist personal subscription cancellation:', updateError)
      return res.status(500).json({ error: 'Could not persist cancellation status' })
    }

    return res.status(200).json({
      canceledAt,
      alreadyCanceled: false,
    })
  } catch (error) {
    console.error('Failed to cancel personal subscription:', error)
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    })
  }
}
