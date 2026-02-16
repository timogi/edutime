import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { TimeRecord } from '@/types/globals'
import { supabase } from '../client'
import { getIsoDate } from '@/functions/helpers'
import {
  insertRecord,
  insertRecords,
  updateTimeRecord,
  deleteTimeRecord,
  getRecords,
  getDailyDurations,
} from '../records'

// Query keys
export const recordKeys = {
  all: ['records'] as const,
  byDate: (date: string, user_id: string) => [...recordKeys.all, 'date', date, user_id] as const,
  byDateRange: (start: string, end: string, user_id: string) =>
    [...recordKeys.all, 'range', start, end, user_id] as const,
  dailyDurations: (start: string, end: string, user_id: string) =>
    [...recordKeys.all, 'durations', start, end, user_id] as const,
}

// Hook to get records for a specific date
export const useRecords = (date: string, user_id: string) => {
  return useQuery({
    queryKey: recordKeys.byDate(date, user_id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('records')
        .select('*')
        .eq('date', date)
        .eq('user_id', user_id)
        .order('start_time', { ascending: true })

      if (error) {
        if (error.message.includes('JWT') || error.message.includes('token')) {
          console.warn('Auth error in useRecords, session may have expired')
          return []
        }
        throw new Error(error.message)
      }

      // Add user_id to each record for consistency
      const records = (data || []).map((record: any) => ({
        ...record,
        user_id,
      }))

      return records as TimeRecord[]
    },
    enabled: !!date && !!user_id,
  })
}

// Hook to get records for a date range
export const useRecordsByDateRange = (start: Date, end: Date, user_id: string) => {
  const startISO = getIsoDate(start)
  const endISO = getIsoDate(end)

  return useQuery({
    queryKey: recordKeys.byDateRange(startISO, endISO, user_id),
    queryFn: () => getRecords(start, end, user_id),
    enabled: !!start && !!end && !!user_id,
  })
}

// Hook to get daily durations for a date range
export const useDailyDurations = (startDate: Date, endDate: Date, user_id: string) => {
  const start = getIsoDate(startDate)
  const end = getIsoDate(endDate)

  return useQuery({
    queryKey: recordKeys.dailyDurations(start, end, user_id),
    queryFn: () => getDailyDurations(startDate, endDate, user_id),
    enabled: !!startDate && !!endDate && !!user_id,
  })
}

// Mutation to insert a single record
export const useInsertRecord = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: insertRecord,
    onSuccess: (data, variables) => {
      if (!variables.user_id) return
      // Invalidate queries for the specific date
      queryClient.invalidateQueries({
        queryKey: recordKeys.byDate(variables.date, variables.user_id),
      })
      // Invalidate all daily durations queries for this user (using prefix match)
      queryClient.invalidateQueries({
        queryKey: [...recordKeys.all, 'durations'],
      })
      // Invalidate all date range queries for this user
      queryClient.invalidateQueries({
        queryKey: [...recordKeys.all, 'range'],
      })
    },
  })
}

// Mutation to insert multiple records
export const useInsertRecords = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: insertRecords,
    onSuccess: (data, variables) => {
      // Invalidate all records queries since we don't know which dates were affected
      queryClient.invalidateQueries({
        queryKey: recordKeys.all,
      })
      // Also invalidate daily durations and date range queries
      queryClient.invalidateQueries({
        queryKey: [...recordKeys.all, 'durations'],
      })
      queryClient.invalidateQueries({
        queryKey: [...recordKeys.all, 'range'],
      })
    },
  })
}

// Mutation to update a record
export const useUpdateRecord = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateTimeRecord,
    onSuccess: (data, variables) => {
      // Extract user_id from variables if it's a TimeRecord with user_id, otherwise use the record's user_id
      const user_id = (variables as any).user_id
      if (user_id && variables.date) {
        // Invalidate queries for the specific date
        queryClient.invalidateQueries({
          queryKey: recordKeys.byDate(variables.date, user_id),
        })
        // Invalidate all daily durations queries for this user (using prefix match)
        queryClient.invalidateQueries({
          queryKey: [...recordKeys.all, 'durations'],
        })
        // Invalidate all date range queries for this user
        queryClient.invalidateQueries({
          queryKey: [...recordKeys.all, 'range'],
        })
      } else {
        // Fallback: invalidate all record queries
        queryClient.invalidateQueries({
          queryKey: recordKeys.all,
        })
      }
    },
  })
}

// Mutation to delete a record
export const useDeleteRecord = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: { id: number; date: string; user_id: string }) => {
      await deleteTimeRecord(variables.id)
      return variables
    },
    onSuccess: (variables) => {
      // Invalidate queries for the specific date
      queryClient.invalidateQueries({
        queryKey: recordKeys.byDate(variables.date, variables.user_id),
      })
      // Invalidate all daily durations queries for this user (using prefix match)
      queryClient.invalidateQueries({
        queryKey: [...recordKeys.all, 'durations'],
      })
      // Invalidate all date range queries for this user
      queryClient.invalidateQueries({
        queryKey: [...recordKeys.all, 'range'],
      })
    },
  })
}
