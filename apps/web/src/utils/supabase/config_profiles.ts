import { supabase } from './client'
import { Database, ConfigProfileData, ProfileCategoryData } from '@edutime/shared'

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
    .select('id, title, subtitle, color, weight, order, config_profile_id')
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
  category: { title: string; subtitle?: string; color?: string; weight?: number; order?: number | null },
): Promise<ProfileCategoryRow> {
  const { data, error } = await supabase
    .from('profile_categories')
    .insert({
      user_id: userId,
      config_profile_id: profileId,
      title: category.title,
      subtitle: category.subtitle ?? '',
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
  updates: { title?: string; subtitle?: string; color?: string; weight?: number; order?: number | null },
): Promise<void> {
  const { error } = await supabase
    .from('profile_categories')
    .update(updates)
    .eq('id', id)

  if (error) throw error
}

export async function deleteProfileCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from('profile_categories')
    .delete()
    .eq('id', id)

  if (error) throw error
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
