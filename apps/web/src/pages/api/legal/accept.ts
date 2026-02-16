import type { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from '@/utils/supabase/api-auth'

type ResponseData = {
  ok?: boolean
  error?: string
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

    const { supabase } = auth

    const { documentCode, organizationId, source } = req.body

    if (!documentCode) {
      return res.status(400).json({ error: 'documentCode is required' })
    }

    // Use the RPC function which handles permissions and insertion
    const { error } = await supabase.rpc('legal_accept_document', {
      p_code: documentCode,
      p_organization_id: organizationId || undefined,
      p_source: source || 'checkout',
    })

    if (error) {
      console.error('Error calling legal_accept_document:', error)
      return res.status(500).json({ error: 'Failed to record acceptance' })
    }

    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('Error in legal/accept:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
