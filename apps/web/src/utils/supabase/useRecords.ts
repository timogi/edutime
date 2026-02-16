import { TimeRecord } from '@/types/globals'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from './client'

interface UseRecordsHook {
  records: TimeRecord[]
  loading: boolean
  error: Error | null
}

const useRecords = (date: string, user_id: string): UseRecordsHook & { refetch: () => void } => {
  const [records, setRecords] = useState<TimeRecord[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchRecords = useCallback(
    async (retryCount = 0) => {
      const maxRetries = 3
      try {
        setLoading(true)
        setError(null)

        console.log(
          `[useRecords] Fetching records for date: ${date}, user: ${user_id}, retry: ${retryCount}`,
        )

        const { data, error } = await supabase
          .from('records')
          .select('*')
          .eq('date', date)
          .eq('user_id', user_id)
          .order('start_time', { ascending: true })

        if (error) {
          console.error(`[useRecords] Error fetching records:`, error)

          // Check if it's an auth error
          if (
            error.message.includes('JWT') ||
            error.message.includes('token') ||
            error.message.includes('expired')
          ) {
            console.warn('[useRecords] Auth error, attempting to refresh session...')

            // Try to refresh session
            try {
              const {
                data: { session },
                error: refreshError,
              } = await supabase.auth.refreshSession()
              if (refreshError) {
                console.error('[useRecords] Failed to refresh session:', refreshError)
              } else if (session && retryCount < maxRetries) {
                console.log('[useRecords] Session refreshed, retrying...')
                // Retry after session refresh
                setTimeout(() => fetchRecords(retryCount + 1), 500)
                return
              }
            } catch (refreshErr) {
              console.error('[useRecords] Error refreshing session:', refreshErr)
            }

            setRecords([])
          } else if (
            error.message.includes('network') ||
            error.message.includes('fetch') ||
            error.code === 'PGRST116'
          ) {
            // Network error - retry
            if (retryCount < maxRetries) {
              console.log(
                `[useRecords] Network error, retrying (${retryCount + 1}/${maxRetries})...`,
              )
              setTimeout(() => fetchRecords(retryCount + 1), 1000 * (retryCount + 1))
              return
            }
            throw new Error(`Network error: ${error.message}`)
          } else {
            throw new Error(error.message)
          }
        } else {
          console.log(`[useRecords] Successfully fetched ${data?.length || 0} records`)
          setRecords((data as TimeRecord[]) || [])
        }
      } catch (err) {
        console.error('[useRecords] Error fetching records:', err)
        setError(err instanceof Error ? err : new Error('An unexpected error occurred'))
        setRecords([])
      } finally {
        setLoading(false)
      }
    },
    [date, user_id],
  )

  useEffect(() => {
    fetchRecords()

    let subscription: ReturnType<typeof supabase.channel> | null = null
    let reconnectTimeout: NodeJS.Timeout | null = null

    const setupSubscription = () => {
      if (subscription) {
        supabase.removeChannel(subscription)
      }

      subscription = supabase
        .channel(`records-filter-user-${user_id}-${date}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'records',
            filter: `user_id=eq.${user_id}`,
          },
          async (payload) => {
            console.log('[useRecords] Real-time event received:', payload.eventType)
            fetchRecords()
          },
        )
        .subscribe((status) => {
          console.log(`[useRecords] Subscription status: ${status}`)

          if (status === 'SUBSCRIBED') {
            console.log('[useRecords] Successfully subscribed to real-time updates')
            if (reconnectTimeout) {
              clearTimeout(reconnectTimeout)
              reconnectTimeout = null
            }
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            console.warn(`[useRecords] Subscription ${status}, attempting to reconnect...`)

            // Retry subscription after delay
            if (reconnectTimeout) {
              clearTimeout(reconnectTimeout)
            }
            reconnectTimeout = setTimeout(() => {
              setupSubscription()
            }, 2000)
          }
        })
    }

    setupSubscription()

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
      if (subscription) {
        supabase.removeChannel(subscription)
      }
    }
  }, [fetchRecords, date, user_id])

  // Expose refetch function
  const refetch = fetchRecords

  return { records, loading, error, refetch }
}

export default useRecords
