import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserData, EmploymentCategory } from '@/types/globals'
import {
  getUserData,
  getUserCategories,
  updateUserData,
  createUserCategory,
  updateUserCategory,
  deleteUserCategory,
  createUserCustomTarget,
  updateUserCustomTarget,
  updateUserStatDates,
} from '../user'

// Query keys
export const userKeys = {
  all: ['user'] as const,
  data: () => [...userKeys.all, 'data'] as const,
  categories: (userId: string) => [...userKeys.all, 'categories', userId] as const,
}

// Hook to get user data
export const useUserData = () => {
  return useQuery({
    queryKey: userKeys.data(),
    queryFn: getUserData,
    staleTime: 1000 * 60 * 5, // 5 minutes - user data doesn't change often
  })
}

// Hook to get user categories
export const useUserCategories = (userId: string) => {
  return useQuery({
    queryKey: userKeys.categories(userId),
    queryFn: () => getUserCategories(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Mutation to update user data
export const useUpdateUserData = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userData, user_id }: { userData: Partial<UserData>; user_id: string }) =>
      updateUserData(userData, user_id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userKeys.data(),
      })
    },
  })
}

// Mutation to create a user category
export const useCreateUserCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, category }: { userId: string; category: EmploymentCategory }) =>
      createUserCategory(userId, category),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: userKeys.categories(variables.userId),
      })
      queryClient.invalidateQueries({
        queryKey: userKeys.data(),
      })
    },
  })
}

// Mutation to update a user category
export const useUpdateUserCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      categoryId,
      updatedCategory,
      userId,
    }: {
      categoryId: number
      updatedCategory: Partial<EmploymentCategory>
      userId: string
    }) => updateUserCategory(categoryId, updatedCategory),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: userKeys.categories(variables.userId),
      })
      queryClient.invalidateQueries({
        queryKey: userKeys.data(),
      })
    },
  })
}

// Mutation to delete a user category
export const useDeleteUserCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ categoryId, userId }: { categoryId: number; userId: string }) =>
      deleteUserCategory(categoryId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: userKeys.categories(variables.userId),
      })
      queryClient.invalidateQueries({
        queryKey: userKeys.data(),
      })
    },
  })
}

// Mutation to create a user custom target
export const useCreateUserCustomTarget = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      categorySetId,
      targetPercentage,
    }: {
      userId: string
      categorySetId: number
      targetPercentage: number
    }) => createUserCustomTarget(userId, categorySetId, targetPercentage),
    onSuccess: () => {
      // Invalidate canton data queries since they include custom targets
      queryClient.invalidateQueries({
        queryKey: ['canton'],
      })
    },
  })
}

// Mutation to update a user custom target
export const useUpdateUserCustomTarget = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ targetId, targetPercentage }: { targetId: number; targetPercentage: number }) =>
      updateUserCustomTarget(targetId, targetPercentage),
    onSuccess: () => {
      // Invalidate canton data queries since they include custom targets
      queryClient.invalidateQueries({
        queryKey: ['canton'],
      })
    },
  })
}

// Mutation to update user stat dates
export const useUpdateUserStatDates = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      statStartDate,
      statEndDate,
    }: {
      userId: string
      statStartDate: string | null
      statEndDate: string | null
    }) => updateUserStatDates(userId, statStartDate, statEndDate),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userKeys.data(),
      })
    },
  })
}
