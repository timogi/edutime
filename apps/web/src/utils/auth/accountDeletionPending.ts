import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@edutime/shared'

/**
 * True if the user has a row in account_deletion that is not processed yet.
 * Uses RLS (own rows only). On error, returns false so normal users are not locked out.
 */
export async function hasPendingAccountDeletion(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('account_deletion')
    .select('id')
    .eq('user_id', userId)
    .is('processed_at', null)
    .maybeSingle()

  if (error) {
    console.error('hasPendingAccountDeletion:', error)
    return false
  }
  return data != null
}
