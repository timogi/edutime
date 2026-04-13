export interface RecordFormData {
  date: Date
  startTime: Date | null
  endTime: Date | null
  description?: string
  category?: number
  duration: Date
  category_id?: number | null
  is_user_category?: boolean
  user_category_id?: number | null
}
