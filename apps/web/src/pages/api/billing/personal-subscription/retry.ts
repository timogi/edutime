import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { Database, Json } from '@edutime/shared'
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

function createBillingClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return null
  }

  return createClient<Database, 'billing'>(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    db: { schema: 'billing' },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

function createLicenseClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return null
  }

  return createClient<Database, 'license'>(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    db: { schema: 'license' },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
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

    const billingClient = createBillingClient()
    const licenseClient = createLicenseClient()
    if (!billingClient || !licenseClient) {
      return res.status(500).json({ error: 'Missing billing configuration on server' })
    }

    const now = nowIso()
    const { data: activeEntitlement, error: activeEntitlementError } = await licenseClient
      .from('entitlements')
      .select('id')
      .eq('user_id', auth.user.id)
      .eq('kind', 'personal')
      .eq('status', 'active')
      .lte('valid_from', now)
      .or(`valid_until.is.null,valid_until.gte.${now}`)
      .limit(1)
      .maybeSingle()

    if (activeEntitlementError) {
      console.error('Failed to validate current personal entitlement before retry:', activeEntitlementError)
      return res.status(500).json({ error: 'Could not validate current license state' })
    }

    if (activeEntitlement) {
      return res.status(409).json({ error: 'A personal license is already active' })
    }

    const { data: subscription, error: subscriptionError } = await billingClient
      .from('subscriptions')
      .select(
        `
          id,
          status,
          provider_subscription_id,
          cancel_at_period_end,
          canceled_at,
          metadata,
          accounts!inner(user_id, organization_id)
        `,
      )
      .eq('accounts.user_id', auth.user.id)
      .is('accounts.organization_id', null)
      .eq('provider', 'payrexx')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (subscriptionError) {
      console.error('Failed to load personal subscription for retry:', subscriptionError)
      return res.status(500).json({ error: 'Could not load existing subscription state' })
    }

    if (subscription && subscription.status === 'active' && !subscription.cancel_at_period_end) {
      const payrexxClient = createPayrexxClientFromEnv()
      if (!payrexxClient) {
        return res.status(500).json({ error: 'Missing Payrexx configuration on server' })
      }

      const gatewayId = extractGatewayId(subscription.provider_subscription_id, subscription.metadata)
      const managedSubscriptionId = extractSubscriptionId(subscription.metadata)

      if (managedSubscriptionId) {
        await payrexxClient.cancelSubscription(managedSubscriptionId)
      } else if (gatewayId) {
        await payrexxClient.deleteGateway(gatewayId)
      } else {
        return res.status(409).json({ error: 'No cancellable Payrexx reference found on previous subscription' })
      }

      const canceledAt = nowIso()
      const previousMetadata =
        subscription.metadata &&
        typeof subscription.metadata === 'object' &&
        !Array.isArray(subscription.metadata)
          ? (subscription.metadata as JsonObject)
          : {}

      const { error: updateError } = await billingClient
        .from('subscriptions')
        .update({
          cancel_at_period_end: true,
          canceled_at: canceledAt,
          metadata: {
            ...previousMetadata,
            canceled_at_period_end_at: canceledAt,
            canceled_via: 'retry_checkout',
            cancellation_mode: managedSubscriptionId ? 'subscription_cancel' : 'gateway_cancel',
            cancellation_gateway_id: gatewayId,
            cancellation_subscription_id: managedSubscriptionId,
          },
        })
        .eq('id', subscription.id)

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

    const { error: insertError } = await billingClient.from('checkout_sessions').insert({
      user_id: auth.user.id,
      organization_id: null,
      plan: 'annual',
      quantity: 1,
      amount_cents: amountInfo.amountCents,
      currency: 'CHF',
      status: 'pending',
      reference_id: checkout.sessionId,
      payrexx_gateway_id: checkout.gatewayId || null,
      payrexx_gateway_link: checkout.checkoutUrl,
      metadata: {
        source: 'web_retry_personal_checkout_api',
        plan: 'annual',
        user_id: auth.user.id,
        retry: true,
        previous_subscription_id: subscription?.id || null,
      },
      expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
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
