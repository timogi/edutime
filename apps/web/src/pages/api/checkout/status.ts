import type { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from '@/utils/supabase/api-auth'

type CheckoutStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'expired'
  | 'unknown'

type CheckoutPlan = 'annual' | 'org'

type ResponseData = {
  status?: CheckoutStatus
  hasActiveEntitlement?: boolean
  plan?: CheckoutPlan
  error?: string
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

    const { data: raw, error } = await auth.supabase.rpc('api_get_checkout_completion_state', {
      p_reference_id: referenceId,
    })

    if (error) {
      console.error('Failed to read checkout completion state:', error)
      return res.status(500).json({ error: 'Could not read checkout status' })
    }

    const row = raw as Record<string, unknown> | null
    if (!row || row.found !== true) {
      return res.status(404).json({ error: 'Checkout session not found' })
    }

    const status = (typeof row.status === 'string' ? row.status : 'unknown') as CheckoutStatus
    const planRaw = row.plan
    const plan =
      planRaw === 'org' ? 'org' : planRaw === 'annual' ? 'annual' : undefined

    const hasActiveEntitlement = row.has_active_entitlement === true

    return res.status(200).json({ status, hasActiveEntitlement, plan })
  } catch (error) {
    console.error('Failed to fetch checkout status:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
