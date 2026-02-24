import type { NextApiRequest, NextApiResponse } from 'next'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

type ResponseData = {
  entitlement?: {
    user_id: string
    organization_id: string | null
    kind: string
    source: string
    status: string
    valid_from: string
    valid_until: string | null
  }
  message?: string
  error?: string
}

/**
 * API Route to start a demo trial for the authenticated user
 *
 * Security:
 * - Only the authenticated user can start their own demo
 * - Supports both Bearer token (for mobile apps) and cookies (for web)
 * - Uses the secure Supabase function license.start_demo() which:
 *   - Prevents starting a demo if user already has an active non-trial entitlement
 *   - Prevents duplicate active trials (enforced by unique index)
 *   - Returns existing trial if one is already active
 *
 * Usage:
 * - Web: Uses cookies automatically (POST to /api/users/start-demo)
 * - Mobile: Send Authorization header with Bearer token
 *   POST /api/users/start-demo
 *   Headers: { Authorization: "Bearer <access_token>" }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    let authenticatedUserId: string | null = null
    let supabase: ReturnType<typeof createServerClient> | ReturnType<typeof createClient>

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
      supabase = supabaseClient
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

      supabase = createServerClient(
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
      return res.status(403).json({ error: 'You can only start a demo for your own account' })
    }

    // Call the secure Supabase function to start the demo.
    // The function resolves the user via auth.uid() and enforces business rules in SQL.
    console.log('Calling start_demo function for user:', authenticatedUserId)

    // Function lives in license schema and takes no arguments.
    const { data: entitlement, error: functionError } = await supabase
      .schema('license')
      .rpc('start_demo')

    if (entitlement) {
      console.log('Demo started successfully, entitlement:', entitlement)
    }

    if (functionError) {
      console.error('Error calling start_demo function:', functionError)
      console.error('Function error details:', JSON.stringify(functionError, null, 2))
      // Return more specific error message
      const errorMessage = functionError.message || 'Failed to start demo'
      return res.status(500).json({ error: errorMessage })
    }

    if (!entitlement) {
      console.error('No entitlement returned from function')
      return res.status(500).json({ error: 'No entitlement returned from function' })
    }

    return res.status(200).json({
      entitlement: entitlement as ResponseData['entitlement'],
      message: 'Demo started successfully',
    })
  } catch (error) {
    console.error('Error in start demo API:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
