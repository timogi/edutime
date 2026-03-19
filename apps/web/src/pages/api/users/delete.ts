import type { NextApiRequest, NextApiResponse } from 'next'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { Json } from '@edutime/shared'
import { createPayrexxClientFromEnv } from '@/utils/payments/payrexxClient'

type ResponseData = {
  message?: string
  error?: string
  code?: 'SOLE_ADMIN_BLOCKER' | 'PERSONAL_SUBSCRIPTION_CANCEL_REQUIRED'
  blockers?: Array<{ organizationId: number; organizationName: string }>
}

type JsonObject = Record<string, Json>

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

function extractGatewayId(providerSubscriptionId: string, metadata: Json | null): number | null {
  const parsedProviderId = Number(providerSubscriptionId)
  if (Number.isFinite(parsedProviderId) && parsedProviderId > 0) {
    return parsedProviderId
  }

  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return null
  }

  const metadataObj = metadata as Record<string, unknown>
  const candidates: unknown[] = [
    metadataObj.payrexx_gateway_id,
    metadataObj.gateway_id,
    metadataObj.gatewayId,
    (metadataObj.transaction as Record<string, unknown> | undefined)?.gatewayId,
    ((metadataObj.transaction as Record<string, unknown> | undefined)?.gateway as Record<
      string,
      unknown
    > | null)?.id,
  ]

  for (const candidate of candidates) {
    const parsed = Number(candidate)
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed
    }
  }

  return null
}

function extractSubscriptionId(metadata: Json | null): number | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return null
  }

  const metadataObj = metadata as Record<string, unknown>
  const rootSubscription = metadataObj.subscription as Record<string, unknown> | undefined
  const txSubscription = (metadataObj.transaction as Record<string, unknown> | undefined)?.subscription as
    | Record<string, unknown>
    | undefined

  const candidates: unknown[] = [
    metadataObj.subscription_id,
    metadataObj.subscriptionId,
    rootSubscription?.id,
    txSubscription?.id,
  ]

  for (const candidate of candidates) {
    const parsed = Number(candidate)
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed
    }
  }

  return null
}

/**
 * API Route to delete the authenticated user's account
 *
 * Security:
 * - Only the authenticated user can delete their own account
 * - Supports both Bearer token (for mobile apps) and cookies (for web)
 * - Uses Service Role Key (server-side only) to delete the user
 *
 * Usage:
 * - Web: Uses cookies automatically (POST to /api/users/delete)
 * - Mobile: Send Authorization header with Bearer token
 *   POST /api/users/delete
 *   Headers: { Authorization: "Bearer <access_token>" }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    let authenticatedUserId: string | null = null

    // Check for Bearer token in Authorization header (for mobile apps)
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)

      // Create a Supabase client for token-based auth
      const supabaseClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        },
      )

      const {
        data: { user: tokenUser },
        error: userError,
      } = await supabaseClient.auth.getUser()

      if (userError || !tokenUser) {
        return res.status(401).json({ error: 'Invalid or expired token' })
      }

      authenticatedUserId = tokenUser.id
    } else {
      // Fallback to cookie-based authentication (for web)
      // Parse cookies from request - combine both req.cookies and Cookie header
      const cookiesMap = new Map<string, string>()

      // First, add cookies from req.cookies (parsed by Next.js)
      if (req.cookies) {
        Object.entries(req.cookies).forEach(([name, value]) => {
          if (value) {
            cookiesMap.set(name, value)
          }
        })
      }

      // Also parse Cookie header directly and merge (header takes precedence for duplicates)
      if (req.headers.cookie) {
        req.headers.cookie.split(';').forEach((cookie) => {
          const trimmed = cookie.trim()
          const equalIndex = trimmed.indexOf('=')
          if (equalIndex > 0) {
            const name = trimmed.substring(0, equalIndex).trim()
            const value = trimmed.substring(equalIndex + 1).trim()
            if (name && value) {
              cookiesMap.set(name, value)
            }
          }
        })
      }

      const cookies = Array.from(cookiesMap.entries()).map(([name, value]) => ({
        name,
        value,
      }))

      console.log(
        'Received cookies:',
        cookies.length > 0 ? cookies.map((c) => c.name) : 'No cookies found',
      )
      console.log('Cookie header:', req.headers.cookie || 'No cookie header')
      console.log('req.cookies:', req.cookies ? Object.keys(req.cookies) : 'No req.cookies')

      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookies
            },
            setAll() {
              // Not needed for reading authentication
            },
          },
        },
      )

      const {
        data: { user: cookieUser },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error('Error getting user from cookies:', userError)
        return res.status(401).json({ error: 'Unauthorized' })
      }

      if (!cookieUser) {
        console.error('No user found in cookies')
        return res.status(401).json({ error: 'Unauthorized' })
      }

      authenticatedUserId = cookieUser.id
    }

    if (!authenticatedUserId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Optional: Check if user_id is provided in body and verify it matches
    // This adds an extra layer of security
    const { user_id, checkOnly } = req.body || {}
    if (user_id && user_id !== authenticatedUserId) {
      return res.status(403).json({ error: 'You can only delete your own account' })
    }

    // Use Service Role Key to delete the user directly
    // This key should NEVER be exposed to the client - only used server-side
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not set')
      return res.status(500).json({ error: 'Server configuration error' })
    }

    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
    const billingClient = createBillingClient()
    if (!billingClient) {
      return res.status(500).json({ error: 'Missing billing configuration on server' })
    }

    // Block deletion if user is sole admin of any active organization.
    const { data: adminOrganizations, error: adminOrganizationsError } = await supabaseAdmin
      .from('organization_administrators')
      .select('organization_id, organizations!inner(id, name, is_active)')
      .eq('user_id', authenticatedUserId)
      .eq('organizations.is_active', true)

    if (adminOrganizationsError) {
      console.error('Error loading admin organizations for delete guard:', adminOrganizationsError)
      return res.status(500).json({ error: 'Failed to validate organization admin constraints' })
    }

    const blockers: Array<{ organizationId: number; organizationName: string }> = []
    for (const row of adminOrganizations || []) {
      const organizationId = Number(row.organization_id)
      if (!Number.isInteger(organizationId) || organizationId <= 0) {
        continue
      }

      const { count: adminCount, error: adminCountError } = await supabaseAdmin
        .from('organization_administrators')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organizationId)

      if (adminCountError) {
        console.error('Error counting organization admins for delete guard:', adminCountError)
        return res.status(500).json({ error: 'Failed to validate organization admin constraints' })
      }

      if ((adminCount || 0) <= 1) {
        const orgName =
          row.organizations && typeof row.organizations === 'object' && 'name' in row.organizations
            ? String((row.organizations as { name?: string }).name || `#${organizationId}`)
            : `#${organizationId}`
        blockers.push({
          organizationId,
          organizationName: orgName,
        })
      }
    }

    if (blockers.length > 0) {
      if (checkOnly === true) {
        return res.status(200).json({
          code: 'SOLE_ADMIN_BLOCKER',
          error:
            'Account deletion blocked: you are the only admin in active organizations. Assign another admin or deactivate those organizations first.',
          blockers,
        })
      }
      return res.status(409).json({
        code: 'SOLE_ADMIN_BLOCKER',
        error:
          'Account deletion blocked: you are the only admin in active organizations. Assign another admin or deactivate those organizations first.',
        blockers,
      })
    }

    // Ensure personal auto-renew is disabled before account deletion to avoid future billing.
    const { data: activePersonalSubscription, error: personalSubscriptionError } = await billingClient
      .from('subscriptions')
      .select(
        `
          id,
          provider_subscription_id,
          cancel_at_period_end,
          metadata,
          accounts!inner(user_id, organization_id)
        `,
      )
      .eq('accounts.user_id', authenticatedUserId)
      .is('accounts.organization_id', null)
      .eq('provider', 'payrexx')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (personalSubscriptionError) {
      console.error('Error loading personal subscription for delete guard:', personalSubscriptionError)
      return res.status(500).json({ error: 'Failed to validate personal subscription status' })
    }

    if (activePersonalSubscription && !activePersonalSubscription.cancel_at_period_end) {
      if (checkOnly === true) {
        return res.status(200).json({
          code: 'PERSONAL_SUBSCRIPTION_CANCEL_REQUIRED',
          error:
            'Your personal subscription will be canceled automatically if you continue with account deletion.',
        })
      }
      let gatewayId = extractGatewayId(
        String(activePersonalSubscription.provider_subscription_id || ''),
        activePersonalSubscription.metadata,
      )

      if (!gatewayId) {
        const { data: sessionRow, error: checkoutSessionError } = await billingClient
          .from('checkout_sessions')
          .select('payrexx_gateway_id')
          .eq('subscription_id', activePersonalSubscription.id)
          .not('payrexx_gateway_id', 'is', null)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (checkoutSessionError) {
          console.error('Failed to resolve Payrexx gateway id for deletion cancellation:', checkoutSessionError)
          return res.status(409).json({
            code: 'PERSONAL_SUBSCRIPTION_CANCEL_REQUIRED',
            error:
              'Your personal subscription must be canceled before deletion, but no Payrexx gateway could be resolved. Please cancel it from license management first.',
          })
        }
        gatewayId = sessionRow?.payrexx_gateway_id ?? null
      }

      if (!gatewayId) {
        return res.status(409).json({
          code: 'PERSONAL_SUBSCRIPTION_CANCEL_REQUIRED',
          error:
            'Your personal subscription must be canceled before deletion. Please cancel it from license management first.',
        })
      }

      const payrexxClient = createPayrexxClientFromEnv()
      if (!payrexxClient) {
        return res.status(409).json({
          code: 'PERSONAL_SUBSCRIPTION_CANCEL_REQUIRED',
          error:
            'Your personal subscription must be canceled before deletion. Please cancel it from license management first.',
        })
      }

      const subscriptionId = extractSubscriptionId(activePersonalSubscription.metadata)
      try {
        if (subscriptionId) {
          await payrexxClient.cancelSubscription(subscriptionId)
        } else {
          await payrexxClient.deleteGateway(gatewayId)
        }
      } catch (payrexxError) {
        console.error('Failed to cancel personal Payrexx subscription during account deletion:', payrexxError)
        return res.status(409).json({
          code: 'PERSONAL_SUBSCRIPTION_CANCEL_REQUIRED',
          error:
            'Your personal subscription must be canceled before deletion. Please cancel it from license management first.',
        })
      }

      const canceledAt = new Date().toISOString()
      const previousMetadata =
        activePersonalSubscription.metadata &&
        typeof activePersonalSubscription.metadata === 'object' &&
        !Array.isArray(activePersonalSubscription.metadata)
          ? (activePersonalSubscription.metadata as JsonObject)
          : {}

      const { error: persistCancelError } = await billingClient
        .from('subscriptions')
        .update({
          cancel_at_period_end: true,
          canceled_at: canceledAt,
          metadata: {
            ...previousMetadata,
            canceled_at_period_end_at: canceledAt,
            canceled_via: 'account_deletion',
            cancellation_gateway_id: gatewayId,
            cancellation_subscription_id: subscriptionId,
          },
        })
        .eq('id', activePersonalSubscription.id)

      if (persistCancelError) {
        console.error('Failed to persist personal cancellation during account deletion:', persistCancelError)
        return res.status(409).json({
          code: 'PERSONAL_SUBSCRIPTION_CANCEL_REQUIRED',
          error:
            'Your personal subscription must be canceled before deletion. Please cancel it from license management first.',
        })
      }
    }

    // Get user email before deletion
    const { data: userData, error: userError } =
      await supabaseAdmin.auth.admin.getUserById(authenticatedUserId)

    if (userError) {
      console.error('Error getting user:', userError)
      return res.status(500).json({ error: 'Failed to get user information' })
    }

    const userEmail = userData?.user?.email

    // If user has an email, reset all active memberships to 'invited' status
    if (userEmail) {
      const normalizedEmail = userEmail.toLowerCase()

      // Find all active memberships for this user
      const { data: activeMemberships, error: membershipsError } = await supabaseAdmin
        .from('organization_members')
        .select('organization_id')
        .ilike('user_email', normalizedEmail)
        .eq('status', 'active')

      if (membershipsError) {
        console.error('Error fetching memberships:', membershipsError)
        // Continue with deletion even if we can't update memberships
      } else if (activeMemberships && activeMemberships.length > 0) {
        // Update all active memberships to 'invited' status
        const { error: updateError } = await supabaseAdmin
          .from('organization_members')
          .update({ status: 'invited' })
          .ilike('user_email', normalizedEmail)
          .eq('status', 'active')

        if (updateError) {
          console.error('Error updating memberships:', updateError)
          // Continue with deletion even if we can't update memberships
        }
      }
    }

    // Delete entitlements before user deletion (FK constraint on user_id)
    const { error: entitlementsError } = await supabaseAdmin
      .schema('license')
      .from('entitlements')
      .delete()
      .eq('user_id', authenticatedUserId)

    if (entitlementsError) {
      console.error('Error deleting entitlements:', entitlementsError)
      return res.status(500).json({ error: 'Failed to delete entitlements' })
    }

    // TODO: Clean up billing data (accounts, subscriptions, invoices) before deletion

    // Delete the user using admin API
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(authenticatedUserId)

    if (deleteError) {
      console.error('Error deleting user:', deleteError)
      return res.status(500).json({ error: 'Failed to delete account' })
    }

    return res.status(200).json({ message: 'Account deleted successfully' })
  } catch (error) {
    console.error('Error in delete account API:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
