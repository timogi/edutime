import type { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from '@/utils/supabase/api-auth'

type ResponseData = {
  organizationId?: number
  error?: string
}

const MAX_ORGS_PER_USER = 3

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
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

    if (trimmedName.length < 2) {
      return res.status(400).json({ error: 'Organization name is too short' })
    }
    if (trimmedName.length > 120) {
      return res.status(400).json({ error: 'Organization name is too long' })
    }
    if (normalizedSeats < 3 || normalizedSeats > 100) {
      return res.status(400).json({ error: 'Organization seats must be between 3 and 100' })
    }

    const { data, error: rpcError } = await auth.supabase.rpc('api_create_organization_with_admin', {
      p_name: trimmedName,
      p_seats: normalizedSeats,
      p_max_organizations_per_user: MAX_ORGS_PER_USER,
    })

    const organizationId = Number.isInteger(Number(data)) ? Number(data) : null

    if (rpcError || !organizationId || organizationId <= 0) {
      const message = rpcError?.message || 'Could not create organization'
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

      return res.status(500).json({ error: message })
    }

    return res.status(200).json({ organizationId })
  } catch (error) {
    console.error('Unexpected error creating organization:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
