import { supabase } from '../supabase'
import { Database } from '@edutime/shared'
import { ConfigProfileData, ProfileCategoryData } from '@edutime/shared'
import { CategoryResult } from './categories'

type ConfigProfileRow = Database['public']['Tables']['config_profiles']['Row']
type ProfileCategoryRow = Database['public']['Tables']['profile_categories']['Row']

export async function getConfigProfile(profileId: string): Promise<ConfigProfileData | null> {
  const { data, error } = await supabase
    .from('config_profiles')
    .select('id, title, annual_work_hours')
    .eq('id', profileId)
    .single()

  if (error) {
    console.error('Error fetching config profile:', error)
    return null
  }

  return data
}

export async function getExistingConfigProfile(userId: string): Promise<ConfigProfileRow | null> {
  const { data, error } = await supabase
    .from('config_profiles')
    .select('*')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Error fetching existing config profile:', error)
    return null
  }

  return data
}

export async function getOrCreateConfigProfile(
  userId: string,
): Promise<ConfigProfileRow> {
  const existing = await getExistingConfigProfile(userId)
  if (existing) return existing

  const { data, error } = await supabase
    .from('config_profiles')
    .insert({ user_id: userId, annual_work_hours: 1930, title: 'Custom' })
    .select()
    .single()

  if (error) throw error

  return data
}

export async function updateConfigProfile(
  profileId: string,
  updates: { annual_work_hours?: number; title?: string },
): Promise<void> {
  const { error } = await supabase
    .from('config_profiles')
    .update(updates)
    .eq('id', profileId)

  if (error) throw error
}

export async function getProfileCategories(profileId: string): Promise<ProfileCategoryData[]> {
  const { data, error } = await supabase
    .from('profile_categories')
    .select('id, title, color, weight, order, config_profile_id')
    .eq('config_profile_id', profileId)
    .order('order')

  if (error) {
    console.error('Error fetching profile categories:', error)
    return []
  }

  return data || []
}

export async function createProfileCategory(
  userId: string,
  profileId: string,
  category: { title: string; color?: string; weight?: number; order?: number | null },
): Promise<ProfileCategoryRow> {
  const { data, error } = await supabase
    .from('profile_categories')
    .insert({
      user_id: userId,
      config_profile_id: profileId,
      title: category.title,
      color: category.color ?? '#845ef7',
      weight: category.weight ?? 0,
      order: category.order ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProfileCategory(
  id: string,
  updates: { title?: string; color?: string; weight?: number; order?: number | null },
): Promise<void> {
  const { error } = await supabase
    .from('profile_categories')
    .update(updates)
    .eq('id', id)

  if (error) throw error
}

export async function deleteProfileCategory(id: string): Promise<void> {
  const { error: recordsError } = await supabase
    .from('records')
    .update({ profile_category_id: null })
    .eq('profile_category_id', id)

  if (recordsError) throw recordsError

  const { error } = await supabase
    .from('profile_categories')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function countRecordsForProfileCategory(
  profileCategoryId: string,
  userId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from('records')
    .select('*', { count: 'exact', head: true })
    .eq('profile_category_id', profileCategoryId)
    .eq('user_id', userId)

  if (error) throw error
  return count ?? 0
}


export async function activateCustomMode(userId: string, profileId: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ active_config_profile_id: profileId })
    .eq('user_id', userId)

  if (error) throw error
}

export async function deactivateCustomMode(userId: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ active_config_profile_id: null })
    .eq('user_id', userId)

  if (error) throw error
}

export function profileCategoriesToCategoryResults(
  profileCategories: ProfileCategoryData[],
): CategoryResult[] {
  return profileCategories.map(pc => ({
    id: pc.id as unknown as number,
    title: pc.title,
    subtitle: '',
    color: pc.color,
    category_set_title: 'custom',
    is_further_employment: false,
    is_profile_category: true,
    profile_category_id: pc.id,
    order: pc.order,
  }))
}
