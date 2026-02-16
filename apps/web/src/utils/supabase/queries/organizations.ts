import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getOrganizations,
  getOrganizationMembers,
  getMemberships,
  addOrganizationMember,
  removeOrganizationMember,
  updateMembership,
  updateMembershipById,
} from '../organizations'

// Query keys
export const organizationKeys = {
  all: ['organizations'] as const,
  byUser: (userId: string) => [...organizationKeys.all, 'user', userId] as const,
  members: (organizationId: number) =>
    [...organizationKeys.all, 'members', organizationId] as const,
  memberships: (userEmail: string) => [...organizationKeys.all, 'memberships', userEmail] as const,
}

// Hook to get organizations for a user
export const useOrganizations = (userId: string) => {
  return useQuery({
    queryKey: organizationKeys.byUser(userId),
    queryFn: () => getOrganizations(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Hook to get organization members
export const useOrganizationMembers = (organizationId: number) => {
  return useQuery({
    queryKey: organizationKeys.members(organizationId),
    queryFn: () => getOrganizationMembers(organizationId),
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

// Hook to get memberships for a user email
export const useMemberships = (userEmail: string) => {
  return useQuery({
    queryKey: organizationKeys.memberships(userEmail),
    queryFn: () => getMemberships(userEmail),
    enabled: !!userEmail,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

// Mutation to add an organization member
export const useAddOrganizationMember = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      organizationId,
      email,
      comment,
    }: {
      organizationId: number
      email: string
      comment?: string
    }) => addOrganizationMember(organizationId, email, comment),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: organizationKeys.members(variables.organizationId),
      })
    },
  })
}

// Mutation to remove an organization member
export const useRemoveOrganizationMember = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ organizationId, memberId }: { organizationId: number; memberId: number }) =>
      removeOrganizationMember(organizationId, memberId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: organizationKeys.members(variables.organizationId),
      })
    },
  })
}

// Mutation to update membership
export const useUpdateMembership = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      organizationId,
      userEmail,
      status,
      comment,
    }: {
      organizationId: number
      userEmail: string
      status: 'invited' | 'active' | 'rejected' | 'canceled'
      comment: string | null
    }) => updateMembership(organizationId, userEmail, status, comment),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: organizationKeys.memberships(variables.userEmail),
      })
      queryClient.invalidateQueries({
        queryKey: organizationKeys.members(variables.organizationId),
      })
    },
  })
}

// Mutation to update membership by ID
export const useUpdateMembershipById = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      membershipId,
      status,
    }: {
      membershipId: number
      status: 'invited' | 'active' | 'rejected' | 'canceled'
    }) => updateMembershipById(membershipId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organizationKeys.all,
      })
    },
  })
}
