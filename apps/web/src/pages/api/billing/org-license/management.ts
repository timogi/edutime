import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { getAuthenticatedUser } from '@/utils/supabase/api-auth'
import { paymentProvider } from '@/utils/payments'
import { createPayrexxClientFromEnv } from '@/utils/payments/payrexxClient'
import {
  calculateCheckoutAmount,
  MAX_AUTO_PRICING_LICENSES,
  MIN_ORG_LICENSES,
} from '@/utils/payments/pricing'

type OrgAdminRow = {
  user_id: string
  email: string | null
  created_at: string
}

type PayrexxInvoicePaymentInfo = {
  iban: string | null
  bankName: string | null
  reference: string | null
}

type OrgSubscriptionStatus = 'active' | 'active_unpaid' | 'suspended'

type OrgManagementGetResponse = {
  organization?: {
    id: number
    name: string
    seats: number
  }
  admins?: OrgAdminRow[]
  billing?: {
    subscriptionId: string
    subscriptionStatus: OrgSubscriptionStatus
    amountCents: number
    currency: string
    seatCount: number | null
    currentPeriodStart: string | null
    currentPeriodEnd: string | null
    cancelAtPeriodEnd: boolean
    canceledAt: string | null
    graceDays: number
    suspendAt: string | null
    invoiceId: string | null
    invoiceStatus: string | null
    invoiceDueDate: string | null
    invoicePaidAt: string | null
    payrexxGatewayLink: string | null
    payrexxInvoicePaymentLink: string | null
    payrexxInvoicePaymentInfo: PayrexxInvoicePaymentInfo | null
    checkoutReferenceId: string | null
    responsibleEmail: string | null
    nextPeriodSeatCount: number | null
    invoices: Array<{
      id: string
      amount_cents: number
      currency: string
      status: string
      provider_invoice_id: string | null
      paid_at: string | null
      created_at: string
    }>
  } | null
  error?: string
}

type OrgManagementMutationResponse = {
  success?: boolean
  organizationName?: string
  adminUserId?: string
  subscriptionId?: string
  checkoutUrl?: string
  seatAdjustmentPreview?: {
    currentSeatCount: number
    targetSeatCount: number
    isIncrease: boolean
    daysUntilPeriodEnd: number
    currentAnnualAmountCents: number
    nextAnnualAmountCents: number
    annualDeltaCents: number
    proratedAmountCents: number
    paymentRequired: boolean
    graceWindowApplied: boolean
    autoRenewEnabled: boolean
  }
  paymentRequired?: boolean
  proratedAmountCents?: number
  graceWindowApplied?: boolean
  error?: string
}

const DAY_MS = 24 * 60 * 60 * 1000

const normalizeOrgSubscriptionStatus = (params: {
  rawStatus: unknown
  invoiceStatus: unknown
  suspendAt: unknown
}): OrgSubscriptionStatus => {
  const rawStatus = typeof params.rawStatus === 'string' ? params.rawStatus.trim().toLowerCase() : ''
  const invoiceStatus = typeof params.invoiceStatus === 'string' ? params.invoiceStatus.trim().toLowerCase() : ''
  const suspendAt =
    typeof params.suspendAt === 'string' && params.suspendAt.trim().length > 0 ? params.suspendAt : null

  if (rawStatus === 'suspended' || rawStatus.includes('suspend')) {
    return 'suspended'
  }
  if (
    rawStatus === 'active_unpaid' ||
    rawStatus === 'unpaid' ||
    rawStatus === 'payment_pending' ||
    rawStatus === 'pending_payment'
  ) {
    return 'active_unpaid'
  }
  if (rawStatus === 'active' || rawStatus === 'active_paid' || rawStatus === 'paid') {
    return 'active'
  }

  if (suspendAt) {
    const suspendAtMs = Date.parse(suspendAt)
    if (Number.isFinite(suspendAtMs) && suspendAtMs <= Date.now()) {
      return 'suspended'
    }
  }

  if (invoiceStatus === 'open' || invoiceStatus === 'draft' || invoiceStatus === 'failed') {
    return 'active_unpaid'
  }

  return 'active'
}

const roundDownToFiveRappen = (amountCents: number): number => {
  if (!Number.isFinite(amountCents) || amountCents <= 0) return 0
  return Math.floor(amountCents / 5) * 5
}

const buildSeatAdjustmentPreview = (params: {
  currentSeatCount: number
  targetSeatCount: number
  periodStartMs: number
  periodEndMs: number
  autoRenewEnabled: boolean
}) => {
  const { currentSeatCount, targetSeatCount, periodStartMs, periodEndMs, autoRenewEnabled } = params
  const nowMs = Date.now()
  const remainingMs = Math.max(0, periodEndMs - nowMs)
  const periodMs = periodEndMs - periodStartMs
  const remainingRatio = Math.max(0, Math.min(1, remainingMs / periodMs))
  const daysUntilPeriodEnd = Math.ceil(remainingMs / DAY_MS)
  const isIncrease = targetSeatCount > currentSeatCount
  const graceWindowApplied = isIncrease && remainingMs <= 30 * DAY_MS

  const annualCurrentAmount = calculateCheckoutAmount('org', currentSeatCount)
  const annualTargetAmount = calculateCheckoutAmount('org', targetSeatCount)
  const annualDeltaCents = Math.max(0, annualTargetAmount.amountCents - annualCurrentAmount.amountCents)
  const proratedRawCents = annualDeltaCents * remainingRatio
  const proratedAmountCents = isIncrease && !graceWindowApplied ? roundDownToFiveRappen(proratedRawCents) : 0
  const paymentRequired = isIncrease && !graceWindowApplied && proratedAmountCents > 0

  return {
    currentSeatCount,
    targetSeatCount,
    isIncrease,
    daysUntilPeriodEnd,
    currentAnnualAmountCents: annualCurrentAmount.amountCents,
    nextAnnualAmountCents: annualTargetAmount.amountCents,
    annualDeltaCents,
    proratedAmountCents,
    paymentRequired,
    graceWindowApplied,
    autoRenewEnabled,
  }
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

function createPublicClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return null
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

const mapRpcError = (error: { message?: string }, fallback: string) => {
  const message = error?.message || fallback
  if (message.toLowerCase().includes('not authorized')) {
    return { status: 403, error: message }
  }
  if (
    message.toLowerCase().includes('not found') ||
    message.toLowerCase().includes('missing') ||
    message.toLowerCase().includes('invalid') ||
    message.toLowerCase().includes('cannot remove the last organization admin') ||
    message.toLowerCase().includes('cannot remove your own organization admin role') ||
    message.toLowerCase().includes('new checkout required') ||
    message.toLowerCase().includes('no user found for email')
  ) {
    return { status: 400, error: message }
  }
  return { status: 500, error: fallback }
}

const ensureOrganizationLegalAccepted = async (params: {
  organizationId: number
  userSupabase: ReturnType<typeof getAuthenticatedUser> extends Promise<infer R>
    ? R extends { supabase: infer S }
      ? S
      : never
    : never
}) => {
  const { organizationId, userSupabase } = params
  const { data: missingDocs, error: missingDocsError } = await userSupabase.rpc(
    'legal_missing_documents',
    {
      p_context: 'checkout_org',
      p_organization_id: organizationId,
    },
  )

  if (missingDocsError) {
    return { status: 500, error: 'Failed to verify required organization legal documents' as const }
  }

  if ((missingDocs?.length ?? 0) > 0) {
    return {
      status: 409,
      error:
        'Organization legal documents must be accepted before managing this organization.' as const,
    }
  }

  return null
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OrgManagementGetResponse | OrgManagementMutationResponse>,
) {
  try {
    const auth = await getAuthenticatedUser(req)
    if (!auth) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const billingClient = createBillingClient()
    const publicClient = createPublicClient()
    if (!billingClient || !publicClient) {
      return res.status(500).json({ error: 'Missing billing configuration on server' })
    }

    if (req.method === 'GET') {
      const organizationId = Number(req.query.organizationId)
      if (!Number.isInteger(organizationId) || organizationId <= 0) {
        return res.status(400).json({ error: 'Missing or invalid organizationId' })
      }

      const legalCheck = await ensureOrganizationLegalAccepted({
        organizationId,
        userSupabase: auth.supabase,
      })
      if (legalCheck) {
        return res.status(legalCheck.status).json({ error: legalCheck.error })
      }

      const { data: org, error: orgError } = await publicClient
        .from('organizations')
        .select('id, name, seats')
        .eq('id', organizationId)
        .single()

      if (orgError || !org) {
        return res.status(404).json({ error: 'Organization not found' })
      }

      const { data: adminsData, error: adminsError } = await billingClient.rpc('list_organization_admins', {
        p_actor_user_id: auth.user.id,
        p_organization_id: organizationId,
      })

      if (adminsError) {
        const mapped = mapRpcError(adminsError, 'Failed to load organization admins')
        return res.status(mapped.status).json({ error: mapped.error })
      }

      const admins = ((adminsData as OrgAdminRow[] | null) || []).map((admin) => ({
        user_id: admin.user_id,
        email: admin.email,
        created_at: admin.created_at,
      }))

      const { data: billingData, error: billingError } = await billingClient.rpc('get_org_billing_status', {
        p_actor_user_id: auth.user.id,
        p_organization_id: organizationId,
      })

      if (billingError) {
        const mapped = mapRpcError(billingError, 'Failed to load org billing status')
        return res.status(mapped.status).json({ error: mapped.error })
      }

      const billingRow =
        Array.isArray(billingData) && billingData.length > 0 ? (billingData[0] as Record<string, unknown>) : null

      let billing: OrgManagementGetResponse['billing'] = null
      if (billingRow) {
        const subscriptionId = String(billingRow.subscription_id || '')
        const payrexxClient = createPayrexxClientFromEnv()
        const { data: subscriptionsRows, error: subscriptionError } = await billingClient
          .from('subscriptions')
          .select('cancel_at_period_end, canceled_at, metadata')
          .eq('id', subscriptionId)
          .limit(1)
          .maybeSingle()

        if (subscriptionError) {
          return res.status(500).json({ error: 'Failed to load organization subscription lifecycle status' })
        }

        const { data: invoicesRows, error: invoicesError } = await billingClient
          .from('invoices')
          .select('id, amount_cents, currency, status, provider_invoice_id, paid_at, created_at')
          .eq('subscription_id', subscriptionId)
          .order('created_at', { ascending: false })
          .limit(30)

        if (invoicesError) {
          return res.status(500).json({ error: 'Failed to load organization invoice history' })
        }

        let payrexxInvoicePaymentLink: string | null = null
        let payrexxInvoicePaymentInfo: PayrexxInvoicePaymentInfo | null = null
        const openInvoice = (invoicesRows || []).find((invoice) => invoice.status === 'open')
        const providerTransactionId = Number(openInvoice?.provider_invoice_id || '')

        if (payrexxClient && Number.isFinite(providerTransactionId) && providerTransactionId > 0) {
          try {
            const txResponse = await payrexxClient.getTransaction(providerTransactionId)
            const tx = txResponse.data?.[0]
            if (tx) {
              const invoiceInfo = tx.payment?.purchaseOnInvoiceInformation || tx.purchaseOnInvoiceInformation
              payrexxInvoicePaymentLink =
                typeof tx.invoice?.paymentLink === 'string' && tx.invoice.paymentLink.length > 0
                  ? tx.invoice.paymentLink
                  : null
              payrexxInvoicePaymentInfo = {
                iban: invoiceInfo?.iban || null,
                bankName: invoiceInfo?.bankName || null,
                reference: invoiceInfo?.reference || null,
              }
            }
          } catch (error) {
            console.error('Failed to load Payrexx transaction details for open invoice', {
              providerTransactionId,
              error,
            })
          }
        }

        billing = {
          subscriptionId,
          subscriptionStatus: normalizeOrgSubscriptionStatus({
            rawStatus: billingRow.subscription_status,
            invoiceStatus: billingRow.invoice_status,
            suspendAt: billingRow.suspend_at,
          }),
          amountCents: Number(billingRow.amount_cents || 0),
          currency: String(billingRow.currency || 'CHF'),
          seatCount: billingRow.seat_count == null ? null : Number(billingRow.seat_count),
          currentPeriodStart:
            typeof billingRow.current_period_start === 'string' ? billingRow.current_period_start : null,
          currentPeriodEnd: typeof billingRow.current_period_end === 'string' ? billingRow.current_period_end : null,
          cancelAtPeriodEnd: Boolean(subscriptionsRows?.cancel_at_period_end),
          canceledAt: subscriptionsRows?.canceled_at || null,
          graceDays: Number(billingRow.grace_days || 0),
          suspendAt: typeof billingRow.suspend_at === 'string' ? billingRow.suspend_at : null,
          invoiceId: typeof billingRow.invoice_id === 'string' ? billingRow.invoice_id : null,
          invoiceStatus: typeof billingRow.invoice_status === 'string' ? billingRow.invoice_status : null,
          invoiceDueDate: typeof billingRow.invoice_due_date === 'string' ? billingRow.invoice_due_date : null,
          invoicePaidAt: typeof billingRow.invoice_paid_at === 'string' ? billingRow.invoice_paid_at : null,
          payrexxGatewayLink:
            typeof billingRow.payrexx_gateway_link === 'string' ? billingRow.payrexx_gateway_link : null,
          payrexxInvoicePaymentLink,
          payrexxInvoicePaymentInfo,
          checkoutReferenceId:
            typeof billingRow.checkout_reference_id === 'string' ? billingRow.checkout_reference_id : null,
          responsibleEmail: typeof billingRow.responsible_email === 'string' ? billingRow.responsible_email : null,
          nextPeriodSeatCount:
            subscriptionsRows?.metadata &&
            typeof subscriptionsRows.metadata === 'object' &&
            subscriptionsRows.metadata !== null &&
            'next_period_seat_count' in subscriptionsRows.metadata
              ? Number((subscriptionsRows.metadata as Record<string, unknown>).next_period_seat_count)
              : null,
          invoices: invoicesRows || [],
        }
      }

      return res.status(200).json({
        organization: {
          id: org.id,
          name: org.name,
          seats: org.seats,
        },
        admins,
        billing,
      })
    }

    if (req.method === 'PATCH') {
      const organizationId = Number(req.body?.organizationId)
      const name = String(req.body?.name || '').trim()
      if (!Number.isInteger(organizationId) || organizationId <= 0) {
        return res.status(400).json({ error: 'Missing or invalid organizationId' })
      }
      const legalCheck = await ensureOrganizationLegalAccepted({
        organizationId,
        userSupabase: auth.supabase,
      })
      if (legalCheck) {
        return res.status(legalCheck.status).json({ error: legalCheck.error })
      }
      if (!name) {
        return res.status(400).json({ error: 'Missing organization name' })
      }

      const { data, error } = await billingClient.rpc('update_organization_name', {
        p_actor_user_id: auth.user.id,
        p_organization_id: organizationId,
        p_name: name,
      })

      if (error) {
        const mapped = mapRpcError(error, 'Failed to update organization name')
        return res.status(mapped.status).json({ error: mapped.error })
      }

      return res.status(200).json({ success: true, organizationName: String(data || name) })
    }

    if (req.method === 'POST') {
      const action = String(req.body?.action || '')
      const organizationId = Number(req.body?.organizationId)
      if (!Number.isInteger(organizationId) || organizationId <= 0) {
        return res.status(400).json({ error: 'Missing or invalid organizationId' })
      }
      const legalCheck = await ensureOrganizationLegalAccepted({
        organizationId,
        userSupabase: auth.supabase,
      })
      if (legalCheck) {
        return res.status(legalCheck.status).json({ error: legalCheck.error })
      }

      if (action === 'addAdmin') {
        const email = String(req.body?.email || '').trim()
        if (!email) {
          return res.status(400).json({ error: 'Missing admin email' })
        }

        const { data, error } = await billingClient.rpc('add_organization_admin_by_email', {
          p_actor_user_id: auth.user.id,
          p_organization_id: organizationId,
          p_admin_email: email,
        })

        if (error) {
          const mapped = mapRpcError(error, 'Failed to add organization admin')
          return res.status(mapped.status).json({ error: mapped.error })
        }

        return res.status(200).json({ success: true, adminUserId: String(data || '') })
      }

      if (action === 'removeAdmin') {
        const removeUserId = String(req.body?.removeUserId || '').trim()
        if (!removeUserId) {
          return res.status(400).json({ error: 'Missing admin user id' })
        }

        const { data, error } = await billingClient.rpc('remove_organization_admin', {
          p_actor_user_id: auth.user.id,
          p_organization_id: organizationId,
          p_remove_user_id: removeUserId,
        })

        if (error) {
          const mapped = mapRpcError(error, 'Failed to remove organization admin')
          return res.status(mapped.status).json({ error: mapped.error })
        }

        return res.status(200).json({ success: true, adminUserId: String(data || removeUserId) })
      }

      if (action === 'adjustSeats') {
        const targetSeatCount = Number(req.body?.targetSeatCount)
        const confirm = Boolean(req.body?.confirm)
        if (!Number.isInteger(targetSeatCount) || targetSeatCount < MIN_ORG_LICENSES) {
          return res.status(400).json({
            error: `Organization checkout requires at least ${MIN_ORG_LICENSES} licenses`,
          })
        }
        if (targetSeatCount > MAX_AUTO_PRICING_LICENSES) {
          return res.status(400).json({
            error: `Quantities above ${MAX_AUTO_PRICING_LICENSES} require custom pricing`,
          })
        }

        const { data: billingData, error: billingError } = await billingClient.rpc('get_org_billing_status', {
          p_actor_user_id: auth.user.id,
          p_organization_id: organizationId,
        })
        if (billingError) {
          const mapped = mapRpcError(billingError, 'Failed to load org billing status')
          return res.status(mapped.status).json({ error: mapped.error })
        }

        const billingRow =
          Array.isArray(billingData) && billingData.length > 0 ? (billingData[0] as Record<string, unknown>) : null
        if (!billingRow) {
          return res.status(400).json({ error: 'No organization subscription found' })
        }

        const currentSeatCount = Number(billingRow.seat_count || 0)
        if (currentSeatCount < MIN_ORG_LICENSES) {
          return res.status(400).json({ error: 'Invalid current seat count' })
        }
        if (targetSeatCount === currentSeatCount) {
          return res.status(400).json({ error: 'Seat count unchanged' })
        }

        const currentPeriodStart = String(billingRow.current_period_start || '')
        const currentPeriodEnd = String(billingRow.current_period_end || '')
        const periodStartMs = Date.parse(currentPeriodStart)
        const periodEndMs = Date.parse(currentPeriodEnd)
        if (!Number.isFinite(periodStartMs) || !Number.isFinite(periodEndMs) || periodEndMs <= periodStartMs) {
          return res.status(400).json({ error: 'Invalid subscription period for seat adjustment' })
        }

        const subscriptionId = String(billingRow.subscription_id || '')
        const { data: subscriptionLifecycle } = await billingClient
          .from('subscriptions')
          .select('cancel_at_period_end')
          .eq('id', subscriptionId)
          .maybeSingle()
        const autoRenewEnabled = !Boolean(subscriptionLifecycle?.cancel_at_period_end)
        const preview = buildSeatAdjustmentPreview({
          currentSeatCount,
          targetSeatCount,
          periodStartMs,
          periodEndMs,
          autoRenewEnabled,
        })

        if (!confirm) {
          return res.status(200).json({
            success: true,
            seatAdjustmentPreview: preview,
            paymentRequired: preview.paymentRequired,
            proratedAmountCents: preview.proratedAmountCents,
            graceWindowApplied: preview.graceWindowApplied,
          })
        }

        const annualTargetAmount = { amountCents: preview.nextAnnualAmountCents }

        if (preview.paymentRequired) {
          const { data: profile } = await auth.supabase
            .from('users')
            .select('first_name, last_name, language')
            .eq('user_id', auth.user.id)
            .maybeSingle()

          const language =
            profile?.language || req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'de'

          const checkout = await paymentProvider.createCheckoutSession({
            plan: 'org',
            qty: targetSeatCount,
            organizationId,
            userId: auth.user.id,
            userEmail: auth.user.email,
            firstName: profile?.first_name || undefined,
            lastName: profile?.last_name || undefined,
            language,
            customAmountCents: preview.proratedAmountCents,
            customPurpose: `EduTime Organizationslizenzen Anpassung (+${targetSeatCount - currentSeatCount})`,
            customSubscriptionState: false,
            customBasket: [
              {
                name: [
                  'EduTime Organisationslizenzen Anpassung',
                  'EduTime Organization seat adjustment',
                  'EduTime ajustement des licences organisation',
                ],
                description: [
                  `+${targetSeatCount - currentSeatCount} Sitze, anteilig bis Periodenende`,
                  `+${targetSeatCount - currentSeatCount} seats, prorated until period end`,
                  `+${targetSeatCount - currentSeatCount} places, au prorata jusqu'a la fin de periode`,
                ],
                quantity: 1,
                amount: preview.proratedAmountCents,
              },
            ],
          })

          const { error: createError } = await billingClient.rpc('create_org_checkout', {
            p_actor_user_id: auth.user.id,
            p_organization_id: organizationId,
            p_quantity: targetSeatCount,
            p_amount_cents: preview.proratedAmountCents,
            p_currency: 'CHF',
            p_reference_id: checkout.sessionId,
            p_payrexx_gateway_id: checkout.gatewayId || null,
            p_payrexx_gateway_link: checkout.checkoutUrl,
            p_expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            p_due_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
            p_metadata: {
              source: 'org_management_seat_adjustment',
              actor_user_id: auth.user.id,
              current_seat_count: currentSeatCount,
              target_seat_count: targetSeatCount,
              annual_delta_cents: preview.annualDeltaCents,
              prorated_amount_cents: preview.proratedAmountCents,
              next_period_seat_count: targetSeatCount,
            },
          })
          if (createError) {
            const mapped = mapRpcError(createError, 'Failed to create seat adjustment checkout')
            return res.status(mapped.status).json({ error: mapped.error })
          }

          // Keep annual subscription amount on target annual price while checkout is prorated.
          const { error: planError } = await billingClient.rpc('update_org_seat_plan', {
            p_actor_user_id: auth.user.id,
            p_organization_id: organizationId,
            p_target_seat_count: targetSeatCount,
            p_apply_immediately: true,
            p_next_annual_amount_cents: annualTargetAmount.amountCents,
            p_metadata: {
              source: 'org_management_seat_adjustment_checkout',
            },
          })
          if (planError) {
            const mapped = mapRpcError(planError, 'Failed to persist seat plan after checkout creation')
            return res.status(mapped.status).json({ error: mapped.error })
          }

          return res.status(200).json({
            success: true,
            paymentRequired: true,
            proratedAmountCents: preview.proratedAmountCents,
            graceWindowApplied: false,
            checkoutUrl: checkout.checkoutUrl,
            seatAdjustmentPreview: preview,
          })
        }

        const { error: planError } = await billingClient.rpc('update_org_seat_plan', {
          p_actor_user_id: auth.user.id,
          p_organization_id: organizationId,
          p_target_seat_count: targetSeatCount,
          p_apply_immediately: true,
          p_next_annual_amount_cents: annualTargetAmount.amountCents,
          p_metadata: {
            source: 'org_management_seat_adjustment',
            current_seat_count: currentSeatCount,
            target_seat_count: targetSeatCount,
            grace_window_applied: preview.graceWindowApplied,
          },
        })
        if (planError) {
          const mapped = mapRpcError(planError, 'Failed to update organization seat plan')
          return res.status(mapped.status).json({ error: mapped.error })
        }

        return res.status(200).json({
          success: true,
          paymentRequired: false,
          proratedAmountCents: 0,
          graceWindowApplied: preview.graceWindowApplied,
          seatAdjustmentPreview: preview,
        })
      }

      if (action === 'cancel') {
        const { data, error } = await billingClient.rpc('cancel_org_subscription_at_period_end', {
          p_actor_user_id: auth.user.id,
          p_organization_id: organizationId,
        })

        if (error) {
          const mapped = mapRpcError(error, 'Failed to cancel organization subscription')
          return res.status(mapped.status).json({ error: mapped.error })
        }

        return res.status(200).json({ success: true, subscriptionId: String(data || '') })
      }

      if (action === 'reactivate') {
        const { data, error } = await billingClient.rpc('reactivate_org_subscription', {
          p_actor_user_id: auth.user.id,
          p_organization_id: organizationId,
        })

        if (error) {
          const mapped = mapRpcError(error, 'Failed to reactivate organization subscription')
          return res.status(mapped.status).json({ error: mapped.error })
        }

        return res.status(200).json({ success: true, subscriptionId: String(data || '') })
      }

      if (action === 'deactivateOrg') {
        const { error: revokeError } = await billingClient.rpc('deactivate_organization_revoke_access', {
          p_actor_user_id: auth.user.id,
          p_organization_id: organizationId,
        })

        if (revokeError) {
          const mapped = mapRpcError(revokeError, 'Failed to deactivate organization')
          return res.status(mapped.status).json({ error: mapped.error })
        }

        const { error: cancelError } = await billingClient.rpc('cancel_org_subscription_at_period_end', {
          p_actor_user_id: auth.user.id,
          p_organization_id: organizationId,
        })

        if (cancelError && !String(cancelError.message || '').toLowerCase().includes('no organization subscription found')) {
          const mapped = mapRpcError(cancelError, 'Failed to cancel organization subscription during deactivation')
          return res.status(mapped.status).json({ error: mapped.error })
        }

        return res.status(200).json({ success: true })
      }

      return res.status(400).json({ error: 'Unknown action' })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Org management API failed:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
