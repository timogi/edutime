import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { getAuthenticatedUser } from '@/utils/supabase/api-auth'
import { paymentProvider } from '@/utils/payments'
import {
  calculateCheckoutAmount,
  MAX_AUTO_PRICING_LICENSES,
  MIN_ORG_LICENSES,
} from '@/utils/payments/pricing'

type OrgBillingStatusResponse = {
  data?: {
    subscriptionId: string
    subscriptionStatus: string
    amountCents: number
    currency: string
    seatCount: number | null
    currentPeriodStart: string | null
    currentPeriodEnd: string | null
    graceDays: number
    suspendAt: string | null
    invoiceId: string | null
    invoiceStatus: string | null
    invoiceDueDate: string | null
    invoicePaidAt: string | null
    payrexxGatewayLink: string | null
    checkoutReferenceId: string | null
    responsibleEmail: string | null
  } | null
  checkoutUrl?: string
  sessionId?: string
  error?: string
}

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OrgBillingStatusResponse>,
) {
  try {
    const auth = await getAuthenticatedUser(req)
    if (!auth) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const billingClient = createBillingClient()
    if (!billingClient) {
      return res.status(500).json({ error: 'Missing billing configuration on server' })
    }

    if (req.method === 'GET') {
      const organizationId = Number(req.query.organizationId)
      if (!Number.isInteger(organizationId) || organizationId <= 0) {
        return res.status(400).json({ error: 'Missing or invalid organizationId' })
      }

      const { data, error } = await billingClient.rpc('get_org_billing_status', {
        p_actor_user_id: auth.user.id,
        p_organization_id: organizationId,
      })

      if (error) {
        console.error('Failed to load org billing status:', error)
        return res.status(500).json({ error: 'Failed to load org billing status' })
      }

      const row = Array.isArray(data) && data.length > 0 ? data[0] : null
      if (!row) {
        return res.status(200).json({ data: null })
      }

      return res.status(200).json({
        data: {
          subscriptionId: row.subscription_id,
          subscriptionStatus: row.subscription_status,
          amountCents: row.amount_cents,
          currency: row.currency,
          seatCount: row.seat_count,
          currentPeriodStart: row.current_period_start,
          currentPeriodEnd: row.current_period_end,
          graceDays: row.grace_days,
          suspendAt: row.suspend_at,
          invoiceId: row.invoice_id,
          invoiceStatus: row.invoice_status,
          invoiceDueDate: row.invoice_due_date,
          invoicePaidAt: row.invoice_paid_at,
          payrexxGatewayLink: row.payrexx_gateway_link,
          checkoutReferenceId: row.checkout_reference_id,
          responsibleEmail: row.responsible_email,
        },
      })
    }

    if (req.method === 'POST') {
      const organizationId = Number(req.body.organizationId)
      const quantity = Number(req.body.quantity)

      if (!Number.isInteger(organizationId) || organizationId <= 0) {
        return res.status(400).json({ error: 'Missing or invalid organizationId' })
      }
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

      const { data: profile, error: profileError } = await auth.supabase
        .from('users')
        .select('first_name, last_name, language')
        .eq('user_id', auth.user.id)
        .single()

      if (profileError) {
        console.error('Failed to load user profile for org checkout:', profileError)
      }

      const language =
        profile?.language || req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'de'
      const checkout = await paymentProvider.createCheckoutSession({
        plan: 'org',
        qty: quantity,
        organizationId,
        userId: auth.user.id,
        userEmail: auth.user.email,
        firstName: profile?.first_name || undefined,
        lastName: profile?.last_name || undefined,
        language,
      })

      const { amountCents, requiresCustomPricing } = calculateCheckoutAmount('org', quantity)
      if (requiresCustomPricing) {
        return res.status(400).json({
          error: `Quantities above ${MAX_AUTO_PRICING_LICENSES} require custom pricing`,
        })
      }

      const { error: createError } = await billingClient.rpc('create_org_checkout', {
        p_actor_user_id: auth.user.id,
        p_organization_id: organizationId,
        p_quantity: quantity,
        p_amount_cents: amountCents,
        p_currency: 'CHF',
        p_reference_id: checkout.sessionId,
        p_payrexx_gateway_id: checkout.gatewayId || null,
        p_payrexx_gateway_link: checkout.checkoutUrl,
        p_expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        p_due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        p_metadata: {
          source: 'org_license_api',
          actor_user_id: auth.user.id,
        },
      })

      if (createError) {
        console.error('Failed to create org checkout:', createError)
        return res.status(500).json({ error: 'Failed to initialize org checkout' })
      }

      // Org admins are not auto-assigned a seat; they assign seats via member invites / seat management.

      return res.status(200).json({
        checkoutUrl: checkout.checkoutUrl,
        sessionId: checkout.sessionId,
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Org license API failed:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
