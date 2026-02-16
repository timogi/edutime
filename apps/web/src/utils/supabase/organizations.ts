import { Membership, Organization } from '@/types/globals'
import { supabase } from './client'

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

  return (
    (data as any).map((item: any) => ({
      id: item.organizations.id,
      name: item.organizations.name,
      seats: item.organizations.seats,
    })) || []
  )
}

export interface OrganizationMember {
  id: number
  email: string
  status: 'invited' | 'active' | 'rejected'
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
  const { data, error } = await supabase.from('organization_members').insert({
    organization_id: organizationId,
    user_email: email,
    status: 'invited',
    comment: comment || null,
  })

  if (error) {
    console.error('error', error)
    return
  }

  return data
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
  return (
    (data as any).map((item: any) => ({
      id: item.organization_id,
      name: item.organizations.name,
      status: item.status,
    })) || []
  )
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
