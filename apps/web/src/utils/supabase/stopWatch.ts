import { StopWatchSession } from '@/types/globals'
import type { Database } from '@edutime/shared'
import { supabase } from './client'

type StopwatchRow = Database['public']['Tables']['stopwatch_sessions']['Row']
type StopwatchUpdate = Database['public']['Tables']['stopwatch_sessions']['Update']

export const mapStopwatchRowToSession = (row: StopwatchRow): StopWatchSession => ({
  id: row.id,
  category_id: row.category_id,
  is_user_category: row.is_user_category,
  user_category_id: row.user_category_id,
  start_time: new Date(row.start_time),
  description: row.description ?? '',
})

export const createStopwatchSession = async () => {
  const user = await supabase.auth.getUser()
  if (!user.data.user) {
    throw new Error('User not authenticated')
  }

  // Check if session already exists
  const { data: existingSession } = await supabase
    .from('stopwatch_sessions')
    .select('*')
    .eq('user_id', user.data.user.id)
    .maybeSingle()

  if (existingSession) {
    return mapStopwatchRowToSession(existingSession)
  }

  const { data, error } = await supabase
    .from('stopwatch_sessions')
    .insert([
      {
        start_time: new Date().toISOString(),
        category_id: null,
        description: '',
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('error creating stopwatch session', error)
    throw error
  }

  if (!data) {
    throw new Error('No stopwatch session returned after insert')
  }

  return mapStopwatchRowToSession(data)
}

export const deleteStopwatchSession = async () => {
  const user = await supabase.auth.getUser()
  if (!user.data.user) {
    // No user, nothing to delete - not an error
    return
  }

  // Check if session exists first
  const { data: existingSession } = await supabase
    .from('stopwatch_sessions')
    .select('*')
    .eq('user_id', user.data.user.id)
    .maybeSingle()

  if (!existingSession) {
    // Session doesn't exist, nothing to delete - not an error
    return
  }

  const { error } = await supabase
    .from('stopwatch_sessions')
    .delete()
    .eq('user_id', user.data.user.id)

  if (error) {
    console.error('error deleting stopwatch session', error)
    throw error
  }
}

export const fetchStopWatchSession = async (
  callback: (activeSession: StopWatchSession | null) => void,
) => {
  supabase.auth.getUser().then((user) => {
    if (user.data.user) {
      supabase
        .from('stopwatch_sessions')
        .select('*')
        .eq('user_id', user.data.user.id)
        .then(({ data, error }) => {
          if (error) {
            console.error('error', error)
          }
          if (data?.[0]) {
            callback(mapStopwatchRowToSession(data[0]))
          } else {
            callback(null)
          }
        })
    }
  })
}

export const updateStopwatchSession = async (stopWatchSession: StopWatchSession) => {
  if (!stopWatchSession.id) {
    throw new Error('Stopwatch session ID is required')
  }

  const updatePayload: StopwatchUpdate = {
    category_id: stopWatchSession.category_id,
    is_user_category: stopWatchSession.is_user_category,
    user_category_id: stopWatchSession.user_category_id,
    start_time:
      stopWatchSession.start_time instanceof Date
        ? stopWatchSession.start_time.toISOString()
        : String(stopWatchSession.start_time),
    description: stopWatchSession.description,
  }

  const { error } = await supabase
    .from('stopwatch_sessions')
    .update(updatePayload)
    .eq('id', stopWatchSession.id)

  if (error) {
    console.error('error updating stopwatch session', error)
    throw error
  }
}
