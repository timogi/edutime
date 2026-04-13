import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

/**
 * Accept an organization seat invite using the authenticated Supabase session
 * (`public.api_accept_org_member_invite` → billing, provisions entitlement).
 */
export async function acceptOrgMemberInviteViaSupabase(
  supabase: SupabaseClient<Database>,
  organizationId: number,
): Promise<{ entitlementId?: string }> {
  const { data, error } = await supabase.rpc('api_accept_org_member_invite', {
    p_organization_id: organizationId,
  })

  if (error) {
    throw new Error(error.message || 'Failed to accept organization invite')
  }

  return { entitlementId: data != null ? String(data) : undefined }
}

/**
 * Reject an organization invite (`public.api_reject_org_member_invite`),
 * with the same membership fallback as the web billing API route.
 */
export async function rejectOrgMemberInviteViaSupabase(
  supabase: SupabaseClient<Database>,
  organizationId: number,
): Promise<void> {
  const { error } = await supabase.rpc('api_reject_org_member_invite', {
    p_organization_id: organizationId,
  })

  if (error?.message === 'No pending invite found for this organization') {
    const { error: fbErr } = await supabase.rpc('api_reject_org_invite_membership_fallback', {
      p_organization_id: organizationId,
    })
    if (fbErr) {
      if (fbErr.message?.includes('No pending invite')) {
        throw new Error('No pending invite found for this organization')
      }
      throw new Error(fbErr.message || 'Failed to reject invite')
    }
    return
  }

  if (error) {
    throw new Error(error.message || 'Failed to reject organization invite')
  }
}
