import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@edutime/shared'
import { getAuthenticatedUser } from '@/utils/supabase/api-auth'

type BillingSubscriptionRow = Database['billing']['Tables']['subscriptions']['Row']
type BillingInvoiceRow = Database['billing']['Tables']['invoices']['Row']
type LicenseEntitlementRow = Database['license']['Tables']['entitlements']['Row']

type PersonalSubscriptionResponse = {
  subscription: Pick<
    BillingSubscriptionRow,
    | 'id'
    | 'provider'
    | 'provider_subscription_id'
    | 'status'
    | 'current_period_start'
    | 'current_period_end'
    | 'cancel_at_period_end'
    | 'canceled_at'
    | 'currency'
    | 'amount_cents'
    | 'created_at'
  > | null
  invoices: Array<
    Pick<
      BillingInvoiceRow,
      'id' | 'amount_cents' | 'currency' | 'status' | 'provider_invoice_id' | 'paid_at' | 'created_at'
    >
  >
  entitlement: Pick<LicenseEntitlementRow, 'id' | 'status' | 'valid_from' | 'valid_until'> | null
  error?: string
}

const nowIso = () => new Date().toISOString()

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PersonalSubscriptionResponse>,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ subscription: null, invoices: [], entitlement: null, error: 'Method not allowed' })
  }

  try {
    const auth = await getAuthenticatedUser(req)
    if (!auth) {
      return res.status(401).json({ subscription: null, invoices: [], entitlement: null, error: 'Unauthorized' })
    }

    const billingClient = createBillingClient()
    const licenseClient = createLicenseClient()
    if (!billingClient || !licenseClient) {
      return res
        .status(500)
        .json({ subscription: null, invoices: [], entitlement: null, error: 'Missing billing configuration on server' })
    }

    const { data: subscriptionRow, error: subscriptionError } = await billingClient
      .from('subscriptions')
      .select(
        `
          id,
          provider,
          provider_subscription_id,
          status,
          current_period_start,
          current_period_end,
          cancel_at_period_end,
          canceled_at,
          currency,
          amount_cents,
          created_at,
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
      console.error('Failed to read personal subscription:', subscriptionError)
      return res
        .status(500)
        .json({ subscription: null, invoices: [], entitlement: null, error: 'Could not read subscription' })
    }

    const subscription = subscriptionRow
      ? {
          id: subscriptionRow.id,
          provider: subscriptionRow.provider,
          provider_subscription_id: subscriptionRow.provider_subscription_id,
          status: subscriptionRow.status,
          current_period_start: subscriptionRow.current_period_start,
          current_period_end: subscriptionRow.current_period_end,
          cancel_at_period_end: subscriptionRow.cancel_at_period_end,
          canceled_at: subscriptionRow.canceled_at,
          currency: subscriptionRow.currency,
          amount_cents: subscriptionRow.amount_cents,
          created_at: subscriptionRow.created_at,
        }
      : null

    let invoices: PersonalSubscriptionResponse['invoices'] = []
    if (subscription?.id) {
      const { data: invoiceRows, error: invoicesError } = await billingClient
        .from('invoices')
        .select('id, amount_cents, currency, status, provider_invoice_id, paid_at, created_at')
        .eq('subscription_id', subscription.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (invoicesError) {
        console.error('Failed to read personal subscription invoices:', invoicesError)
        return res
          .status(500)
          .json({ subscription: null, invoices: [], entitlement: null, error: 'Could not read invoice history' })
      }

      invoices = invoiceRows || []
    }

    const { data: entitlementRow, error: entitlementError } = await licenseClient
      .from('entitlements')
      .select('id, status, valid_from, valid_until')
      .eq('user_id', auth.user.id)
      .eq('kind', 'personal')
      .eq('status', 'active')
      .lte('valid_from', nowIso())
      .or(`valid_until.is.null,valid_until.gte.${nowIso()}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (entitlementError) {
      console.error('Failed to read personal entitlement:', entitlementError)
      return res
        .status(500)
        .json({ subscription: null, invoices: [], entitlement: null, error: 'Could not read entitlement' })
    }

    return res.status(200).json({
      subscription,
      invoices,
      entitlement: entitlementRow || null,
    })
  } catch (error) {
    console.error('Failed to fetch personal subscription management data:', error)
    return res.status(500).json({ subscription: null, invoices: [], entitlement: null, error: 'Internal server error' })
  }
}
