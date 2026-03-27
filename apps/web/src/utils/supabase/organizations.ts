import { Membership, Organization } from '@/types/globals'
import { supabase } from './client'

const getAuthenticatedRequestInit = async (
  init?: Omit<RequestInit, 'headers' | 'credentials'>,
): Promise<RequestInit> => {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
  }

  return {
    ...init,
    headers,
    credentials: 'include',
  }
}

export const getOrganizations = async (userId: string): Promise<Organization[]> => {
  const { data, error } = await supabase
    .from('organization_administrators')
    .select(
      `
            organization_id,
            organizations (
                id,
                name,
                seats
            )
        `,
    )
    .eq('user_id', userId)
    .eq('organizations.is_active', true)

  if (error) {
    console.error('error', error)
    return []
  }

  const rows = Array.isArray(data) ? data : []

  return rows
    .map((item) => {
      const organization = item.organizations as { id: number; name: string; seats: number } | null
      if (!organization) return null

      return {
        id: organization.id,
        name: organization.name,
        seats: organization.seats,
      }
    })
    .filter((organization): organization is Organization => organization !== null)
}

type OrgBillingStatusApiResponse = {
  data?: {
    seatCount: number | null
  } | null
  error?: string
}

export const getOrganizationSeatCount = async (organizationId: number): Promise<number | null> => {
  const requestInit = await getAuthenticatedRequestInit()
  const response = await fetch(
    `/api/billing/org-license?organizationId=${encodeURIComponent(String(organizationId))}`,
    requestInit,
  )
  const payload = (await response.json()) as OrgBillingStatusApiResponse

  if (!response.ok) {
    throw new Error(payload.error || 'Failed to load organization billing status')
  }

  if (!payload.data || typeof payload.data.seatCount !== 'number') {
    return null
  }

  return payload.data.seatCount
}

export interface OrganizationMember {
  id: number
  email: string
  status: 'invited' | 'active' | 'rejected' | 'canceled'
  created_at: Date
  comment: string | null
}

export const getOrganizationMembers = async (
  organizationId: number,
): Promise<OrganizationMember[]> => {
  const { data, error } = await supabase
    .from('organization_members')
    .select(
      `
            id,
            user_email,
            status,
            created_at,
            comment
        `,
    )
    .eq('organization_id', organizationId)

  if (error) {
    console.error('error', error)
    return []
  }

  const members = (data || []).map((member) => ({
    id: member.id,
    email: member.user_email,
    status: member.status,
    created_at: new Date(member.created_at),
    comment: member.comment,
  }))

  return members
}

export const addOrganizationMember = async (
  organizationId: number,
  email: string,
  comment?: string,
) => {
  const requestInit = await getAuthenticatedRequestInit({
    method: 'POST',
    body: JSON.stringify({
      action: 'invite',
      organizationId,
      email,
      comment: comment || null,
    }),
  })
  const response = await fetch('/api/billing/org-license/members', requestInit)
  const payload = (await response.json()) as {
    inviteId?: string
    emailSent?: boolean
    emailSkippedSelf?: boolean
    error?: string
  }

  if (!response.ok) {
    throw new Error(payload.error || 'Failed to invite member')
  }

  return payload
}

export const removeOrganizationMember = async (organizationId: number, memberId: number) => {
  const { error } = await supabase
    .from('organization_members')
    .delete()
    .eq('organization_id', organizationId)
    .eq('id', memberId)

  if (error) {
    console.error('error', error)
    return
  }
}

export const getMemberships = async (userEmail: string): Promise<Membership[]> => {
  const normalizedEmail = userEmail.toLowerCase()

  const { data, error } = await supabase
    .from('organization_members')
    .select(
      `
            organization_id,
            status,
            comment,
            organizations (
                id,
                name
            )
        `,
    )
    .ilike('user_email', normalizedEmail)
    .eq('organizations.is_active', true)
    .neq('status', 'rejected')
    .neq('status', 'canceled')

  if (error) {
    console.error('Error fetching memberships')
    return []
  }
  const rows = Array.isArray(data) ? data : []

  return rows
    .map((item) => {
      const organization = item.organizations as { name: string } | null
      if (!organization) return null

      return {
        id: item.organization_id,
        name: organization.name,
        status: item.status,
      }
    })
    .filter((membership): membership is Membership => membership !== null)
}

export const updateMembership = async (
  organizationId: number,
  userEmail: string,
  status: 'invited' | 'active' | 'rejected' | 'canceled',
  comment: string | null,
) => {
  const normalizedEmail = userEmail.toLowerCase()
  const { error } = await supabase
    .from('organization_members')
    .update({ status, comment })
    .eq('organization_id', organizationId)
    .ilike('user_email', normalizedEmail)

  if (error) {
    console.error('error', error)
    return
  }
}

export const updateMembershipById = async (
  membershipId: number,
  status: 'invited' | 'active' | 'rejected' | 'canceled',
) => {
  const { error } = await supabase
    .from('organization_members')
    .update({ status })
    .eq('id', membershipId)

  if (error) {
    console.error('error', error)
    return
  }
}

export const acceptOrganizationInvite = async (organizationId: number) => {
  const requestInit = await getAuthenticatedRequestInit({
    method: 'POST',
    body: JSON.stringify({
      action: 'accept',
      organizationId,
    }),
  })
  const response = await fetch('/api/billing/org-license/members', requestInit)
  const payload = (await response.json()) as { entitlementId?: string; error?: string }

  if (!response.ok) {
    throw new Error(payload.error || 'Failed to accept organization invite')
  }

  return payload
}

export const rejectOrganizationInvite = async (organizationId: number) => {
  const requestInit = await getAuthenticatedRequestInit({
    method: 'POST',
    body: JSON.stringify({
      action: 'reject',
      organizationId,
    }),
  })
  const response = await fetch('/api/billing/org-license/members', requestInit)
  const payload = (await response.json()) as { error?: string }

  if (!response.ok) {
    throw new Error(payload.error || 'Failed to reject organization invite')
  }
}

export const releaseOrganizationMemberSeat = async (organizationId: number, membershipId: number) => {
  const requestInit = await getAuthenticatedRequestInit({
    method: 'POST',
    body: JSON.stringify({
      action: 'release',
      organizationId,
      membershipId,
    }),
  })
  const response = await fetch('/api/billing/org-license/members', requestInit)
  const payload = (await response.json()) as { releasedEntitlementId?: string | null; error?: string }

  if (!response.ok) {
    throw new Error(payload.error || 'Failed to release organization seat')
  }

  return payload
}
