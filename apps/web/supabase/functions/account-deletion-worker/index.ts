import { createClient } from 'npm:@supabase/supabase-js@2'

function env(name: string): string {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

type QueueRow = {
  id: number
  user_id: string | null
  email: string | null
}

async function processOne(
  admin: ReturnType<typeof createClient>,
  row: QueueRow,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const userId = row.user_id
  if (!userId) {
    await admin.from('account_deletion').update({ processed_at: new Date().toISOString() }).eq('id', row.id)
    return { ok: true }
  }

  const { data: userData, error: userError } = await admin.auth.admin.getUserById(userId)
  if (userError || !userData?.user) {
    console.error('account-deletion-worker: getUserById failed', userId, userError)
    await admin
      .from('account_deletion')
      .update({
        processed_at: new Date().toISOString(),
        processing_error: userError?.message || 'user_not_found',
      })
      .eq('id', row.id)
    return { ok: true }
  }

  const userEmail = userData.user.email
  if (userEmail) {
    const normalizedEmail = userEmail.toLowerCase()
    const { error: membershipUpdateError } = await admin
      .from('organization_members')
      .update({ status: 'invited' })
      .ilike('user_email', normalizedEmail)
      .eq('status', 'active')

    if (membershipUpdateError) {
      console.error('account-deletion-worker: membership update failed', membershipUpdateError)
    }
  }

  const { error: entitlementsError } = await admin.schema('license').from('entitlements').delete().eq('user_id', userId)

  if (entitlementsError) {
    console.error('account-deletion-worker: entitlements delete failed', entitlementsError)
    await admin
      .from('account_deletion')
      .update({ processing_error: entitlementsError.message || 'entitlements_delete_failed' })
      .eq('id', row.id)
    return { ok: false, error: entitlementsError.message || 'entitlements_delete_failed' }
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(userId)
  if (deleteError) {
    console.error('account-deletion-worker: deleteUser failed', deleteError)
    await admin
      .from('account_deletion')
      .update({ processing_error: deleteError.message || 'delete_user_failed' })
      .eq('id', row.id)
    return { ok: false, error: deleteError.message || 'delete_user_failed' }
  }

  await admin.from('account_deletion').update({ processed_at: new Date().toISOString() }).eq('id', row.id)
  return { ok: true }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const requiredJobSecret = Deno.env.get('ACCOUNT_DELETION_JOB_SECRET')
  if (requiredJobSecret) {
    const incomingSecret = req.headers.get('x-job-secret')
    if (incomingSecret !== requiredJobSecret) {
      return new Response('Unauthorized', { status: 401 })
    }
  }

  try {
    const supabaseUrl = env('SUPABASE_URL')
    const serviceRoleKey = env('SUPABASE_SERVICE_ROLE_KEY')

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: rows, error: fetchError } = await admin
      .from('account_deletion')
      .select('id, user_id, email')
      .is('processed_at', null)
      .order('created_at', { ascending: true })
      .limit(25)

    if (fetchError) {
      throw new Error(`Failed to load account_deletion queue: ${fetchError.message}`)
    }

    const results: Array<{ id: number; ok: boolean; error?: string }> = []
    for (const row of rows || []) {
      const r = await processOne(admin, row as QueueRow)
      results.push({ id: row.id, ok: r.ok, error: r.ok ? undefined : r.error })
    }

    return new Response(JSON.stringify({ ok: true, processed: results.length, results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown account deletion worker error'
    console.error('account-deletion-worker failed:', message)
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
