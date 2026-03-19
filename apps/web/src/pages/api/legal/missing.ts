import type { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from '@/utils/supabase/api-auth'
import { getMissingDocuments, type LegalContext } from '@edutime/shared'

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

const VALID_CONTEXTS_WITH_ORG: LegalContext[] = ['app', 'checkout_individual', 'checkout_org']

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

    if (!context || !VALID_CONTEXTS_WITH_ORG.includes(context)) {
      return res.status(400).json({ error: 'Invalid context' })
    }

    const organizationId =
      typeof req.body?.organizationId === 'number'
        ? req.body.organizationId
        : Number.isInteger(Number(req.body?.organizationId))
          ? Number(req.body.organizationId)
          : undefined

    const docs = await getMissingDocuments(supabase, context, {
      organizationId: context === 'checkout_org' ? organizationId : undefined,
    })

    const missing: MissingDocument[] = docs.map((doc) => ({
      document_code: doc.code,
      document_version_id: doc.document_version_id,
      title: doc.title,
      version_label: doc.version_label,
      can_accept: doc.can_accept,
    }))

    return res.status(200).json({ missing })
  } catch (error) {
    console.error('Error in legal/missing:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
