import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { paymentProvider } from '@/utils/payments'
import { calculateCheckoutAmount } from '@/utils/payments/pricing'
import { getAuthenticatedUser } from '@/utils/supabase/api-auth'

type ResponseData = {
  checkoutUrl?: string
  sessionId?: string
  error?: string
}

/**
 * Create a billing schema client using service role for server-side writes.
 * Uses billing schema to access checkout_sessions table.
 */
function createBillingClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return null
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    db: { schema: 'billing' },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const auth = await getAuthenticatedUser(req)

    if (!auth) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { user, supabase } = auth

    const { plan, qty, organizationId } = req.body

    if (!plan || (plan !== 'annual' && plan !== 'org')) {
      return res.status(400).json({ error: 'Invalid plan. Must be "annual" or "org"' })
    }

    if (plan === 'org' && (!qty || qty < 3)) {
      return res.status(400).json({ error: 'Invalid quantity. Must be at least 3 for org plan' })
    }

    if (plan === 'org' && !organizationId) {
      return res.status(400).json({ error: 'Organization ID is required for org plan' })
    }

    // Fetch user profile data for Payrexx fields
    const { data: userData } = await supabase
      .from('users')
      .select('first_name, last_name, language')
      .eq('user_id', user.id)
      .single()

    const quantity = plan === 'org' ? qty : 1
    const language =
      userData?.language || req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'de'

    // Create the Payrexx Gateway (or mock checkout)
    const result = await paymentProvider.createCheckoutSession({
      plan,
      qty: plan === 'org' ? qty : undefined,
      userId: user.id,
      organizationId: plan === 'org' ? organizationId : undefined,
      userEmail: user.email,
      firstName: userData?.first_name || undefined,
      lastName: userData?.last_name || undefined,
      language,
    })

    // Store checkout session in billing.checkout_sessions for webhook reconciliation
    const billingClient = createBillingClient()
    if (billingClient) {
      const { amountCents } = calculateCheckoutAmount(plan, quantity)

      const { error: insertError } = await billingClient.from('checkout_sessions').insert({
        user_id: user.id,
        organization_id: plan === 'org' ? organizationId : null,
        plan,
        quantity,
        amount_cents: amountCents,
        currency: 'CHF',
        status: 'pending',
        reference_id: result.sessionId,
        payrexx_gateway_id: result.gatewayId || null,
        payrexx_gateway_link: result.checkoutUrl,
        expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2h
      })

      if (insertError) {
        console.error('Failed to store checkout session:', insertError)
        // Non-blocking: still return the checkout URL even if DB write fails
      }
    }

    return res.status(200).json({
      checkoutUrl: result.checkoutUrl,
      sessionId: result.sessionId,
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
