import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import type { Entitlement } from './types'

/**
 * Browser / anon Supabase clients must not read `license.*` directly (no schema USAGE).
 * Entitlement reads go through public `api_*` RPCs (SECURITY DEFINER).
 */
type LicensingClient = Pick<SupabaseClient<Database>, 'rpc'>

/**
 * License rows shown in account/settings UIs.
 * Matches the web account license list: hides entitlements with status `expired` (e.g. abgelaufen).
 */
export function visibleUserEntitlements(entitlements: Entitlement[]): Entitlement[] {
  return entitlements.filter((e) => e.status !== 'expired')
}

function parseEntitlementsPayload(data: unknown): Entitlement[] {
  if (!Array.isArray(data)) {
    return []
  }
  return data as Entitlement[]
}

export async function hasActiveEntitlement(supabase: LicensingClient, _userId: string): Promise<boolean> {
  void _userId
  const { data, error } = await supabase.rpc('api_user_has_active_entitlement')
  if (error) throw error
  return Boolean(data)
}

export async function getUserEntitlements(supabase: LicensingClient, _userId: string): Promise<Entitlement[]> {
  void _userId
  const { data, error } = await supabase.rpc('api_get_my_entitlements')
  if (error) throw error
  return parseEntitlementsPayload(data)
}

export async function getActiveUserEntitlements(
  supabase: LicensingClient,
  userId: string,
): Promise<Entitlement[]> {
  const nowIso = new Date().toISOString()
  const all = await getUserEntitlements(supabase, userId)
  return all.filter(
    (e) =>
      e.status === 'active' &&
      e.valid_from <= nowIso &&
      (e.valid_until == null || e.valid_until >= nowIso),
  )
}

export async function hasEverHadTrial(supabase: LicensingClient, _userId: string): Promise<boolean> {
  void _userId
  const { data, error } = await supabase.rpc('api_has_ever_had_trial')
  if (error) throw error
  return Boolean(data)
}
