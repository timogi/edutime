import type { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from '@/utils/supabase/api-auth'

type CancelTrialResponse = {
  entitlementId?: string
  error?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<CancelTrialResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    if (!req.headers.authorization?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const auth = await getAuthenticatedUser(req)
    if (!auth) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { data: entitlementId, error } = await auth.supabase.rpc('api_cancel_active_trial_for_user')

    if (error) {
      console.error('Failed to cancel trial entitlement:', error)
      return res.status(400).json({ error: error.message || 'Failed to cancel trial' })
    }

    if (!entitlementId) {
      return res.status(404).json({ error: 'No active trial found' })
    }

    return res.status(200).json({ entitlementId: String(entitlementId) })
  } catch (error) {
    console.error('Cancel trial API failed:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
