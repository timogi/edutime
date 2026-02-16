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
    const { data, error } = await supabase.from('records').update(record).eq('id', record.id)
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

export const getDailyDurations = async (start: Date, end: Date, user_id: String) => {
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
      (acc: { [date: string]: number }, record: { date: string; duration: number }) => {
        acc[record.date] = (acc[record.date] || 0) + record.duration
        return acc
      },
      {},
    )

    return aggregation as DailyDuration
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
