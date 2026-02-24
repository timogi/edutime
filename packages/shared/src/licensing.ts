import type { Entitlement } from './types'

interface EntitlementFilterQuery {
  then<TResult1 = { data: Entitlement[] | null; error: unknown }, TResult2 = never>(
    onfulfilled?:
      | ((value: { data: Entitlement[] | null; error: unknown }) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2>
  eq(column: string, value: string): EntitlementFilterQuery
  lte(column: string, value: string): EntitlementFilterQuery
  or(filter: string): EntitlementFilterQuery
  limit(count: number): EntitlementFilterQuery
  order(column: string, options: { ascending: boolean }): EntitlementFilterQuery
}

interface LicenseClient {
  schema(schema: 'license'): {
    from(table: 'entitlements'): {
      select(columns: string): unknown
    }
  }
}

const entitlementTable = (supabase: LicenseClient) => supabase.schema('license').from('entitlements')

const entitlementSelect = (supabase: LicenseClient, columns: string): EntitlementFilterQuery =>
  entitlementTable(supabase).select(columns) as EntitlementFilterQuery

const activeEntitlementFilter = (supabase: LicenseClient, userId: string, nowIso: string) =>
  entitlementSelect(supabase, '*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .lte('valid_from', nowIso)
    .or(`valid_until.is.null,valid_until.gte.${nowIso}`)

export async function hasActiveEntitlement(
  supabase: LicenseClient,
  userId: string,
): Promise<boolean> {
  const nowIso = new Date().toISOString()
  const { data, error } = await activeEntitlementFilter(supabase, userId, nowIso).limit(1)

  if (error) throw error
  return (data?.length ?? 0) > 0
}

export async function getUserEntitlements(
  supabase: LicenseClient,
  userId: string,
): Promise<Entitlement[]> {
  const { data, error } = await entitlementSelect(supabase, '*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as Entitlement[]
}

export async function getActiveUserEntitlements(
  supabase: LicenseClient,
  userId: string,
): Promise<Entitlement[]> {
  const nowIso = new Date().toISOString()
  const { data, error } = await activeEntitlementFilter(supabase, userId, nowIso).order('created_at', {
    ascending: false,
  })

  if (error) throw error
  return (data || []) as Entitlement[]
}

export async function hasEverHadTrial(
  supabase: LicenseClient,
  userId: string,
): Promise<boolean> {
  const { data, error } = await entitlementSelect(supabase, 'id')
    .eq('user_id', userId)
    .eq('kind', 'trial')
    .limit(1)

  if (error) throw error
  return (data?.length ?? 0) > 0
}
