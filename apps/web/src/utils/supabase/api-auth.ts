import type { NextApiRequest } from 'next'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { Database } from '@edutime/shared'

/**
 * Gets an authenticated Supabase client and user from a Next.js API request.
 *
 * Checks for authentication in this order:
 * 1. Authorization header (Bearer token) - used when client has session in localStorage
 * 2. Cookies - used when session is synced to cookies via middleware
 *
 * This handles the case where the client-side Supabase stores sessions in localStorage
 * but API routes need to verify the user server-side.
 */
export async function getAuthenticatedUser(
  req: NextApiRequest,
): Promise<{ user: User; supabase: SupabaseClient } | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // 1. Try Authorization header first
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    })

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (!error && user) {
      return { user, supabase }
    }
  }

  // 2. Fall back to cookies
  const cookiesMap = new Map<string, string>()

  if (req.cookies) {
    Object.entries(req.cookies).forEach(([name, value]) => {
      if (value) {
        cookiesMap.set(name, value)
      }
    })
  }

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

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookies
      },
      setAll() {
        // Not needed for reading authentication
      },
    },
  })

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (!error && user) {
    return { user, supabase }
  }

  return null
}
