import type { NextApiRequest, NextApiResponse } from 'next'
import { paymentProvider } from '@/utils/payments'
import { calculateCheckoutAmount, MAX_AUTO_PRICING_LICENSES, MIN_ORG_LICENSES } from '@/utils/payments/pricing'
import { getAuthenticatedUser } from '@/utils/supabase/api-auth'

type ResponseData = {
  checkoutUrl?: string
  sessionId?: string
  error?: string
}

type BillingCycle = 'annual' | 'daily_test'

const DAILY_TEST_PRICE_CENTS = 100
const DAILY_TEST_INTERVAL = 'P1D'

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

    const { plan, billingCycle, qty, organizationId } = req.body as {
      plan?: 'annual' | 'org'
      billingCycle?: BillingCycle
      qty?: number
      organizationId?: number
    }
    console.log('[checkout] incoming request', {
      plan,
      hasAuthorizationHeader: Boolean(req.headers.authorization),
      hasCookieHeader: Boolean(req.headers.cookie),
      userId: user.id,
    })

    if (!plan || (plan !== 'annual' && plan !== 'org')) {
      return res.status(400).json({ error: 'Unsupported checkout plan' })
    }
    const resolvedBillingCycle: BillingCycle =
      billingCycle === 'daily_test' ? 'daily_test' : 'annual'
    if (plan === 'org' && resolvedBillingCycle !== 'annual') {
      return res.status(400).json({ error: 'Unsupported billing cycle for organization checkout' })
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

      const { data: missingOrgLegalDocs, error: missingOrgLegalDocsError } = await supabase.rpc(
        'legal_missing_documents',
        {
          p_context: 'checkout_org',
          p_organization_id: Number(organizationId),
        },
      )

      if (missingOrgLegalDocsError) {
        console.error('Failed to check missing organization legal documents:', missingOrgLegalDocsError)
        return res.status(500).json({ error: 'Failed to verify required organization legal documents' })
      }

      if ((missingOrgLegalDocs?.length ?? 0) > 0) {
        return res.status(409).json({
          error:
            'Organization legal documents must be accepted before checkout. Please accept them and try again.',
        })
      }
    } else {
      const { data: hasPersonal, error: entitlementError } = await supabase.rpc(
        'api_user_has_active_personal_license',
      )

      if (entitlementError) {
        console.error('Failed to check existing personal entitlement:', entitlementError)
        return res.status(500).json({ error: 'Failed to verify existing license status' })
      }

      if (hasPersonal === true) {
        return res.status(409).json({ error: 'You already have an active personal license' })
      }
    }

    const language =
      userData?.language || req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'de'

    // Create the Payrexx Gateway (or mock checkout)
    const isDailyTestCheckout = plan === 'annual' && resolvedBillingCycle === 'daily_test'
    const result = await paymentProvider.createCheckoutSession({
      plan,
      qty: plan === 'org' ? quantity : undefined,
      userId: user.id,
      organizationId: plan === 'org' ? Number(organizationId) : undefined,
      userEmail: user.email,
      firstName: userData?.first_name || undefined,
      lastName: userData?.last_name || undefined,
      language,
      customAmountCents: isDailyTestCheckout ? DAILY_TEST_PRICE_CENTS : undefined,
      customPurpose: isDailyTestCheckout
        ? 'EduTime Daily Test Auto-Renew (CHF 1/day)'
        : undefined,
      customBasket: isDailyTestCheckout
        ? [
            {
              name: [
                'EduTime Test-Abo täglich',
                'EduTime Test subscription daily',
                'Abonnement de test EduTime quotidien',
              ],
              description: [
                'Temporäres Testabo für Auto-Renew (1 CHF pro Tag)',
                'Temporary auto-renew test subscription (CHF 1 per day)',
                "Abonnement de test temporaire auto-renouvelable (1 CHF par jour)",
              ],
              quantity: 1,
              amount: DAILY_TEST_PRICE_CENTS,
            },
          ]
        : undefined,
      customSubscriptionState: isDailyTestCheckout ? true : undefined,
      customSubscriptionInterval: isDailyTestCheckout ? DAILY_TEST_INTERVAL : undefined,
      customSubscriptionPeriod: isDailyTestCheckout ? DAILY_TEST_INTERVAL : undefined,
    })

    const { amountCents, requiresCustomPricing } = calculateCheckoutAmount(plan, quantity)
    const checkoutAmountCents = isDailyTestCheckout ? DAILY_TEST_PRICE_CENTS : amountCents
    if (requiresCustomPricing) {
      return res.status(400).json({
        error: `Quantities above ${MAX_AUTO_PRICING_LICENSES} require custom pricing`,
      })
    }

    if (plan === 'org') {
      const { error: rpcError } = await supabase.rpc('api_create_org_checkout', {
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

      // Org admins are not auto-assigned a seat; they assign seats via member invites / seat management.
    } else {
      const { error: insertError } = await supabase.rpc('api_create_personal_checkout_session', {
        p_amount_cents: checkoutAmountCents,
        p_currency: 'CHF',
        p_reference_id: result.sessionId,
        p_payrexx_gateway_id: result.gatewayId || null,
        p_payrexx_gateway_link: result.checkoutUrl,
        p_billing_cycle: resolvedBillingCycle,
        p_expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        p_metadata: {
          source: 'web_checkout_api',
          plan: 'annual',
          billing_cycle: resolvedBillingCycle,
          user_id: user.id,
        },
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
