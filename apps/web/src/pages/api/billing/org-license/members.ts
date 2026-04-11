import type { NextApiRequest, NextApiResponse } from 'next'
import { Json } from '@edutime/shared'
import { getAuthenticatedUser } from '@/utils/supabase/api-auth'
import { EDUTIME_TRANSACTIONAL_FROM } from '@edutime/shared'
import {
  resolveOrgInviteEmailLocale,
  sendOrgMemberInviteEmail,
} from '@/utils/email/orgMemberInviteEmail'

type MembersApiResponse = {
  inviteId?: string
  emailSent?: boolean
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

function asRecord(v: unknown): Record<string, unknown> | null {
  if (v != null && typeof v === 'object' && !Array.isArray(v)) {
    return v as Record<string, unknown>
  }
  return null
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

    const { supabase } = auth
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

      const { data: invitePayload, error } = await supabase.rpc('api_create_org_member_invite', {
        p_organization_id: organizationId,
        p_email: email,
        p_comment: comment,
      })

      if (error) {
        console.error('Failed to create org member invite:', error)
        return res.status(400).json({ error: error.message || 'Failed to invite member' })
      }

      const payload = asRecord(invitePayload as Json)
      const inviteId = payload?.invite_id != null ? String(payload.invite_id) : ''
      const token = payload?.token != null ? String(payload.token) : ''
      const inviteEmail = payload?.email != null ? String(payload.email) : email

      if (!inviteId) {
        return res.status(500).json({ error: 'Failed to create invite' })
      }

      let emailSent = false

      const actorEmail = (auth.user.email || '').toLowerCase().trim()
      const inviteEmailNorm = email.toLowerCase().trim()
      const emailSkippedSelf = actorEmail.length > 0 && actorEmail === inviteEmailNorm

      const resendApiKey = process.env.RESEND_API_KEY

      if (emailSkippedSelf) {
        return res.status(200).json({ inviteId, emailSent: false, emailSkippedSelf: true })
      }

      if (resendApiKey && token) {
        const { data: orgRow, error: orgRowError } = await supabase
          .from('organizations')
          .select('name')
          .eq('id', organizationId)
          .single()

        if (orgRowError) {
          console.error('Org invite email: could not load organization:', orgRowError)
        } else {
          const acceptUrl = new URL('/register', `${getAppBaseUrl()}/`)

          const locale = resolveOrgInviteEmailLocale(
            typeof req.headers['accept-language'] === 'string'
              ? req.headers['accept-language']
              : undefined,
          )

          try {
            const loginUrl = new URL('/login', `${getAppBaseUrl()}/`)
            await sendOrgMemberInviteEmail({
              resendApiKey,
              fromEmail: EDUTIME_TRANSACTIONAL_FROM,
              toEmail: inviteEmail,
              organizationName: orgRow?.name?.trim() || 'Organization',
              inviteeEmail: inviteEmail,
              acceptUrl: acceptUrl.toString(),
              loginUrl: loginUrl.toString(),
              locale,
            })
            emailSent = true
          } catch (sendErr) {
            console.error('Org invite email: Resend failed:', sendErr)
          }
        }
      } else if (!resendApiKey) {
        console.warn('Org invite email skipped: RESEND_API_KEY is not configured')
      }

      return res.status(200).json({ inviteId, emailSent })
    }

    if (action === 'accept') {
      const organizationId = Number(req.body?.organizationId)
      if (!Number.isInteger(organizationId) || organizationId <= 0) {
        return res.status(400).json({ error: 'Missing or invalid organizationId' })
      }

      const { data, error } = await supabase.rpc('api_accept_org_member_invite', {
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

      const { error } = await supabase.rpc('api_reject_org_member_invite', {
        p_organization_id: organizationId,
      })

      if (error?.message === 'No pending invite found for this organization') {
        const { error: fbErr } = await supabase.rpc('api_reject_org_invite_membership_fallback', {
          p_organization_id: organizationId,
        })
        if (fbErr) {
          if (fbErr.message?.includes('No pending invite')) {
            return res.status(404).json({ error: 'No pending invite found for this organization' })
          }
          console.error('reject membership fallback failed:', fbErr)
          return res.status(400).json({ error: fbErr.message || 'Failed to reject invite' })
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

      const { data, error } = await supabase.rpc('api_release_org_member_seat', {
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

      const { error: leaveErr } = await supabase.rpc('api_leave_organization_as_member', {
        p_organization_id: organizationId,
      })

      if (leaveErr) {
        console.error('Failed to leave organization:', leaveErr)
        if (leaveErr.message?.includes('No active organization membership')) {
          return res.status(404).json({ error: 'No active organization membership found' })
        }
        return res.status(400).json({ error: leaveErr.message || 'Failed to leave organization' })
      }

      return res.status(200).json({ leftOrganizationId: organizationId })
    }

    return res.status(400).json({ error: 'Unknown action' })
  } catch (error) {
    console.error('Org members API failed:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
