import React from 'react'
import { Category, TimeRecord } from '@/types/globals'
import { SortableRecordTable } from './SortableRecordTable'

interface RecordTableProps {
  date: Date
  openEditTimeEntryModal: (timeRecord: TimeRecord) => void
  user_id: string
  categories: Category[]
  records: TimeRecord[]
  loading: boolean
  error: Error | null
}

export function RecordTable({
  date,
  openEditTimeEntryModal,
  user_id,
  categories,
  records,
  loading,
  error,
}: RecordTableProps) {
  return (
    <SortableRecordTable
      date={date}
      openEditTimeEntryModal={openEditTimeEntryModal}
      user_id={user_id}
      categories={categories}
      records={records}
      loading={loading}
      error={error}
    />
  )
}
