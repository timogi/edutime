import { Category, CategoryBase, EmploymentCategory, UserData } from '@/types/globals'
import { supabase } from './client'
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
    const { error } = await supabase.from('users').update(userData).eq('user_id', user_id)
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

export const getUserData = async (): Promise<UserData | null> => {
  const user = await supabase.auth.getUser()

  const userObject = user?.data.user

  if (!userObject) {
    return null
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', userObject.id)
    .single()

  if (userError) {
    console.error('error', userError)
    return null
  }

  if (userData) {
    userData.email = userObject.email
  }

  const userCategories = await getUserCategories(userObject.id)

  const userWithCategories: UserData = {
    ...userData,
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

export async function deleteAccount(password: string, user_id: string) {
  try {
    const email = await getUserEmail()

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      console.error('Sign in error', signInError)
      throw new Error('Invalid password')
    }

    const { error: deleteError } = await supabase.from('account_deletion').insert({
      user_id,
      email,
    })

    if (deleteError) {
      console.error('Delete error', deleteError)
      throw new Error('Account may already be scheduled for deletion.')
    }

    return { message: 'Account deleted successfully' }
  } catch (error) {
    console.error('Error in deleteAccount', error)
    throw error // Rethrow to handle it in the calling context
  }
}

export const createUserCategory = async (
  userId: string,
  category: EmploymentCategory,
): Promise<EmploymentCategory | null> => {
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
  updatedCategory: Partial<EmploymentCategory>,
): Promise<EmploymentCategory | null> => {
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
