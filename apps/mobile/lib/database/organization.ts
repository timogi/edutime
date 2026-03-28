import { supabase } from '@/lib/supabase'

export type Organization = {
  id: number
  name: string
  seats: number
  is_active: boolean
  scheduled_deletion_at: string | null
}

export type Membership = {
  id: number
  name: string
  status: 'invited' | 'active' | 'rejected' | 'canceled'
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
                seats,
                is_active,
                scheduled_deletion_at
            )
        `,
    )
    .eq('user_id', userId)

  if (error) {
    console.error('error', error)
    return []
  }

  const rows = Array.isArray(data) ? data : []
  return rows
    .map((item) => {
      const org = item.organizations as {
        id: number
        name: string
        seats: number
        is_active: boolean | null
        scheduled_deletion_at: string | null
      } | null
      if (!org) return null
      return {
        id: org.id,
        name: org.name,
        seats: org.seats,
        is_active: org.is_active !== false,
        scheduled_deletion_at: org.scheduled_deletion_at ?? null,
      }
    })
    .filter((o): o is Organization => o !== null && o.scheduled_deletion_at === null)
}

export interface OrganizationMember {
  id: number
  email: string
  status: 'invited' | 'active' | 'rejected'
  created_at: Date
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
            created_at
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
  }))

  return members
}

export const addOrganizationMember = async (organizationId: number, email: string) => {
  const { data, error } = await supabase.from('organization_members').insert({
    organization_id: organizationId,
    user_email: email,
    status: 'invited',
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
) => {
  const normalizedEmail = userEmail.toLowerCase()
  const { error } = await supabase
    .from('organization_members')
    .update({ status })
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
