import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { Database, Json } from '@edutime/shared'
import { getAuthenticatedUser } from '@/utils/supabase/api-auth'
import { createPayrexxClientFromEnv } from '@/utils/payments/payrexxClient'

type CancelResponse = {
  canceledAt?: string
  alreadyCanceled?: boolean
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

    const billingClient = createBillingClient()
    if (!billingClient) {
      return res.status(500).json({ error: 'Missing billing configuration on server' })
    }

    const { data: subscription, error: subscriptionError } = await billingClient
      .from('subscriptions')
      .select(
        `
          id,
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
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (subscriptionError) {
      console.error('Failed to load personal subscription for cancellation:', subscriptionError)
      return res.status(500).json({ error: 'Could not load subscription' })
    }

    if (!subscription) {
      return res.status(404).json({ error: 'No active personal subscription found' })
    }

    if (subscription.cancel_at_period_end) {
      return res.status(200).json({
        canceledAt: subscription.canceled_at || undefined,
        alreadyCanceled: true,
      })
    }

    let gatewayId = extractGatewayId(subscription.provider_subscription_id, subscription.metadata)

    if (!gatewayId) {
      const { data: sessionRow, error: checkoutSessionError } = await billingClient
        .from('checkout_sessions')
        .select('payrexx_gateway_id')
        .eq('subscription_id', subscription.id)
        .not('payrexx_gateway_id', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (checkoutSessionError) {
        console.error('Failed to resolve gateway id from checkout sessions:', checkoutSessionError)
        return res.status(500).json({ error: 'Could not resolve Payrexx gateway id for cancellation' })
      }

      gatewayId = sessionRow?.payrexx_gateway_id ?? null
    }

    if (!gatewayId) {
      return res.status(409).json({ error: 'No cancellable Payrexx gateway id found for this subscription' })
    }

    const payrexxClient = createPayrexxClientFromEnv()
    if (!payrexxClient) {
      return res.status(500).json({ error: 'Missing Payrexx configuration on server' })
    }

    const subscriptionId = extractSubscriptionId(subscription.metadata)
    if (subscriptionId) {
      await payrexxClient.cancelSubscription(subscriptionId)
    } else {
      await payrexxClient.deleteGateway(gatewayId)
    }

    const canceledAt = new Date().toISOString()
    const previousMetadata =
      subscription.metadata && typeof subscription.metadata === 'object' && !Array.isArray(subscription.metadata)
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
          canceled_via: 'web_settings',
          cancellation_mode: subscriptionId ? 'subscription_cancel' : 'gateway_cancel',
          cancellation_gateway_id: gatewayId,
          cancellation_subscription_id: subscriptionId,
        },
      })
      .eq('id', subscription.id)

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
