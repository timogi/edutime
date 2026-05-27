import { convertMinutesToHoursAndMinutes, getIsoDate, normalizeTimeString } from '@/functions/helpers'
import { Category, TimeRecord } from '@/types/globals'
import { findCategory } from '@/utils/supabase/categories'

export interface RecordsCsvLabels {
  date: string
  from: string
  to: string
  category: string
  description: string
  duration: string
  noCategory: string
  otherCanton: string
}

function formatRecordTime(time: string | null): string {
  return normalizeTimeString(time)
}

function escapeCsvValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function getRecordCategoryLabel(
  record: TimeRecord,
  categories: Category[],
  t_cat: (key: string) => string,
  labels: Pick<RecordsCsvLabels, 'noCategory' | 'otherCanton'>,
): string {
  const category = findCategory(record, categories)
  if (category) {
    return category.category_set_title === 'furtherEmployment' || category.category_set_title === 'custom'
      ? category.title
      : t_cat(category.title)
  }
  if (record.category_id) {
    return labels.otherCanton
  }
  return labels.noCategory
}

export function buildRecordsCsv(
  records: TimeRecord[],
  categories: Category[],
  labels: RecordsCsvLabels,
  t_cat: (key: string) => string,
): string {
  const headers = [
    labels.date,
    labels.from,
    labels.to,
    labels.category,
    labels.description,
    labels.duration,
  ]
  const rows = records.map((record) => [
    escapeCsvValue(getIsoDate(new Date(record.date))),
    escapeCsvValue(formatRecordTime(record.start_time)),
    escapeCsvValue(formatRecordTime(record.end_time)),
    escapeCsvValue(getRecordCategoryLabel(record, categories, t_cat, labels)),
    escapeCsvValue(record.description ?? ''),
    escapeCsvValue(convertMinutesToHoursAndMinutes(record.duration ?? 0)),
  ])

  return [headers.map(escapeCsvValue).join(','), ...rows.map((row) => row.join(','))].join('\n')
}

export function triggerCsvDownload(csvContent: string, filename: string): void {
  const blob = new Blob(['\uFEFF', csvContent], { type: 'text/csv;charset=utf-8;' })
  const blobUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = blobUrl
  link.download = filename
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  if (link.parentNode === document.body) {
    document.body.removeChild(link)
  }
  URL.revokeObjectURL(blobUrl)
}
