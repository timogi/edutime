import { useQuery } from '@tanstack/react-query'
import { Category, UserData } from '@/types/globals'
import { getCategories, getAllCategories } from '../categories'

// Query keys
export const categoryKeys = {
  all: ['categories'] as const,
  byCanton: (cantonCode: string) => [...categoryKeys.all, 'canton', cantonCode] as const,
  allCategories: (userData: UserData | null) =>
    [...categoryKeys.all, 'all', userData?.user_id] as const,
}

// Hook to get categories for a canton
export const useCategories = (userData: UserData | null) => {
  return useQuery({
    queryKey: categoryKeys.byCanton(userData?.canton_code || ''),
    queryFn: () => getCategories(userData!),
    enabled: !!userData?.canton_code,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

// Hook to get all categories (including user categories)
export const useAllCategories = (userData: UserData | null) => {
  return useQuery({
    queryKey: categoryKeys.allCategories(userData),
    queryFn: () => getAllCategories(userData!),
    enabled: !!userData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
