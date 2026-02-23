import type { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from '@/utils/supabase/api-auth'
import { getMissingUserDocuments, type LegalContext } from '@edutime/shared'

type DocumentStatus = {
  document_code: string
  document_version_id: number
  title: string
  version_label: string
  scope: string
  can_accept: boolean
}

type ResponseData = {
  documents?: DocumentStatus[]
  error?: string
}

const VALID_CONTEXTS: LegalContext[] = ['app', 'checkout_individual']

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
    const { context } = req.body

    if (!context || !VALID_CONTEXTS.includes(context)) {
      return res.status(400).json({ error: 'Invalid context' })
    }

    const docs = await getMissingUserDocuments(supabase, context)

    const documents: DocumentStatus[] = docs.map((doc) => ({
      document_code: doc.code,
      document_version_id: doc.document_version_id,
      title: doc.title,
      version_label: doc.version_label,
      scope: doc.scope,
      can_accept: doc.can_accept,
    }))

    return res.status(200).json({ documents })
  } catch (error) {
    console.error('Error in legal/status:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
