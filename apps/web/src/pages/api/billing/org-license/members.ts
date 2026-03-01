import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { getAuthenticatedUser } from '@/utils/supabase/api-auth'

type MembersApiResponse = {
  inviteId?: string
  entitlementId?: string
  releasedEntitlementId?: string | null
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

export default async function handler(req: NextApiRequest, res: NextApiResponse<MembersApiResponse>) {
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

    const billingClient = createBillingClient()
    if (!billingClient) {
      return res.status(500).json({ error: 'Missing billing configuration on server' })
    }

    const action = String(req.body?.action || '')

    if (action === 'invite') {
      const organizationId = Number(req.body?.organizationId)
      const email = String(req.body?.email || '').trim()
      const comment = typeof req.body?.comment === 'string' ? req.body.comment : null

      if (!Number.isInteger(organizationId) || organizationId <= 0) {
        return res.status(400).json({ error: 'Missing or invalid organizationId' })
      }
      if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Missing or invalid member email' })
      }

      const { data, error } = await billingClient.rpc('create_org_member_invite', {
        p_actor_user_id: auth.user.id,
        p_organization_id: organizationId,
        p_email: email,
        p_comment: comment,
      })

      if (error) {
        console.error('Failed to create org member invite:', error)
        return res.status(400).json({ error: error.message || 'Failed to invite member' })
      }

      return res.status(200).json({ inviteId: String(data) })
    }

    if (action === 'accept') {
      const organizationId = Number(req.body?.organizationId)
      if (!Number.isInteger(organizationId) || organizationId <= 0) {
        return res.status(400).json({ error: 'Missing or invalid organizationId' })
      }

      const { data, error } = await billingClient.rpc('accept_org_member_invite', {
        p_actor_user_id: auth.user.id,
        p_organization_id: organizationId,
      })

      if (error) {
        console.error('Failed to accept org invite:', error)
        return res.status(400).json({ error: error.message || 'Failed to accept invite' })
      }

      return res.status(200).json({ entitlementId: data ? String(data) : undefined })
    }

    if (action === 'reject') {
      const organizationId = Number(req.body?.organizationId)
      if (!Number.isInteger(organizationId) || organizationId <= 0) {
        return res.status(400).json({ error: 'Missing or invalid organizationId' })
      }

      const { error } = await billingClient.rpc('reject_org_member_invite', {
        p_actor_user_id: auth.user.id,
        p_organization_id: organizationId,
      })

      if (error) {
        console.error('Failed to reject org invite:', error)
        return res.status(400).json({ error: error.message || 'Failed to reject invite' })
      }

      return res.status(200).json({})
    }

    if (action === 'release') {
      const organizationId = Number(req.body?.organizationId)
      const membershipId = Number(req.body?.membershipId)
      if (!Number.isInteger(organizationId) || organizationId <= 0) {
        return res.status(400).json({ error: 'Missing or invalid organizationId' })
      }
      if (!Number.isInteger(membershipId) || membershipId <= 0) {
        return res.status(400).json({ error: 'Missing or invalid membershipId' })
      }

      const { data, error } = await billingClient.rpc('release_org_member_seat', {
        p_actor_user_id: auth.user.id,
        p_organization_id: organizationId,
        p_membership_id: membershipId,
      })

      if (error) {
        console.error('Failed to release org member seat:', error)
        return res.status(400).json({ error: error.message || 'Failed to release seat' })
      }

      return res.status(200).json({ releasedEntitlementId: data ? String(data) : null })
    }

    return res.status(400).json({ error: 'Unknown action' })
  } catch (error) {
    console.error('Org members API failed:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
