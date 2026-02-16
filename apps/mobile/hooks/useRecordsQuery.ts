import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { TimeRecord } from '@/lib/types';

// Query Keys
export const recordKeys = {
  all: ['records'] as const,
  lists: () => [...recordKeys.all, 'list'] as const,
  list: (filters: { date: string; userId: string }) => [...recordKeys.lists(), filters] as const,
  dailyDurations: () => [...recordKeys.all, 'dailyDurations'] as const,
  dailyDurationsList: (filters: { startDate: string; endDate: string; userId: string }) => 
    [...recordKeys.dailyDurations(), filters] as const,
  stopwatchSessions: () => ['stopwatchSessions'] as const,
  stopwatchSession: (userId: string) => [...recordKeys.stopwatchSessions(), userId] as const,
};

// Fetch records for a specific date
export const fetchRecords = async (date: string, userId: string): Promise<TimeRecord[]> => {
  const { data, error } = await supabase
    .from('records')
    .select('*')
    .eq('date', date)
    .eq('user_id', userId)
    .order('start_time', { ascending: true });

  if (error) throw new Error(error.message);
  return (data as TimeRecord[]) ?? [];
};


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

// Hook to get records for a specific date
export const useRecordsQuery = (date: string, userId: string) => {
  return useQuery({
    queryKey: recordKeys.list({ date, userId }),
    queryFn: () => fetchRecords(date, userId),
    enabled: !!userId && !!date,
    staleTime: 30 * 1000, // 30 seconds
  });
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

// Delete record mutation
export const useDeleteRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recordId: number) => {
      const { error } = await supabase
        .from('records')
        .delete()
        .eq('id', recordId);

      if (error) throw new Error(error.message);
      return recordId;
    },
    onSuccess: (deletedId) => {
      // Invalidate all record-related queries
      queryClient.invalidateQueries({ queryKey: recordKeys.all });
      queryClient.invalidateQueries({ queryKey: recordKeys.dailyDurations() });
      
      // Optimistically update all record lists
      queryClient.setQueriesData(
        { queryKey: recordKeys.lists() },
        (oldData: TimeRecord[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.filter(record => record.id !== deletedId);
        }
      );
    },
  });
};

// Create record mutation
export const useCreateRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (record: Omit<TimeRecord, 'id'> & { user_id: string }) => {
      const { data, error } = await supabase
        .from('records')
        .insert(record)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as TimeRecord;
    },
    onSuccess: (newRecord) => {
      // Invalidate all record-related queries
      queryClient.invalidateQueries({ queryKey: recordKeys.all });
      queryClient.invalidateQueries({ queryKey: recordKeys.dailyDurations() });
    },
  });
};

// Update record mutation
export const useUpdateRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TimeRecord> & { id: number }) => {
      const { data, error } = await supabase
        .from('records')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as TimeRecord;
    },
    onSuccess: (updatedRecord) => {
      // Invalidate all record-related queries
      queryClient.invalidateQueries({ queryKey: recordKeys.all });
      queryClient.invalidateQueries({ queryKey: recordKeys.dailyDurations() });
    },
  });
};

// Stopwatch session mutations
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
