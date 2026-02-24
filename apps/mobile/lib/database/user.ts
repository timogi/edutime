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

    // Password is correct, now safely delete the user using the main client
    const { error: deleteError } = await supabase.from('account_deletion').insert({
      user_id,
      email,
    })

    if (deleteError) {
      console.error('Delete error', deleteError)
      throw new Error('Account may already be scheduled for deletion.')
    }

    // Only sign out after successful deletion
    await supabase.auth.signOut();

    return { message: 'Account deleted successfully' }
  } catch (error) {
    console.error('Error in deleteAccount', error)
    throw error // Rethrow to handle it in the calling context
  }
}