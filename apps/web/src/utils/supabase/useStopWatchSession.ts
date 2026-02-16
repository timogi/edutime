import { useState, useEffect, useCallback } from 'react'
import { supabase } from './client'
import { StopWatchSession } from '@/types/globals'

interface UseStopWatchSessionHook {
  activeSession: StopWatchSession | null
  loading: boolean
  error: Error | null
}

const useStopWatchSession = (): UseStopWatchSessionHook => {
  const [activeSession, setActiveSession] = useState<StopWatchSession | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchActiveSession = useCallback(async () => {
    setLoading(true)
    try {
      const user = await supabase.auth.getUser()
      if (user.data.user) {
        const { data, error } = await supabase
          .from('stopwatch_sessions')
          .select('*')
          .eq('user_id', user.data.user.id)
        if (error) {
          throw new Error(error.message)
        }
        const activeSession = data[0] || null
        setActiveSession(activeSession)
      }
    } catch (err) {
      console.error('error', err)
      setError(err instanceof Error ? err : new Error('An unexpected error occurred'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchActiveSession()

    const subscription = supabase
      .channel(`stopwatch-session}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stopwatch_sessions' },
        async (payload) => {
          fetchActiveSession()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [fetchActiveSession])

  return { activeSession, loading, error }
}

export default useStopWatchSession
