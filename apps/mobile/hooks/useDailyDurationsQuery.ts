import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { recordKeys } from './useRecordsQuery';

// Fetch daily durations for a date range
export const fetchDailyDurations = async (
  startDate: string, 
  endDate: string, 
  userId: string
): Promise<{ [date: string]: number }> => {
  const { data, error } = await supabase
    .from('records')
    .select('date, duration')
    .gte('date', startDate)
    .lte('date', endDate)
    .eq('user_id', userId)
    .order('date', { ascending: true });

  if (error) throw new Error(error.message);

  const aggregation = (data || []).reduce(
    (acc: { [date: string]: number }, record: { date: string; duration: number | null }) => {
      acc[record.date] = (acc[record.date] || 0) + (record.duration || 0);
      return acc;
    },
    {}
  );

  return aggregation;
};

// Hook to get daily durations for a date range
export const useDailyDurationsQuery = (startDate: string, endDate: string, userId: string) => {
  return useQuery({
    queryKey: recordKeys.dailyDurationsList({ startDate, endDate, userId }),
    queryFn: () => fetchDailyDurations(startDate, endDate, userId),
    enabled: !!userId && !!startDate && !!endDate,
    staleTime: 30 * 1000, // 30 seconds
  });
};
