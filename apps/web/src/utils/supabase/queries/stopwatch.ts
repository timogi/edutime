import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { StopWatchSession } from '@/types/globals'
import { supabase } from '../client'
import {
  createStopwatchSession,
  deleteStopwatchSession,
  updateStopwatchSession,
  fetchStopWatchSession,
} from '../stopWatch'

// Query keys
export const stopwatchKeys = {
  all: ['stopwatch'] as const,
  session: (user_id: string | null) => [...stopwatchKeys.all, 'session', user_id] as const,
}

// Hook to get stopwatch session
export const useStopWatchSession = () => {
  return useQuery({
    queryKey: stopwatchKeys.session(null),
    queryFn: async () => {
      const user = await supabase.auth.getUser()
      if (!user.data.user) {
        return null
      }

      const { data, error } = await supabase
        .from('stopwatch_sessions')
        .select('*')
        .eq('user_id', user.data.user.id)

      if (error) {
        throw new Error(error.message)
      }

      return (data?.[0] as StopWatchSession) || null
    },
  })
}

// Mutation to create a stopwatch session
export const useCreateStopwatchSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createStopwatchSession,
    onSuccess: (data) => {
      // Optimistically update the cache with the new session
      queryClient.setQueryData(stopwatchKeys.session(null), data)
      // Also invalidate to ensure consistency
      queryClient.invalidateQueries({
        queryKey: stopwatchKeys.all,
      })
    },
    onError: (error) => {
      console.error('Failed to create stopwatch session:', error)
    },
  })
}

// Mutation to update a stopwatch session
export const useUpdateStopwatchSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateStopwatchSession,
    onSuccess: (data, variables) => {
      // Optimistically update the cache with the updated session
      queryClient.setQueryData(stopwatchKeys.session(null), variables)
      // Also invalidate to ensure consistency
      queryClient.invalidateQueries({
        queryKey: stopwatchKeys.all,
      })
    },
    onError: (error) => {
      console.error('Failed to update stopwatch session:', error)
    },
  })
}

// Mutation to delete a stopwatch session
export const useDeleteStopwatchSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteStopwatchSession,
    onSuccess: () => {
      // Optimistically update the cache to null (no session)
      queryClient.setQueryData(stopwatchKeys.session(null), null)
      // Also invalidate to ensure consistency
      queryClient.invalidateQueries({
        queryKey: stopwatchKeys.all,
      })
    },
    onError: (error) => {
      console.error('Failed to delete stopwatch session:', error)
      // Don't throw - deletion failures are often benign (session already deleted)
    },
  })
}
