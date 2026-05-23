import type { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from '@/utils/supabase/api-auth'
import {
  type CheckoutConfirmationClaim,
  sendPurchaseConfirmationEmailForReference,
} from '@/utils/email/licensePurchaseConfirmationEmail'

type ResponseData = {
  sent?: boolean
  reason?: string
  error?: string
}

function asClaim(raw: unknown): CheckoutConfirmationClaim | null {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return null
  return raw as CheckoutConfirmationClaim
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    console.warn('Purchase confirmation email skipped: RESEND_API_KEY or RESEND_FROM_EMAIL missing')
    return res.status(200).json({ sent: false, reason: 'email_not_configured' })
  }

  try {
    const auth = await getAuthenticatedUser(req)
    if (!auth) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const referenceId =
      typeof req.body?.ref === 'string'
        ? req.body.ref
        : typeof req.query.ref === 'string'
          ? req.query.ref
          : null

    if (!referenceId) {
      return res.status(400).json({ error: 'Missing checkout reference' })
    }

    const { data: claimRaw, error: claimError } = await auth.supabase.rpc(
      'api_claim_checkout_purchase_confirmation_email',
      { p_reference_id: referenceId },
    )

    if (claimError) {
      console.error('Failed to claim purchase confirmation email:', claimError)
      return res.status(500).json({ error: 'Could not process confirmation email' })
    }

    const claim = asClaim(claimRaw)
    if (!claim?.claimed) {
      return res.status(200).json({ sent: false, reason: claim?.reason || 'not_claimed' })
    }

    const sent = await sendPurchaseConfirmationEmailForReference(referenceId, claim)
    return res.status(200).json({ sent, reason: sent ? undefined : 'send_failed' })
  } catch (error) {
    console.error('Purchase confirmation email failed:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
