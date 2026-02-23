import { Database } from '@edutime/shared';
import { supabase } from '../supabase';


export const createStopwatchSession = async () => {
  const { data, error } = await supabase.from('stopwatch_sessions').insert([
    {
      start_time: new Date().toISOString(),
      category_id: null,
      description: null,
      is_user_category: false,
      user_category_id: null
    },
  ]).select().single();

  if (error) {
    throw error;
  }

  return {
    ...data,
    start_time: new Date(data.start_time),
    description: data.description || ''
  };
};

export const deleteStopwatchSession = async (id: number) => {
  const { error } = await supabase
    .from('stopwatch_sessions')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
};

export const fetchStopWatchSession = async (
  callback: (activeSession: Database['public']['Tables']['stopwatch_sessions']['Row'] | null) => void
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data, error } = await supabase
      .from('stopwatch_sessions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      throw error;
    }

    callback(data);
  }
};

export const updateStopwatchSession = async (stopWatchSession: Database['public']['Tables']['stopwatch_sessions']['Update']) => {
  const { error } = await supabase
    .from('stopwatch_sessions')
    .update(stopWatchSession)
    .eq('id', stopWatchSession.id!);

  if (error) {
    throw error;
  }
};
