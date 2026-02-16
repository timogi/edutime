import { useState, useEffect, useCallback } from 'react'
import { supabase } from './client'
import { getIsoDate } from '@/functions/helpers'

interface DailyDurationHook {
  dailyDurations: { [date: string]: number }
  loading: boolean
  error: Error | null
}

const useDailyDuration = (
  startDate: Date,
  endDate: Date,
  user_id: string,
): DailyDurationHook & { refetch: () => void } => {
  const [dailyDurations, setDailyDurations] = useState<{ [date: string]: number }>({})
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const [start, setStart] = useState<string>(getIsoDate(startDate))
  const [end, setEnd] = useState<string>(getIsoDate(endDate))

  useEffect(() => {
    setStart(getIsoDate(startDate))
    setEnd(getIsoDate(endDate))
  }, [startDate, endDate])

  const fetchDailyDurations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('records')
        .select('date, duration')
        .gte('date', start)
        .lte('date', end)
        .eq('user_id', user_id)
        .order('date', { ascending: true })

      if (error) {
        // Check if it's an auth error
        if (error.message.includes('JWT') || error.message.includes('token')) {
          console.warn('Auth error in useDailyDuration, session may have expired')
          setDailyDurations({})
        } else {
          throw new Error(error.message)
        }
      } else {
        // Aggregate durations by date
        const aggregation = (data || []).reduce(
          (acc: { [date: string]: number }, record: { date: string; duration: number }) => {
            acc[record.date] = (acc[record.date] || 0) + record.duration
            return acc
          },
          {},
        )
        setDailyDurations(aggregation)
      }
    } catch (err) {
      console.error('Error fetching daily durations:', err)
      setError(err instanceof Error ? err : new Error('An unexpected error occurred'))
      setDailyDurations({})
    } finally {
      setLoading(false)
    }
  }, [start, end, user_id])

  useEffect(() => {
    fetchDailyDurations()

    const subscription = supabase
      .channel(`records-filter-user-id-${user_id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'records',
        },
        async (payload) => {
          fetchDailyDurations()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [fetchDailyDurations, start, end, user_id])

  // Expose refetch function
  const refetch = fetchDailyDurations

  return { dailyDurations, loading, error, refetch }
}

export default useDailyDuration
