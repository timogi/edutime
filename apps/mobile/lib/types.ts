import { Colors } from '@/constants/Colors';

export type ColorTheme = typeof Colors.light;

export type CategorySet = {
  title_de: string
  target_percentage: number
  categories: Category[]
  id: string
  color: string
}

export type CantonConfiguration = {
  annualWorkHours: number
}

export type TimerTimeRecord = {
  stopWatchId: string
  date: Date
  duration: number
  description: string | null
  categoryId: string | null
  startTime: Date | null
}

export type Vacation = {
  id: number
  start_date: string
  end_date: string
  title: string
}

export type ConfigMode = 'default' | 'custom'

export const getConfigMode = (user: { active_config_profile_id: string | null }): ConfigMode =>
  user.active_config_profile_id ? 'custom' : 'default'

export type BaseTimeRecord = {
  id?: number
  category_id: number | null
  is_user_category: boolean
  user_category_id: number | null
  profile_category_id?: string | null
}

export type StopWatchSession = BaseTimeRecord & {
  start_time: Date
  description: string
}

export type TimeRecord = BaseTimeRecord & {
  date: string
  duration: number
  description: string
  start_time: string | null
  end_time: string | null
}

export type CategoryBase = {
  id: number
  title: string
  subtitle: string
  color: string | null
}

export type EmploymentCategory = CategoryBase & {
  workload: number
}

export type Category = CategoryBase & {
  category_set_title: string
  profile_category_id?: string
}

export type DailySums = { [date: string]: { duration: number } }

export type CategoryStatistic = {
  duration: number
  is_user_category: boolean
  category_id: number | null
  user_category_id: number | null
  user_category_workload: number | null
}
export type DailyDuration = {
  [date: string]: number
}

export type UserData = {
  user_id: string
  email: string
  first_name: string
  last_name: string
  canton_code: string
  is_mode_dark: boolean
  is_organization: boolean
  language: string
  user_categories: EmploymentCategory[]
  workload: number
  custom_work_hours: number
}

export type Organization = {
  id: number
  name: string
  seats: number
}

export type Membership = {
  id: number
  name: string
  status: 'invited' | 'active' | 'rejected'
}


export interface CantonData {
  annual_work_hours: number
  title: string
  has_subcategories: boolean
  is_configurable: boolean
  is_working_hours_disabled: boolean
  use_custom_work_hours: boolean
  category_sets: {
    id: number
    percentage: number
    title: string
    min_target_percentage: string | null
    max_target_percentage: string | null
    user_percentage: number | null
    user_percentage_id: number | null
  }[]
}