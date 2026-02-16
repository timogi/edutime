import { supabase } from '@/lib/supabase'
import { Database, Tables, TablesInsert } from '@/database.types'

export const createUserCategory = async (
  userId: string,
  category: Omit<TablesInsert<'user_categories'>, 'user_id'>
): Promise<Tables<'user_categories'> | null> => {
  const { data, error } = await supabase
    .from('user_categories')
    .insert([{ ...category, user_id: userId }])
    .single()

  if (error) {
    console.error('error', error)
    return null
  }

  return data
}

export const updateUserCategory = async (
  categoryId: number,
  updatedCategory: Partial<Tables<'user_categories'>>
): Promise<Tables<'user_categories'> | null> => {
  const { data, error } = await supabase
    .from('user_categories')
    .update(updatedCategory)
    .eq('id', categoryId)
    .single()

  if (error) {
    console.error('error', error)
    return null
  }

  return data
}

export const deleteUserCategory = async (categoryId: number): Promise<boolean> => {
  const { error } = await supabase.from('user_categories').delete().eq('id', categoryId)

  if (error) {
    console.error('error', error)
    return false
  }

  return true
}
