import { useQuery } from '@tanstack/react-query'
import { CantonData } from '@/types/globals'
import { getCantonData } from '../canton'

// Query keys
export const cantonKeys = {
  all: ['canton'] as const,
  byCode: (cantonCode: string, user_id: string) =>
    [...cantonKeys.all, cantonCode, user_id] as const,
}

// Hook to get canton data
export const useCantonData = (cantonCode: string, user_id: string) => {
  return useQuery({
    queryKey: cantonKeys.byCode(cantonCode, user_id),
    queryFn: () => getCantonData(cantonCode, user_id),
    enabled: !!cantonCode && !!user_id,
    staleTime: 1000 * 60 * 10, // 10 minutes - canton data rarely changes
  })
}
