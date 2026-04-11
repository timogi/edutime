import type { NextApiRequest, NextApiResponse } from 'next'
import { Json } from '@edutime/shared'
import { getAuthenticatedUser } from '@/utils/supabase/api-auth'

type BillingSubscriptionRow = {
  id: string
  provider: string
  provider_subscription_id: string | null
  status: string
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean | null
  canceled_at: string | null
  currency: string | null
  amount_cents: number | null
  created_at: string
}

type BillingInvoiceRow = {
  id: string
  amount_cents: number
  currency: string
  status: string
  provider_invoice_id: string | null
  paid_at: string | null
  created_at: string
}

type LicenseEntitlementRow = {
  id: string
  status: string
  valid_from: string
  valid_until: string | null
}

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

function asRecord(v: unknown): Record<string, unknown> | null {
  if (v != null && typeof v === 'object' && !Array.isArray(v)) {
    return v as Record<string, unknown>
  }
  return null
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

    const { data: summaryRaw, error } = await auth.supabase.rpc('api_get_personal_subscription_summary')

    if (error) {
      console.error('Failed to read personal subscription summary:', error)
      return res
        .status(500)
        .json({ subscription: null, invoices: [], entitlement: null, error: 'Could not read subscription' })
    }

    const summary = asRecord(summaryRaw as Json)
    if (!summary) {
      return res.status(200).json({ subscription: null, invoices: [], entitlement: null })
    }

    const subObj = asRecord(summary.subscription)
    const subscription = subObj
      ? {
          id: String(subObj.id ?? ''),
          provider: String(subObj.provider ?? ''),
          provider_subscription_id:
            subObj.provider_subscription_id == null ? null : String(subObj.provider_subscription_id),
          status: String(subObj.status ?? ''),
          current_period_start:
            subObj.current_period_start == null ? null : String(subObj.current_period_start),
          current_period_end:
            subObj.current_period_end == null ? null : String(subObj.current_period_end),
          cancel_at_period_end: Boolean(subObj.cancel_at_period_end),
          canceled_at: subObj.canceled_at == null ? null : String(subObj.canceled_at),
          currency: subObj.currency == null ? null : String(subObj.currency),
          amount_cents: subObj.amount_cents == null ? null : Number(subObj.amount_cents),
          created_at: String(subObj.created_at ?? ''),
        }
      : null

    const invoicesRaw = summary.invoices
    const invoices: PersonalSubscriptionResponse['invoices'] = Array.isArray(invoicesRaw)
      ? invoicesRaw.map((row) => {
          const inv = asRecord(row) || {}
          return {
            id: String(inv.id ?? ''),
            amount_cents: Number(inv.amount_cents ?? 0),
            currency: String(inv.currency ?? ''),
            status: String(inv.status ?? ''),
            provider_invoice_id: inv.provider_invoice_id == null ? null : String(inv.provider_invoice_id),
            paid_at: inv.paid_at == null ? null : String(inv.paid_at),
            created_at: String(inv.created_at ?? ''),
          }
        })
      : []

    const entObj = asRecord(summary.entitlement)
    const entitlement = entObj
      ? {
          id: String(entObj.id ?? ''),
          status: String(entObj.status ?? ''),
          valid_from: String(entObj.valid_from ?? ''),
          valid_until: entObj.valid_until == null ? null : String(entObj.valid_until),
        }
      : null

    return res.status(200).json({
      subscription,
      invoices,
      entitlement,
    })
  } catch (error) {
    console.error('Failed to fetch personal subscription management data:', error)
    return res
      .status(500)
      .json({ subscription: null, invoices: [], entitlement: null, error: 'Internal server error' })
  }
}
