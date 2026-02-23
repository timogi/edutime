import { createClient } from '@supabase/supabase-js'
import { supabase } from './client'
import type { Database, Entitlement } from '@edutime/shared'

const licenseSupabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    db: {
      schema: 'license',
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  },
)

/**
 * Check if a user has an active entitlement
 * An entitlement is considered active if:
 * - status is 'active'
 * - valid_from <= now()
 * - valid_until is null OR valid_until >= now()
 */
export const hasActiveEntitlement = async (userId: string): Promise<boolean> => {
  const now = new Date().toISOString()

  // Use license schema client to query entitlements table
  const { data, error } = await licenseSupabase
    .from('entitlements')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .lte('valid_from', now)
    .or(`valid_until.is.null,valid_until.gte.${now}`)
    .limit(1)

  if (error) {
    console.error('Error checking active entitlement:', error)
    return false
  }

  return (data?.length ?? 0) > 0
}

/**
 * Get all entitlements for a user
 */
export const getUserEntitlements = async (userId: string): Promise<Entitlement[]> => {
  // Use license schema client to query entitlements table
  const { data, error } = await licenseSupabase
    .from('entitlements')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user entitlements:', error)
    return []
  }

  return (data || []) as Entitlement[]
}

/**
 * Get active entitlements for a user
 */
export const getActiveUserEntitlements = async (userId: string): Promise<Entitlement[]> => {
  const now = new Date().toISOString()

  // Use license schema client to query entitlements table
  const { data, error } = await licenseSupabase
    .from('entitlements')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .lte('valid_from', now)
    .or(`valid_until.is.null,valid_until.gte.${now}`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching active entitlements:', error)
    return []
  }

  return (data || []) as Entitlement[]
}

/**
 * Check if a user has ever had a trial entitlement (regardless of status)
 * This is used to determine if the user can start a new demo trial
 */
export const hasEverHadTrial = async (userId: string): Promise<boolean> => {
  // Use license schema client to query entitlements table
  const { data, error } = await licenseSupabase
    .from('entitlements')
    .select('id')
    .eq('user_id', userId)
    .eq('kind', 'trial')
    .limit(1)

  if (error) {
    console.error('Error checking trial entitlement:', error)
    return false
  }

  return (data?.length ?? 0) > 0
}
