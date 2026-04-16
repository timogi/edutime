import { Category, CategoryBase, EmploymentCategory, UserData } from '@/types/globals'
import type { Database } from '@edutime/shared'
import type { User as AuthUser } from '@supabase/supabase-js'
import { supabase } from './client'

type UsersRowUpdate = Database['public']['Tables']['users']['Update']
type UserCategoriesUpdate = Database['public']['Tables']['user_categories']['Update']
import { set } from 'date-fns'

export const setNewPassword = async (password: string) => {
  await supabase.auth.updateUser({
    password,
  })
}

export async function changePassword(oldPassword: string, newPassword: string) {
  try {
    const email = await getUserEmail()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: oldPassword,
    })

    if (signInError) {
      throw new Error('Invalid current password')
    }

    try {
      await setNewPassword(newPassword)
      return { message: 'Password updated successfully' }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to update password' }
    }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'An unexpected error occurred' }
  }
}

export const updateUserData = async (userData: Partial<UserData>, user_id: string) => {
  try {
    const { user_categories: _uc, email: _em, is_organization: _org, ...dbFields } = userData
    const { error } = await supabase.from('users').update(dbFields as UsersRowUpdate).eq('user_id', user_id)
    if (error) {
      console.error('error', error)
      throw error
    }
  } catch (error) {
    console.error('Failed to update user data:', error)
    throw error
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

/**
 * Loads app user row + categories. If `authUser` is omitted, calls `getUser()` (extra auth lock).
 * Prefer passing `authUser` from `getSession().user` when you already have a session to avoid
 * concurrent `getSession` + `getUser` fighting the same Supabase storage lock.
 */
export const getUserData = async (authUser?: AuthUser): Promise<UserData | null> => {
  const userObject = authUser ?? (await supabase.auth.getUser()).data.user

  if (!userObject) {
    return null
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', userObject.id)
    .maybeSingle()

  if (userError) {
    console.error('Error loading user profile:', userError)
    return null
  }

  if (!userData) {
    // Auth user exists but no `public.users` row yet (incomplete signup, etc.) — not an application error
    return null
  }

  const userCategories = await getUserCategories(userObject.id)

  const userWithCategories: UserData = {
    ...(userData as unknown as UserData),
    email: userObject.email ?? '',
    is_organization: false,
    user_categories: userCategories,
  }

  return userWithCategories
}

export const getUserEmail = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw new Error('Error fetching user data: ' + error.message)
  }

  return user?.email || ''
}

export const createUserCategory = async (
  userId: string,
  category: EmploymentCategory,
): Promise<EmploymentCategory | null> => {
  const { data, error } = await supabase
    .from('user_categories')
    .insert([{ ...category, user_id: userId, color: category.color ?? '' }])
    .single()

  if (error) {
    console.error('error', error)
    return null
  }

  return data
}

export const updateUserCategory = async (
  categoryId: number,
  updatedCategory: Partial<EmploymentCategory>,
): Promise<EmploymentCategory | null> => {
  const payload: UserCategoriesUpdate = {
    ...updatedCategory,
    color: updatedCategory.color === null ? undefined : updatedCategory.color,
  }
  const { data, error } = await supabase.from('user_categories').update(payload).eq('id', categoryId).single()

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

export const createUserCustomTarget = async (
  userId: string,
  categorySetId: number,
  targetPercentage: number,
): Promise<boolean> => {
  const { error } = await supabase.from('user_custom_targets').insert([
    {
      user_id: userId,
      category_set_id: categorySetId,
      target_percentage: targetPercentage,
    },
  ])

  if (error) {
    console.error('Error creating user custom target', error)
    return false
  }

  return true
}

export const updateUserCustomTarget = async (
  targetId: number,
  targetPercentage: number,
): Promise<boolean> => {
  const { error } = await supabase
    .from('user_custom_targets')
    .update({ target_percentage: targetPercentage })
    .eq('id', targetId)

  if (error) {
    console.error('Error updating user custom target', error)
    return false
  }

  return true
}

export const updateUserStatDates = async (
  userId: string,
  statStartDate: string | null,
  statEndDate: string | null,
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        stat_start_date: statStartDate,
        stat_end_date: statEndDate,
      })
      .eq('user_id', userId)

    if (error) {
      console.error('Error updating user stat dates', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Failed to update user stat dates:', error)
    return false
  }
}
