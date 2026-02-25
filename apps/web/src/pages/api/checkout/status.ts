import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { getAuthenticatedUser } from '@/utils/supabase/api-auth'

type CheckoutStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'expired'
  | 'unknown'

type ResponseData = {
  status?: CheckoutStatus
  hasActiveEntitlement?: boolean
  error?: string
}

const nowIso = () => new Date().toISOString()

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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const auth = await getAuthenticatedUser(req)
    if (!auth) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const referenceId = typeof req.query.ref === 'string' ? req.query.ref : null
    if (!referenceId) {
      return res.status(400).json({ error: 'Missing checkout reference' })
    }

    const billingClient = createBillingClient()
    const licenseClient = createLicenseClient()
    if (!billingClient || !licenseClient) {
      return res.status(500).json({ error: 'Missing billing configuration on server' })
    }

    const { data: sessionRow, error: sessionError } = await billingClient
      .from('checkout_sessions')
      .select('status, subscription_id')
      .eq('reference_id', referenceId)
      .eq('user_id', auth.user.id)
      .maybeSingle()

    if (sessionError) {
      console.error('Failed to read checkout session status:', sessionError)
      return res.status(500).json({ error: 'Could not read checkout status' })
    }

    if (!sessionRow) {
      return res.status(404).json({ error: 'Checkout session not found' })
    }

    const { data: activeEntitlements, error: entitlementError } = await licenseClient
      .from('entitlements')
      .select('id')
      .eq('user_id', auth.user.id)
      .eq('kind', 'personal')
      .eq('status', 'active')
      .lte('valid_from', nowIso())
      .or(`valid_until.is.null,valid_until.gte.${nowIso()}`)
      .limit(1)

    if (entitlementError) {
      console.error('Failed to read entitlement status:', entitlementError)
      return res.status(500).json({ error: 'Could not read entitlement status' })
    }

    const status = (sessionRow.status || 'unknown') as CheckoutStatus
    const hasActiveEntitlement = (activeEntitlements?.length ?? 0) > 0

    return res.status(200).json({ status, hasActiveEntitlement })
  } catch (error) {
    console.error('Failed to fetch checkout status:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
