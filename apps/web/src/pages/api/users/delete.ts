import type { NextApiRequest, NextApiResponse } from 'next'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

type ResponseData = {
  message?: string
  error?: string
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
    const { user_id } = req.body || {}
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
