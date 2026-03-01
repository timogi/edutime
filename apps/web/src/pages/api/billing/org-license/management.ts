import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { getAuthenticatedUser } from '@/utils/supabase/api-auth'

type OrgAdminRow = {
  user_id: string
  email: string | null
  created_at: string
}

type OrgManagementGetResponse = {
  organization?: {
    id: number
    name: string
    seats: number
  }
  admins?: OrgAdminRow[]
  billing?: {
    subscriptionId: string
    subscriptionStatus: string
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
    checkoutReferenceId: string | null
    responsibleEmail: string | null
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
        const { data: subscriptionsRows, error: subscriptionError } = await billingClient
          .from('subscriptions')
          .select('cancel_at_period_end, canceled_at')
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

        billing = {
          subscriptionId,
          subscriptionStatus: String(billingRow.subscription_status || ''),
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
          checkoutReferenceId:
            typeof billingRow.checkout_reference_id === 'string' ? billingRow.checkout_reference_id : null,
          responsibleEmail: typeof billingRow.responsible_email === 'string' ? billingRow.responsible_email : null,
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

      return res.status(400).json({ error: 'Unknown action' })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Org management API failed:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
