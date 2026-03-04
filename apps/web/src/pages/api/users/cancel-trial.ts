import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { getAuthenticatedUser } from '@/utils/supabase/api-auth'

type CancelTrialResponse = {
  entitlementId?: string
  error?: string
}

function createServiceClient() {
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

    const serviceClient = createServiceClient()
    if (!serviceClient) {
      return res.status(500).json({ error: 'Missing billing configuration on server' })
    }

    const { data: trialEntitlement, error: trialLoadError } = await serviceClient
      .schema('license')
      .from('entitlements')
      .select('id')
      .eq('user_id', auth.user.id)
      .eq('kind', 'trial')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (trialLoadError) {
      console.error('Failed to load active trial entitlement:', trialLoadError)
      return res.status(400).json({ error: trialLoadError.message || 'Failed to cancel trial' })
    }

    if (!trialEntitlement) {
      return res.status(404).json({ error: 'No active trial found' })
    }

    const { error: updateError } = await serviceClient
      .schema('license')
      .from('entitlements')
      .update({
        status: 'expired',
        updated_at: new Date().toISOString(),
      })
      .eq('id', trialEntitlement.id)

    if (updateError) {
      console.error('Failed to cancel trial entitlement:', updateError)
      return res.status(400).json({ error: updateError.message || 'Failed to cancel trial' })
    }

    return res.status(200).json({ entitlementId: trialEntitlement.id })
  } catch (error) {
    console.error('Cancel trial API failed:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
