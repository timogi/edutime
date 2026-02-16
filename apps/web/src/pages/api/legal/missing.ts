import type { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from '@/utils/supabase/api-auth'

type MissingDocument = {
  document_code: string
  document_version_id: number
  title: string
  version_label: string
  can_accept: boolean
}

type ResponseData = {
  missing?: MissingDocument[]
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

    const { context, organizationId } = req.body

    if (!context || !['app', 'checkout_individual', 'checkout_org'].includes(context)) {
      return res.status(400).json({ error: 'Invalid context' })
    }

    if (context === 'checkout_org' && !organizationId) {
      return res.status(400).json({ error: 'organizationId required for checkout_org context' })
    }

    const { data, error } = await supabase.rpc('legal_missing_documents', {
      p_context: context,
      p_organization_id: organizationId || undefined,
    })

    if (error) {
      console.error('Error calling legal_missing_documents:', error)
      return res.status(500).json({ error: 'Failed to fetch missing documents' })
    }

    // Map RPC response field "code" to "document_code" for the frontend
    const missing: MissingDocument[] = (data || []).map((row: any) => ({
      document_code: row.code,
      document_version_id: row.document_version_id,
      title: row.title,
      version_label: row.version_label,
      can_accept: row.can_accept,
    }))

    return res.status(200).json({ missing })
  } catch (error) {
    console.error('Error in legal/missing:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
