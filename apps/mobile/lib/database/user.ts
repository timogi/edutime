import { Database } from '@edutime/shared';
import { supabase, tempSupabase } from '@/lib/supabase'

export async function getUser(userId: string): Promise<Database['public']['Tables']['users']['Row'] | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) { 
    throw error;
  }

  return data;
}

export async function updateUserData(
  userId: string,
  userData: Partial<Database['public']['Tables']['users']['Update']>
): Promise<Database['public']['Tables']['users']['Row'] | null> {
  const { data, error } = await supabase
    .from('users')
    .update(userData)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateUserStatisticsDates(
  userId: string,
  statStartDate: string,
  statEndDate: string
): Promise<Database['public']['Tables']['users']['Row'] | null> {
  return updateUserData(userId, {
    stat_start_date: statStartDate,
    stat_end_date: statEndDate
  });
}


export async function deleteAccount(password: string, user_id: string, email: string) {
  try {
    // Verify password using the temporary client
    // This won't affect the current user's session
    const { error: signInError } = await tempSupabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      console.error('Password verification failed:', signInError.message)
      throw new Error('Invalid password')
    }

    // Password is correct — queue deletion (same eligibility rules as web via RPC)
    const { data: enqueueResult, error: enqueueError } = await supabase.rpc('account_deletion_enqueue', {
      p_email: email,
    })

    if (enqueueError) {
      console.error('account_deletion_enqueue failed:', enqueueError.message)
      throw new Error('Failed to queue account deletion.')
    }

    const payload = enqueueResult as { ok?: boolean; code?: string } | null
    if (!payload || payload.ok !== true) {
      if (payload?.code === 'SOLE_ADMIN_BLOCKER') {
        throw new Error(
          'Account deletion blocked: you are the only admin in active organizations. Assign another admin or deactivate those organizations first.',
        )
      }
      if (payload?.code === 'PERSONAL_SUBSCRIPTION_CANCEL_REQUIRED') {
        throw new Error(
          'Cancel your personal subscription from license settings before deleting your account.',
        )
      }
      throw new Error('Account deletion is not allowed right now.')
    }

    // Only sign out after successful deletion
    await supabase.auth.signOut();

    return { message: 'Account deleted successfully' }
  } catch (error) {
    console.error('Error in deleteAccount', error)
    throw error // Rethrow to handle it in the calling context
  }
}