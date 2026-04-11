import type { NextApiRequest, NextApiResponse } from 'next'
import { Json } from '@edutime/shared'
import { createPayrexxClientFromEnv } from '@/utils/payments/payrexxClient'
import { getAuthenticatedUser } from '@/utils/supabase/api-auth'

type ResponseData = {
  message?: string
  error?: string
  code?:
    | 'SOLE_ADMIN_BLOCKER'
    | 'PERSONAL_SUBSCRIPTION_CANCEL_REQUIRED'
    | 'ACCOUNT_DELETION_QUEUED'
  blockers?: Array<{ organizationId: number; organizationName: string }>
}

type JsonObject = Record<string, Json>

function asRecord(v: unknown): Record<string, unknown> | null {
  if (v != null && typeof v === 'object' && !Array.isArray(v)) {
    return v as Record<string, unknown>
  }
  return null
}

function extractGatewayId(providerSubscriptionId: string, metadata: Json | null): number | null {
  const parsedProviderId = Number(providerSubscriptionId)
  if (Number.isFinite(parsedProviderId) && parsedProviderId > 0) {
    return parsedProviderId
  }

  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return null
  }

  const metadataObj = metadata as Record<string, unknown>
  const candidates: unknown[] = [
    metadataObj.payrexx_gateway_id,
    metadataObj.gateway_id,
    metadataObj.gatewayId,
    (metadataObj.transaction as Record<string, unknown> | undefined)?.gatewayId,
    ((metadataObj.transaction as Record<string, unknown> | undefined)?.gateway as Record<
      string,
      unknown
    > | null)?.id,
  ]

  for (const candidate of candidates) {
    const parsed = Number(candidate)
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed
    }
  }

  return null
}

function extractSubscriptionId(metadata: Json | null): number | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return null
  }

  const metadataObj = metadata as Record<string, unknown>
  const rootSubscription = metadataObj.subscription as Record<string, unknown> | undefined
  const txSubscription = (metadataObj.transaction as Record<string, unknown> | undefined)?.subscription as
    | Record<string, unknown>
    | undefined

  const candidates: unknown[] = [
    metadataObj.subscription_id,
    metadataObj.subscriptionId,
    rootSubscription?.id,
    txSubscription?.id,
  ]

  for (const candidate of candidates) {
    const parsed = Number(candidate)
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed
    }
  }

  return null
}

function mapValidationToResponse(val: Record<string, unknown>, _checkOnly: boolean): ResponseData {
  void _checkOnly
  const ok = val.ok === true
  if (ok) {
    return { message: _checkOnly ? undefined : 'ok' }
  }

  const code = val.code === 'SOLE_ADMIN_BLOCKER' ? 'SOLE_ADMIN_BLOCKER' : val.code === 'PERSONAL_SUBSCRIPTION_CANCEL_REQUIRED' ? 'PERSONAL_SUBSCRIPTION_CANCEL_REQUIRED' : undefined

  const blockersRaw = val.blockers
  const blockers: Array<{ organizationId: number; organizationName: string }> = []
  if (Array.isArray(blockersRaw)) {
    for (const b of blockersRaw) {
      const row = asRecord(b) || {}
      blockers.push({
        organizationId: Number(row.organizationId ?? row.organization_id ?? 0),
        organizationName: String(row.organizationName ?? row.organization_name ?? ''),
      })
    }
  }

  if (code === 'SOLE_ADMIN_BLOCKER') {
    return {
      code: 'SOLE_ADMIN_BLOCKER',
      error:
        'Account deletion blocked: you are the only admin in active organizations. Assign another admin or deactivate those organizations first.',
      blockers,
    }
  }

  if (code === 'PERSONAL_SUBSCRIPTION_CANCEL_REQUIRED') {
    return {
      code: 'PERSONAL_SUBSCRIPTION_CANCEL_REQUIRED',
      error:
        'Your personal subscription will be canceled automatically if you continue with account deletion.',
    }
  }

  return { error: 'Account deletion validation failed' }
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

    const authenticatedUserId = auth.user.id
    const { user_id, checkOnly } = req.body || {}
    if (user_id && user_id !== authenticatedUserId) {
      return res.status(403).json({ error: 'You can only delete your own account' })
    }

    const { supabase } = auth

    const { data: valRaw, error: valError } = await supabase.rpc('account_deletion_validate')
    if (valError) {
      console.error('account_deletion_validate failed:', valError)
      return res.status(500).json({ error: 'Failed to validate account deletion' })
    }

    const val = asRecord(valRaw as Json) || {}

    if (checkOnly === true) {
      const body = mapValidationToResponse(val, true)
      if (val.ok === true) {
        return res.status(200).json(body)
      }
      if (val.code === 'SOLE_ADMIN_BLOCKER') {
        return res.status(200).json(body)
      }
      if (val.code === 'PERSONAL_SUBSCRIPTION_CANCEL_REQUIRED') {
        return res.status(200).json(body)
      }
      return res.status(400).json(body)
    }

    if (val.ok !== true) {
      const body = mapValidationToResponse(val, false)
      if (val.code === 'SOLE_ADMIN_BLOCKER') {
        return res.status(409).json(body)
      }
      if (val.code === 'PERSONAL_SUBSCRIPTION_CANCEL_REQUIRED') {
        // Attempt Payrexx cancel + persist, then re-validate
        const { data: summaryRaw } = await supabase.rpc('api_get_personal_subscription_summary')
        const summary = asRecord(summaryRaw as Json)
        const sub = summary ? asRecord(summary.subscription) : null

        if (sub && String(sub.status || '') === 'active' && sub.cancel_at_period_end !== true) {
          const metadata = (sub.metadata ?? null) as Json | null
          const providerSubId = sub.provider_subscription_id == null ? '' : String(sub.provider_subscription_id)
          let gatewayId = extractGatewayId(providerSubId, metadata)
          if (!gatewayId && sub.resolved_checkout_payrexx_gateway_id != null) {
            const g = Number(sub.resolved_checkout_payrexx_gateway_id)
            if (Number.isFinite(g) && g > 0) gatewayId = g
          }

          if (!gatewayId) {
            return res.status(409).json({
              code: 'PERSONAL_SUBSCRIPTION_CANCEL_REQUIRED',
              error:
                'Your personal subscription must be canceled before deletion, but no Payrexx gateway could be resolved. Please cancel it from license management first.',
            })
          }

          const payrexxClient = createPayrexxClientFromEnv()
          if (!payrexxClient) {
            return res.status(409).json({
              code: 'PERSONAL_SUBSCRIPTION_CANCEL_REQUIRED',
              error:
                'Your personal subscription must be canceled before deletion. Please cancel it from license management first.',
            })
          }

          const subscriptionId = extractSubscriptionId(metadata)
          try {
            if (subscriptionId) {
              await payrexxClient.cancelSubscription(subscriptionId)
            } else {
              await payrexxClient.deleteGateway(gatewayId)
            }
          } catch (payrexxError) {
            console.error('Failed to cancel personal Payrexx subscription during account deletion:', payrexxError)
            return res.status(409).json({
              code: 'PERSONAL_SUBSCRIPTION_CANCEL_REQUIRED',
              error:
                'Your personal subscription must be canceled before deletion. Please cancel it from license management first.',
            })
          }

          const canceledAt = new Date().toISOString()
          const previousMetadata =
            metadata && typeof metadata === 'object' && !Array.isArray(metadata) ? (metadata as JsonObject) : {}

          const { error: persistErr } = await supabase.rpc('api_mark_personal_subscription_cancel_pending', {
            p_canceled_at: canceledAt,
            p_metadata_merge: {
              ...previousMetadata,
              canceled_at_period_end_at: canceledAt,
              canceled_via: 'account_deletion',
              cancellation_gateway_id: gatewayId,
              cancellation_subscription_id: subscriptionId,
            } as unknown as Json,
          })

          if (persistErr) {
            console.error('Failed to persist personal cancellation during account deletion:', persistErr)
            return res.status(409).json({
              code: 'PERSONAL_SUBSCRIPTION_CANCEL_REQUIRED',
              error:
                'Your personal subscription must be canceled before deletion. Please cancel it from license management first.',
            })
          }
        }

        const { data: val2Raw } = await supabase.rpc('account_deletion_validate')
        const val2 = asRecord(val2Raw as Json) || {}
        if (val2.ok !== true) {
          const body2 = mapValidationToResponse(val2, false)
          if (val2.code === 'PERSONAL_SUBSCRIPTION_CANCEL_REQUIRED') {
            return res.status(409).json(body2)
          }
          return res.status(409).json(body2)
        }
      } else {
        return res.status(409).json(body)
      }
    }

    const email = auth.user.email || ''
    const { data: enqRaw, error: enqError } = await supabase.rpc('account_deletion_enqueue', {
      p_email: email,
    })

    if (enqError) {
      console.error('account_deletion_enqueue failed:', enqError)
      return res.status(500).json({ error: 'Failed to queue account deletion' })
    }

    const enq = asRecord(enqRaw as Json) || {}
    if (enq.ok !== true) {
      const body = mapValidationToResponse(enq, false)
      return res.status(409).json(body)
    }

    return res.status(200).json({ code: 'ACCOUNT_DELETION_QUEUED' as const })
  } catch (error) {
    console.error('Error in delete account API:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
