import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { paymentProvider } from '@/utils/payments'
import { calculateCheckoutAmount, MAX_AUTO_PRICING_LICENSES, MIN_ORG_LICENSES } from '@/utils/payments/pricing'
import { getAuthenticatedUser } from '@/utils/supabase/api-auth'

type ResponseData = {
  checkoutUrl?: string
  sessionId?: string
  error?: string
}

const nowIso = () => new Date().toISOString()

/**
 * Create a billing schema client using service role for server-side writes.
 * Uses billing schema to access checkout_sessions table.
 */
function createBillingClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return null
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    db: { schema: 'billing' },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Create a license schema client using service role for server-side checks.
 */
function createLicenseClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return null
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    db: { schema: 'license' },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const auth = await getAuthenticatedUser(req)

    if (!auth) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { user, supabase } = auth

    const { plan, qty, organizationId } = req.body
    console.log('[checkout] incoming request', {
      plan,
      hasAuthorizationHeader: Boolean(req.headers.authorization),
      hasCookieHeader: Boolean(req.headers.cookie),
      userId: user.id,
    })

    if (!plan || (plan !== 'annual' && plan !== 'org')) {
      return res.status(400).json({ error: 'Unsupported checkout plan' })
    }

    // Fetch user profile data for Payrexx fields
    const { data: userData } = await supabase
      .from('users')
      .select('first_name, last_name, language')
      .eq('user_id', user.id)
      .single()

    const quantity = plan === 'org' ? Number(qty) : 1
    if (plan === 'org') {
      if (!Number.isInteger(quantity) || quantity < MIN_ORG_LICENSES) {
        return res.status(400).json({
          error: `Organization checkout requires at least ${MIN_ORG_LICENSES} licenses`,
        })
      }
      if (quantity > MAX_AUTO_PRICING_LICENSES) {
        return res.status(400).json({
          error: `Quantities above ${MAX_AUTO_PRICING_LICENSES} require custom pricing`,
        })
      }
      if (!organizationId || !Number.isInteger(Number(organizationId))) {
        return res.status(400).json({ error: 'Organization ID is required for org checkout' })
      }

      const { data: adminRow, error: adminError } = await supabase
        .from('organization_administrators')
        .select('id')
        .eq('organization_id', Number(organizationId))
        .eq('user_id', user.id)
        .maybeSingle()

      if (adminError) {
        console.error('Failed to check org admin access:', adminError)
        return res.status(500).json({ error: 'Failed to verify organization permissions' })
      }
      if (!adminRow) {
        return res
          .status(403)
          .json({ error: 'Only organization admins can create org license checkouts' })
      }
    } else {
      const licenseClient = createLicenseClient()
      if (!licenseClient) {
        return res.status(500).json({ error: 'Missing billing configuration on server' })
      }

      const { data: activeEntitlements, error: entitlementError } = await licenseClient
        .from('entitlements')
        .select('id')
        .eq('user_id', user.id)
        .eq('kind', 'personal')
        .eq('status', 'active')
        .lte('valid_from', nowIso())
        .or(`valid_until.is.null,valid_until.gte.${nowIso()}`)
        .limit(1)

      if (entitlementError) {
        console.error('Failed to check existing personal entitlement:', entitlementError)
        return res.status(500).json({ error: 'Failed to verify existing license status' })
      }

      if ((activeEntitlements?.length ?? 0) > 0) {
        return res.status(409).json({ error: 'You already have an active personal license' })
      }
    }

    const language =
      userData?.language || req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'de'

    // Create the Payrexx Gateway (or mock checkout)
    const result = await paymentProvider.createCheckoutSession({
      plan,
      qty: plan === 'org' ? quantity : undefined,
      userId: user.id,
      organizationId: plan === 'org' ? Number(organizationId) : undefined,
      userEmail: user.email,
      firstName: userData?.first_name || undefined,
      lastName: userData?.last_name || undefined,
      language,
    })

    // Store checkout session in billing.checkout_sessions for webhook reconciliation
    const billingClient = createBillingClient()
    if (!billingClient) {
      return res.status(500).json({ error: 'Missing billing configuration on server' })
    }

    const { amountCents, requiresCustomPricing } = calculateCheckoutAmount(plan, quantity)
    if (requiresCustomPricing) {
      return res.status(400).json({
        error: `Quantities above ${MAX_AUTO_PRICING_LICENSES} require custom pricing`,
      })
    }

    if (plan === 'org') {
      const { error: rpcError } = await billingClient.rpc('create_org_checkout', {
        p_actor_user_id: user.id,
        p_organization_id: Number(organizationId),
        p_quantity: quantity,
        p_amount_cents: amountCents,
        p_currency: 'CHF',
        p_reference_id: result.sessionId,
        p_payrexx_gateway_id: result.gatewayId || null,
        p_payrexx_gateway_link: result.checkoutUrl,
        p_expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        p_due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        p_metadata: {
          source: 'web_checkout_api',
          plan: 'org',
          actor_user_id: user.id,
          organization_id: Number(organizationId),
        },
      })

      if (rpcError) {
        console.error('Failed to create org checkout session via RPC:', rpcError)
        if (
          rpcError.message?.includes('subscriptions_status_check') ||
          rpcError.details?.includes('subscriptions_status_check')
        ) {
          return res.status(500).json({
            error:
              'Org billing schema is not fully migrated yet (subscriptions status compatibility). Please run latest Supabase migrations.',
          })
        }
        return res.status(500).json({ error: 'Failed to initialize org checkout session' })
      }

      const { error: ensureError } = await billingClient.rpc('ensure_org_actor_entitlement', {
        p_actor_user_id: user.id,
        p_organization_id: Number(organizationId),
      })

      if (ensureError) {
        console.error('Failed to auto-assign org seat to checkout actor:', ensureError)
        return res.status(500).json({
          error: 'Failed to auto-assign organization seat to checkout actor',
        })
      }
    } else {
      const { error: insertError } = await billingClient.from('checkout_sessions').insert({
        user_id: user.id,
        organization_id: null,
        plan: 'annual',
        quantity,
        amount_cents: amountCents,
        currency: 'CHF',
        status: 'pending',
        reference_id: result.sessionId,
        payrexx_gateway_id: result.gatewayId || null,
        payrexx_gateway_link: result.checkoutUrl,
        metadata: {
          source: 'web_checkout_api',
          plan: 'annual',
          user_id: user.id,
        },
        expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2h
      })

      if (insertError) {
        console.error('Failed to store checkout session:', insertError)
        return res.status(500).json({ error: 'Failed to create checkout session record' })
      }
    }

    console.log('[checkout] session created successfully', {
      userId: user.id,
      sessionId: result.sessionId,
      gatewayId: result.gatewayId || null,
    })

    return res.status(200).json({
      checkoutUrl: result.checkoutUrl,
      sessionId: result.sessionId,
    })
  } catch (error) {
    console.error('Error creating checkout session:', {
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      requestBody: req.body,
    })
    return res.status(500).json({ error: 'Internal server error during checkout session creation' })
  }
}
