import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getMissingUserDocuments } from '@edutime/shared'
import { supabase } from '@/lib/supabase'

export const legalKeys = {
  missing: ['legal', 'missing'] as const,
}

const LEGAL_FETCH_TIMEOUT_MS = 15_000

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`))
    }, ms)
    promise.then(
      (value) => {
        clearTimeout(id)
        resolve(value)
      },
      (err: unknown) => {
        clearTimeout(id)
        reject(err instanceof Error ? err : new Error(String(err)))
      },
    )
  })
}

export function useLegalCheck(enabled = true) {
  return useQuery({
    queryKey: legalKeys.missing,
    queryFn: () =>
      withTimeout(getMissingUserDocuments(supabase, 'app'), LEGAL_FETCH_TIMEOUT_MS, 'legal_missing_documents'),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1500 * 2 ** attemptIndex, 8_000),
  })
}

export function useInvalidateLegalCheck() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: legalKeys.missing })
}
