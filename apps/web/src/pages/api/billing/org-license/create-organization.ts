import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { getAuthenticatedUser } from '@/utils/supabase/api-auth'

type ResponseData = {
  organizationId?: number
  error?: string
}

function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return null
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
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
    // Require explicit bearer auth for this state-changing endpoint
    // to reduce CSRF risk from cookie-only authenticated requests.
    if (!req.headers.authorization?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const auth = await getAuthenticatedUser(req)
    if (!auth) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { name, seats } = req.body as { name?: string; seats?: number }
    const trimmedName = (name || '').trim()
    const requestedSeats = Number(seats)
    const normalizedSeats = Number.isInteger(requestedSeats) ? requestedSeats : 3
    const MAX_ORGS_PER_USER = 3

    if (trimmedName.length < 2) {
      return res.status(400).json({ error: 'Organization name is too short' })
    }
    if (trimmedName.length > 120) {
      return res.status(400).json({ error: 'Organization name is too long' })
    }
    if (normalizedSeats < 3 || normalizedSeats > 100) {
      return res.status(400).json({ error: 'Organization seats must be between 3 and 100' })
    }

    const admin = createAdminClient()
    if (!admin) {
      return res.status(500).json({ error: 'Missing server billing configuration' })
    }

    const createWithFallback = async (): Promise<number | null> => {
      // Fallback for environments where the RPC migration is not yet applied.
      // Keeps the endpoint functional during rollout, while RPC remains the preferred path.
      const { count: existingCount, error: countError } = await admin
        .from('organization_administrators')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', auth.user.id)

      if (countError) {
        console.error('Failed to check organization count:', countError)
        throw new Error('Could not validate organization creation limit')
      }

      if ((existingCount || 0) >= MAX_ORGS_PER_USER) {
        const limitError = new Error(`Organization creation limit reached (${MAX_ORGS_PER_USER} max)`)
        ;(limitError as Error & { statusCode?: number }).statusCode = 429
        throw limitError
      }

      const { data: orgRow, error: orgError } = await admin
        .from('organizations')
        .insert({
          name: trimmedName,
          seats: normalizedSeats,
          is_active: true,
        })
        .select('id')
        .single()

      if (orgError || !orgRow?.id) {
        console.error('Fallback organization insert failed:', orgError)
        throw new Error('Could not create organization')
      }

      const { error: adminMapError } = await admin.from('organization_administrators').insert({
        organization_id: orgRow.id,
        user_id: auth.user.id,
      })

      if (adminMapError) {
        console.error('Fallback admin assignment failed:', adminMapError)
        // Best-effort cleanup to avoid orphan org rows.
        await admin.from('organizations').delete().eq('id', orgRow.id)
        throw new Error('Could not assign organization admin')
      }

      return orgRow.id
    }

    const { data, error: rpcError } = await admin.rpc('create_organization_with_admin', {
      p_actor_user_id: auth.user.id,
      p_name: trimmedName,
      p_seats: normalizedSeats,
      p_max_organizations_per_user: MAX_ORGS_PER_USER,
    })

    let organizationId: number | null = Number.isInteger(Number(data)) ? Number(data) : null

    if (rpcError || !organizationId) {
      const message = rpcError.message || 'Could not create organization'
      console.error('Failed to create organization via rpc:', rpcError)

      if (message.toLowerCase().includes('limit reached')) {
        return res.status(429).json({
          error: `Organization creation limit reached (${MAX_ORGS_PER_USER} max)`,
        })
      }

      if (
        message.toLowerCase().includes('too short') ||
        message.toLowerCase().includes('too long') ||
        message.toLowerCase().includes('between 3 and 100')
      ) {
        return res.status(400).json({ error: message })
      }

      const rpcMissing =
        message.toLowerCase().includes('create_organization_with_admin') ||
        message.toLowerCase().includes('schema cache')

      if (rpcMissing) {
        try {
          organizationId = await createWithFallback()
        } catch (fallbackError) {
          const fallbackMessage =
            fallbackError instanceof Error ? fallbackError.message : 'Could not create organization'
          const fallbackStatus =
            fallbackError instanceof Error &&
            'statusCode' in fallbackError &&
            typeof (fallbackError as Error & { statusCode?: number }).statusCode === 'number'
              ? (fallbackError as Error & { statusCode?: number }).statusCode
              : 500

          return res.status(fallbackStatus || 500).json({ error: fallbackMessage })
        }
      } else {
        return res.status(500).json({ error: message })
      }
    }

    if (!organizationId || !Number.isInteger(organizationId) || organizationId <= 0) {
      return res.status(500).json({ error: 'Could not create organization' })
    }

    return res.status(200).json({ organizationId })
  } catch (error) {
    console.error('Unexpected error creating organization:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
