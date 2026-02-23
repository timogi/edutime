import { supabase } from '../supabase'
import { Database, Tables } from '@edutime/shared'
import { EmploymentCategory, TimeRecord } from '../types'

interface UserData {
  canton_code: string
  user_id: string
}

interface CategoryWithMeta {
  id: number
  title: string
  subtitle: string
  canton_code: string | null
  category_set_id: number
  created_at: string
  order: number | null
  category_sets: {
    color: string
    title: string
  }
}

export interface CategoryResult {
  id: number
  title: string
  subtitle: string
  color: string
  category_set_title: string
  is_further_employment: boolean
  order: number | null
}

export const getCategories = async (userData: UserData) => {
  const { data, error } = await supabase
    .from('categories')
    .select(
      `
        id,
        title,
        subtitle,
        canton_code,
        category_set_id,
        created_at,
        order,
        category_sets(color,title)
      `,
    )
    .eq('canton_code', userData.canton_code)
    .order('order')

  if (error) {
    throw error
  }

  const categories = data.map((item) => ({
    id: item.id,
    title: item.title,
    subtitle: item.subtitle,
    color: (item.category_sets as any)?.color || null,
    category_set_title: (item.category_sets as any)?.title || '',
    is_further_employment: false,
    order: item.order
  }))

  return categories as CategoryResult[]
}

export const getAllCategories = async (userData: UserData) => {
  const { data: userCategories, error: userCategoriesError } = await supabase
    .from('user_categories')
    .select('*')
    .eq('user_id', userData.user_id)

  if (userCategoriesError) {
    throw userCategoriesError
  }

  const categories = await getCategories(userData)

  const userCategoriesCategory = (userCategories || []).map((cat: Tables<'user_categories'>) => ({
    id: cat.id,
    title: cat.title,
    subtitle: cat.subtitle,
    color: cat.color,
    category_set_title: 'furtherEmployment',
    is_further_employment: true,
    order: null
  }))

  return [...categories, ...userCategoriesCategory] as CategoryResult[]
}

export const findCategory = (record: TimeRecord, categories: CategoryResult[]) => {
  if (record.is_user_category) {
    return categories.find(
      (cat) => cat.id === record.user_category_id && cat.category_set_title === 'furtherEmployment',
    )
  } else {
    return categories.find(
      (cat) => cat.id === record.category_id && cat.category_set_title !== 'furtherEmployment',
    )
  }
}

export const getUserCategories = async (userId: string): Promise<EmploymentCategory[]> => {
  const { data: categoriesData, error: categoriesError } = await supabase
    .from('user_categories')
    .select('id, title, subtitle, color, workload')
    .eq('user_id', userId)
    .order('id')

  if (categoriesError) {
    console.error('error', categoriesError)
    return []
  }

  return categoriesData || []
}