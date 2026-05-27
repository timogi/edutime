import { CategoryStatistic, DailyDuration, DailySums, TimeRecord } from '@/types/globals'
import { supabase } from './client'
import { getIsoDate } from '@/functions/helpers'

export const insertRecord = async (record: TimeRecord) => {
  try {
    const { data, error } = await supabase.from('records').insert([record])
    if (error) {
      console.error('error', error)
      throw error
    }
    return data
  } catch (error) {
    console.error('Failed to insert record:', error)
    throw error
  }
}

export const insertRecords = async (records: TimeRecord[]) => {
  try {
    const { data, error } = await supabase.from('records').insert(records)
    if (error) {
      console.error('error', error)
      throw error
    }
    return data
  } catch (error) {
    console.error('Failed to insert records:', error)
    throw error
  }
}

export const updateTimeRecord = async (record: TimeRecord) => {
  try {
    const { data, error } = await supabase.from('records').update(record).eq('id', record.id!)
    if (error) {
      console.error('error', error)
      throw error
    }
    return data
  } catch (error) {
    console.error('Failed to update record:', error)
    throw error
  }
}

export const deleteTimeRecord = async (id: number) => {
  try {
    const { data, error } = await supabase.from('records').delete().eq('id', id)
    if (error) {
      console.error('error', error)
      throw error
    }
    return data
  } catch (error) {
    console.error('Failed to delete record:', error)
    throw error
  }
}

export const getDailyDurations = async (start: Date, end: Date, user_id: string) => {
  const startISO = getIsoDate(start)
  const endISO = getIsoDate(end)
  try {
    const { data, error } = await supabase
      .from('records')
      .select('date, duration')
      .gte('date', startISO)
      .lte('date', endISO)
      .eq('user_id', user_id)
      .order('date', { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    // Aggregate durations by date
    const aggregation = (data || []).reduce(
      (acc: { [date: string]: number }, record: { date: string; duration: number | null }) => {
        acc[record.date] = (acc[record.date] || 0) + (record.duration ?? 0)
        return acc
      },
      {} as { [date: string]: number },
    )

    return aggregation
  } catch (err) {
    console.error('error', err)
    return {}
  }
}

export const getRecords = async (start: Date, end: Date, user_id: string) => {
  const startISO = getIsoDate(start)
  const endISO = getIsoDate(end)

  try {
    const { data, error } = await supabase
      .from('records')
      .select('*')
      .gte('date', startISO)
      .lte('date', endISO)
      .eq('user_id', user_id)
      .order('date', { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    return data as TimeRecord[]
  } catch (err) {
    console.error('error', err)
    return []
  }
}

export const countUserRecords = async (user_id: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('records')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id)

    if (error) {
      throw new Error(error.message)
    }

    return count ?? 0
  } catch (err) {
    console.error('error', err)
    return 0
  }
}

export const getAllRecords = async (user_id: string) => {
  try {
    const { data, error } = await supabase
      .from('records')
      .select('*')
      .eq('user_id', user_id)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    return data as TimeRecord[]
  } catch (err) {
    console.error('error', err)
    return []
  }
}
