import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { StopWatchSession } from '@/lib/types';
import { recordKeys } from './useRecordsQuery';

// Fetch active stopwatch session
export const fetchActiveStopwatchSession = async (userId: string) => {
  const { data, error } = await supabase
    .from('stopwatch_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('start_time', { ascending: false })
    .limit(1);

  if (error) throw new Error(error.message);

  const active = data[0]
    ? {
        ...data[0],
        start_time: new Date(data[0].start_time),
        description: data[0].description || '',
      }
    : null;

  return active;
};

// Hook to get active stopwatch session
export const useStopwatchSessionQuery = (userId: string) => {
  return useQuery({
    queryKey: recordKeys.stopwatchSession(userId),
    queryFn: () => fetchActiveStopwatchSession(userId),
    enabled: !!userId,
    staleTime: 10 * 1000, // 10 seconds
  });
};

// Create stopwatch session mutation
export const useCreateStopwatchSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (session: { user_id: string; start_time: Date; description?: string; category_id?: number; is_user_category?: boolean; user_category_id?: number }) => {
      const { data, error } = await supabase
        .from('stopwatch_sessions')
        .insert({
          ...session,
          start_time: session.start_time.toISOString(),
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recordKeys.stopwatchSessions() });
    },
  });
};

// Update stopwatch session mutation
export const useUpdateStopwatchSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number; description?: string; category_id?: number; is_user_category?: boolean; user_category_id?: number }) => {
      const { data, error } = await supabase
        .from('stopwatch_sessions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recordKeys.stopwatchSessions() });
    },
  });
};

// Delete stopwatch session mutation
export const useDeleteStopwatchSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: number) => {
      const { error } = await supabase
        .from('stopwatch_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw new Error(error.message);
      return sessionId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recordKeys.stopwatchSessions() });
    },
  });
};
