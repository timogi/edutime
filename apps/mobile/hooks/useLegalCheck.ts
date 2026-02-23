import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getMissingUserDocuments } from '@edutime/shared'
import { supabase } from '@/lib/supabase'

export const legalKeys = {
  missing: ['legal', 'missing'] as const,
}

export function useLegalCheck(enabled = true) {
  return useQuery({
    queryKey: legalKeys.missing,
    queryFn: () => getMissingUserDocuments(supabase, 'app'),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function useInvalidateLegalCheck() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: legalKeys.missing })
}
