import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { getAuthenticatedUser } from '@/utils/supabase/api-auth'
import { EDUTIME_TRANSACTIONAL_FROM } from '@edutime/shared'
import {
  resolveOrgInviteEmailLocale,
  sendOrgMemberInviteEmail,
} from '@/utils/email/orgMemberInviteEmail'

type MembersApiResponse = {
  inviteId?: string
  /** Present after `invite` when the invite was created successfully. */
  emailSent?: boolean
  /** True when invitee is the same person as the admin — no invite email is sent. */
  emailSkippedSelf?: boolean
  entitlementId?: string
  releasedEntitlementId?: string | null
  leftOrganizationId?: number
  error?: string
}

function getAppBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL
  if (explicit) return explicit.replace(/\/$/, '')
  const vercel = process.env.VERCEL_URL
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, '')}`
  return 'https://edutime.ch'
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
    const serviceClient = createServiceClient()
    if (!serviceClient) {
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

      const inviteId = String(data)
      let emailSent = false

      const actorEmail = (auth.user.email || '').toLowerCase().trim()
      const inviteEmailNorm = email.toLowerCase().trim()
      const emailSkippedSelf = actorEmail.length > 0 && actorEmail === inviteEmailNorm

      const resendApiKey = process.env.RESEND_API_KEY

      if (emailSkippedSelf) {
        return res.status(200).json({ inviteId, emailSent: false, emailSkippedSelf: true })
      }

      if (resendApiKey) {
        const { data: inviteRow, error: inviteRowError } = await serviceClient
          .schema('license')
          .from('org_invites')
          .select('token, email')
          .eq('id', inviteId)
          .single()

        const { data: orgRow, error: orgRowError } = await serviceClient
          .from('organizations')
          .select('name')
          .eq('id', organizationId)
          .single()

        if (inviteRowError || !inviteRow) {
          console.error('Org invite email: could not load invite row after create:', inviteRowError)
        } else if (orgRowError) {
          console.error('Org invite email: could not load organization:', orgRowError)
        } else {
          const acceptUrl = new URL('/app/no-license', `${getAppBaseUrl()}/`)
          acceptUrl.searchParams.set('invite', inviteRow.token)

          const locale = resolveOrgInviteEmailLocale(
            typeof req.headers['accept-language'] === 'string'
              ? req.headers['accept-language']
              : undefined,
          )

          try {
            await sendOrgMemberInviteEmail({
              resendApiKey,
              fromEmail: EDUTIME_TRANSACTIONAL_FROM,
              toEmail: inviteRow.email,
              organizationName: orgRow?.name?.trim() || 'Organization',
              inviteeEmail: inviteRow.email,
              acceptUrl: acceptUrl.toString(),
              locale,
            })
            emailSent = true
          } catch (sendErr) {
            console.error('Org invite email: Resend failed:', sendErr)
          }
        }
      } else {
        console.warn('Org invite email skipped: RESEND_API_KEY is not configured')
      }

      return res.status(200).json({ inviteId, emailSent })
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

      if (error?.message === 'No pending invite found for this organization') {
        const actorEmail = (auth.user.email || '').toLowerCase().trim()
        if (!actorEmail) {
          return res.status(400).json({ error: 'User email not available' })
        }

        const membershipQuery = serviceClient
          .from('organization_members')
          .select('id, user_email, user_id, status')
          .eq('organization_id', organizationId)
          .eq('status', 'invited')
          .limit(1)

        const { data: membership, error: membershipError } = await membershipQuery
          .or(`user_id.eq.${auth.user.id},user_email.ilike.${actorEmail}`)
          .maybeSingle()

        if (membershipError) {
          console.error('Failed to load organization membership for invite rejection fallback:', membershipError)
          return res.status(400).json({ error: membershipError.message || 'Failed to reject invite' })
        }

        if (!membership) {
          return res.status(404).json({ error: 'No pending invite found for this organization' })
        }

        const { error: updateMembershipError } = await serviceClient
          .from('organization_members')
          .update({
            status: 'rejected',
            user_id: null,
          })
          .eq('id', membership.id)

        if (updateMembershipError) {
          console.error(
            'Failed to update organization membership for invite rejection fallback:',
            updateMembershipError,
          )
          return res.status(400).json({ error: updateMembershipError.message || 'Failed to reject invite' })
        }

        const { error: cancelInviteError } = await serviceClient
          .schema('license')
          .from('org_invites')
          .update({ status: 'canceled' })
          .eq('organization_id', organizationId)
          .eq('status', 'pending')
          .ilike('email', actorEmail)

        if (cancelInviteError) {
          console.error('Failed to cancel pending invite during rejection fallback:', cancelInviteError)
        }

        return res.status(200).json({})
      }

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

    if (action === 'leave') {
      const organizationId = Number(req.body?.organizationId)
      if (!Number.isInteger(organizationId) || organizationId <= 0) {
        return res.status(400).json({ error: 'Missing or invalid organizationId' })
      }

      const actorEmail = (auth.user.email || '').toLowerCase().trim()

      const membershipQuery = serviceClient
        .from('organization_members')
        .select('id, user_email, user_id, status')
        .eq('organization_id', organizationId)
        .eq('status', 'active')
        .limit(1)

      const { data: membership, error: membershipError } = actorEmail
        ? await membershipQuery.or(`user_id.eq.${auth.user.id},user_email.ilike.${actorEmail}`).maybeSingle()
        : await membershipQuery.eq('user_id', auth.user.id).maybeSingle()

      if (membershipError) {
        console.error('Failed to load organization membership for self-leave:', membershipError)
        return res.status(400).json({ error: membershipError.message || 'Failed to leave organization' })
      }

      if (!membership) {
        return res.status(404).json({ error: 'No active organization membership found' })
      }

      const { error: entitlementError } = await serviceClient
        .schema('license')
        .from('entitlements')
        .update({
          user_id: null,
          updated_at: new Date().toISOString(),
          revocation_reason: null,
        })
        .eq('organization_id', organizationId)
        .eq('kind', 'org_seat')
        .eq('status', 'active')
        .eq('user_id', auth.user.id)

      if (entitlementError) {
        console.error('Failed to expire organization entitlement during self-leave:', entitlementError)
        return res.status(400).json({ error: entitlementError.message || 'Failed to leave organization' })
      }

      const { error: memberUpdateError } = await serviceClient
        .from('organization_members')
        .update({
          status: 'canceled',
          user_id: null,
        })
        .eq('id', membership.id)

      if (memberUpdateError) {
        console.error('Failed to cancel organization membership during self-leave:', memberUpdateError)
        return res.status(400).json({ error: memberUpdateError.message || 'Failed to leave organization' })
      }

      if (actorEmail) {
        const { error: inviteError } = await serviceClient
          .schema('license')
          .from('org_invites')
          .update({ status: 'canceled' })
          .eq('organization_id', organizationId)
          .eq('status', 'pending')
          .ilike('email', actorEmail)

        if (inviteError) {
          console.error('Failed to cancel pending invites during self-leave:', inviteError)
        }
      }

      return res.status(200).json({ leftOrganizationId: organizationId })
    }

    return res.status(400).json({ error: 'Unknown action' })
  } catch (error) {
    console.error('Org members API failed:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
