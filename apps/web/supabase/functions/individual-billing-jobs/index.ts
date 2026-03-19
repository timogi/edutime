import { createClient } from 'npm:@supabase/supabase-js@2'

function env(name: string): string {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const requiredJobSecret = Deno.env.get('INDIVIDUAL_BILLING_JOB_SECRET')
  if (requiredJobSecret) {
    const incomingSecret = req.headers.get('x-job-secret')
    if (incomingSecret !== requiredJobSecret) {
      return new Response('Unauthorized', { status: 401 })
    }
  }

  try {
    const supabaseUrl = env('SUPABASE_URL')
    const serviceRoleKey = env('SUPABASE_SERVICE_ROLE_KEY')
    const nowIso = new Date().toISOString()

    const billing = createClient(supabaseUrl, serviceRoleKey, {
      db: { schema: 'billing' },
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: lifecycleSummary, error: lifecycleError } = await billing.rpc(
      'run_individual_lifecycle_sweep',
      { p_reference_time: nowIso },
    )

    if (lifecycleError) {
      throw new Error(`run_individual_lifecycle_sweep failed: ${lifecycleError.message}`)
    }

    return new Response(JSON.stringify({ ok: true, lifecycleSummary }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown individual billing job error'
    console.error('individual-billing-jobs failed:', message)
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
