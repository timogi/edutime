import { StopWatchSession } from '@/types/globals'
import { supabase } from './client'

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
    // Session already exists, return it
    return existingSession
  }

  const { data, error } = await supabase
    .from('stopwatch_sessions')
    .insert([
      {
        start_time: new Date(),
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

  return data
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
          if (data) {
            const activeSession = data[0]
            callback(activeSession)
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

  const { error } = await supabase
    .from('stopwatch_sessions')
    .update(stopWatchSession)
    .eq('id', stopWatchSession.id)

  if (error) {
    console.error('error updating stopwatch session', error)
    throw error
  }
}
