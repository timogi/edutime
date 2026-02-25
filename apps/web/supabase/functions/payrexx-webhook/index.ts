import { createClient } from 'npm:@supabase/supabase-js@2'

type JsonObject = Record<string, unknown>

type PayrexxTransaction = {
  id: number
  status?: string
  referenceId?: string
  gateway?: { id?: number } | null
}

const PAYREXX_API_BASE = 'https://api.payrexx.com/v1.0'
const SUCCESS_STATUSES = new Set(['confirmed', 'authorized', 'paid'])
const FAILURE_STATUSES = new Set(['failed', 'cancelled', 'expired'])

function env(name: string): string {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

function normalizeSignature(value: string): string {
  return value.trim().replace(/^(sha256=|v\d+=)/i, '').toLowerCase()
}

function extractSignatureTokens(value: string): string[] {
  const trimmed = value.trim()
  if (!trimmed) return []

  const parts = trimmed.split(',').map((part) => part.trim())
  const tokens: string[] = []

  for (const part of parts) {
    if (!part) continue
    const eqIdx = part.indexOf('=')
    if (eqIdx > 0) {
      const key = part.slice(0, eqIdx).trim().toLowerCase()
      const val = part.slice(eqIdx + 1).trim()
      if (key === 'v1' || key === 'v2' || key === 'sha256' || key === 'sig' || key === 'signature') {
        tokens.push(val)
      } else {
        tokens.push(part)
      }
    } else {
      tokens.push(part)
    }
  }

  return tokens
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

function arrayBufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
}

async function createWebhookHmacCandidates(rawBody: string, secret: string): Promise<string[]> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody))
  const base64 = arrayBufferToBase64(signature)
  const hex = arrayBufferToHex(signature)
  return [normalizeSignature(base64), normalizeSignature(hex)]
}

function extractSignatureCandidates(headers: Headers, payload: JsonObject): string[] {
  const headerValues = [
    headers.get('x-webhook-signature'),
    headers.get('x-payrexx-signature'),
    headers.get('payrexx-signature'),
    headers.get('x-api-signature'),
    headers.get('api-signature'),
  ]
    .filter((value): value is string => Boolean(value))
    .flatMap((value) => extractSignatureTokens(value))

  const payloadValues = [payload.signature, payload.apiSignature]
    .filter((value): value is string => typeof value === 'string')
    .flatMap((value) => extractSignatureTokens(value))

  return [...headerValues, ...payloadValues].map(normalizeSignature)
}

async function verifyWebhookSignature(
  rawBody: string,
  headers: Headers,
  payload: JsonObject,
  secret: string,
): Promise<{ ok: boolean; providedCount: number }> {
  const provided = extractSignatureCandidates(headers, payload)
  if (provided.length === 0) return { ok: false, providedCount: 0 }

  const canonicalBody = JSON.stringify(payload)
  const expectedCandidates = [
    ...(await createWebhookHmacCandidates(rawBody, secret)),
    ...(canonicalBody !== rawBody ? await createWebhookHmacCandidates(canonicalBody, secret) : []),
  ]
  const ok = provided.some((incoming) =>
    expectedCandidates.some((expected) => timingSafeEqual(incoming, expected)),
  )
  return { ok, providedCount: provided.length }
}

function extractEventType(payload: JsonObject): string {
  const transactionPayload = getTransactionPayload(payload)
  const candidate = payload.event ?? payload.type ?? transactionPayload?.status ?? payload.status
  return typeof candidate === 'string' && candidate.length > 0 ? candidate : 'unknown'
}

function getTransactionPayload(payload: JsonObject): JsonObject | null {
  if (payload.transaction && typeof payload.transaction === 'object' && !Array.isArray(payload.transaction)) {
    return payload.transaction as JsonObject
  }

  // Subscription webhook can arrive with transaction-like fields at top level.
  if (
    typeof payload.id === 'number' &&
    typeof payload.status === 'string' &&
    payload.invoice &&
    typeof payload.invoice === 'object'
  ) {
    return payload
  }

  return null
}

function extractTransactionId(payload: JsonObject): number | null {
  const transaction = getTransactionPayload(payload) ?? undefined
  const data = payload.data as JsonObject | undefined

  const candidates: unknown[] = [
    transaction?.id,
    payload.transactionId,
    payload.transaction_id,
    data?.id,
    (data?.transaction as JsonObject | undefined)?.id,
  ]

  for (const candidate of candidates) {
    const num = Number(candidate)
    if (Number.isFinite(num) && num > 0) {
      return num
    }
  }
  return null
}

function extractReferenceId(payload: JsonObject, verifiedTransaction?: PayrexxTransaction): string | null {
  const transaction = getTransactionPayload(payload) ?? undefined
  const data = payload.data as JsonObject | undefined
  const transactionInvoice = transaction?.invoice as JsonObject | undefined
  const payloadInvoice = payload.invoice as JsonObject | undefined

  const candidates: unknown[] = [
    verifiedTransaction?.referenceId,
    payload.referenceId,
    payload.reference_id,
    transaction?.referenceId,
    transaction?.reference_id,
    transactionInvoice?.referenceId,
    transactionInvoice?.reference_id,
    payloadInvoice?.referenceId,
    payloadInvoice?.reference_id,
    data?.referenceId,
    data?.reference_id,
  ]

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.length > 0) {
      return candidate
    }
  }
  return null
}

function extractGatewayId(payload: JsonObject, verifiedTransaction?: PayrexxTransaction): number | null {
  const transaction = getTransactionPayload(payload) ?? undefined
  const data = payload.data as JsonObject | undefined
  const transactionGateway = transaction?.gateway as JsonObject | undefined

  const candidates: unknown[] = [
    verifiedTransaction?.gateway?.id,
    payload.gatewayId,
    payload.gateway_id,
    transaction?.gatewayId,
    transaction?.gateway_id,
    transactionGateway?.id,
    data?.gatewayId,
    data?.gateway_id,
  ]

  for (const candidate of candidates) {
    const num = Number(candidate)
    if (Number.isFinite(num) && num > 0) {
      return num
    }
  }
  return null
}

function buildEventKey(payload: JsonObject, eventType: string, transactionId: number | null): string {
  const explicitId = payload.id ?? payload.event_id
  if (typeof explicitId === 'string' && explicitId.length > 0) {
    return explicitId
  }
  if (typeof explicitId === 'number' && Number.isFinite(explicitId)) {
    return `payrexx:${explicitId}`
  }
  if (transactionId) {
    return `tx:${transactionId}:${eventType}`
  }
  return `fallback:${eventType}:${new Date().toISOString()}`
}

function payrexxSignature(data: Record<string, unknown>, apiSecret: string): Promise<string> {
  const pairs = Object.keys(data)
    .sort()
    .flatMap((key) => {
      const value = data[key]
      if (value === undefined || value === null) return []
      return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    })
  const query = pairs.join('&').replace(/%20/g, '+')
  const keyData = new TextEncoder().encode(apiSecret)
  const message = new TextEncoder().encode(query)
  return crypto.subtle
    .importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    .then((key) => crypto.subtle.sign('HMAC', key, message))
    .then((signature) => arrayBufferToBase64(signature))
}

async function fetchTransactionFromPayrexx(
  transactionId: number,
  instance: string,
  apiSecret: string,
): Promise<PayrexxTransaction | null> {
  const query: Record<string, unknown> = { instance }
  query.ApiSignature = await payrexxSignature({}, apiSecret)

  const url = `${PAYREXX_API_BASE}/Transaction/${transactionId}/?instance=${encodeURIComponent(instance)}&ApiSignature=${encodeURIComponent(String(query.ApiSignature))}`
  const response = await fetch(url, { method: 'GET' })
  if (!response.ok) {
    throw new Error(`Payrexx verification request failed (${response.status})`)
  }

  const json = (await response.json()) as { status?: string; data?: PayrexxTransaction[] }
  if (json.status !== 'success' || !json.data || json.data.length === 0) {
    return null
  }
  return json.data[0]
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const supabaseUrl = env('SUPABASE_URL')
  const serviceRoleKey = env('SUPABASE_SERVICE_ROLE_KEY')
  const payrexxWebhookSecret = env('PAYREXX_WEBHOOK_SECRET')
  const payrexxInstance = env('PAYREXX_INSTANCE')
  const payrexxApiSecret = env('PAYREXX_API_SECRET')
  const allowUnsignedWebhooks = Deno.env.get('PAYREXX_ALLOW_UNSIGNED_WEBHOOKS') === 'true'

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    db: { schema: 'billing' },
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const rawBody = await req.text()
  let payload: JsonObject
  try {
    payload = JSON.parse(rawBody) as JsonObject
  } catch {
    return new Response('Invalid JSON payload', { status: 400 })
  }

  const signatureVerification = await verifyWebhookSignature(
    rawBody,
    req.headers,
    payload,
    payrexxWebhookSecret,
  )
  const signatureMissing = signatureVerification.providedCount === 0
  const signatureOk = signatureVerification.ok

  if (!signatureOk && !(allowUnsignedWebhooks && signatureMissing)) {
    return new Response('Invalid signature', { status: 401 })
  }

  if (signatureMissing && allowUnsignedWebhooks) {
    console.warn('Webhook arrived without signature header; processing via API verification fallback')
  }

  const eventType = extractEventType(payload)
  const transactionId = extractTransactionId(payload)
  const eventKey = buildEventKey(payload, eventType, transactionId)

  const { data: existingEvent, error: existingEventError } = await admin
    .from('webhook_events')
    .select('id, processed')
    .eq('event_key', eventKey)
    .maybeSingle()

  if (existingEventError) {
    console.error('Failed to check webhook idempotency:', existingEventError)
    return new Response('Failed to check webhook event state', { status: 500 })
  }

  if (!existingEvent) {
    const { error: insertEventError } = await admin.from('webhook_events').insert({
      event_key: eventKey,
      event_type: eventType,
      payload,
      processed: false,
    })
    if (insertEventError) {
      console.error('Failed to persist webhook event:', insertEventError)
      return new Response('Failed to persist webhook event', { status: 500 })
    }
  } else if (existingEvent.processed) {
    return new Response('ok (already processed)', { status: 200 })
  }

  try {
    const transactionPayload = getTransactionPayload(payload)
    let verifiedTx: PayrexxTransaction | null = null

    if (transactionId) {
      try {
        verifiedTx = await fetchTransactionFromPayrexx(transactionId, payrexxInstance, payrexxApiSecret)
      } catch (verifyError) {
        console.warn('Transaction verification failed, trying signed payload fallback:', verifyError)
      }
    }

    if (!verifiedTx && !transactionPayload) {
      throw new Error('Webhook has neither verifiable transaction nor usable payload transaction data')
    }

    const normalizedStatus = String(
      verifiedTx?.status || transactionPayload?.status || payload.status || '',
    ).toLowerCase()
    const referenceId = extractReferenceId(payload, verifiedTx)
    const gatewayId = extractGatewayId(payload, verifiedTx)

    if (!referenceId) {
      // Ignore events that are not linked to a checkout session reference.
      const { error: markIgnoredError } = await admin
        .from('webhook_events')
        .update({
          processed: true,
          processing_error: 'ignored: missing reference_id',
          processed_at: new Date().toISOString(),
        })
        .eq('event_key', eventKey)

      if (markIgnoredError) {
        console.error('Failed to mark missing-reference webhook as processed:', markIgnoredError)
      }

      return new Response('ok (ignored: missing reference_id)', { status: 200 })
    }

    if (SUCCESS_STATUSES.has(normalizedStatus)) {
      const { error: rpcError } = await admin.rpc('process_payrexx_payment', {
        p_reference_id: referenceId,
        p_payrexx_transaction_id: String(verifiedTx?.id || transactionId || eventKey),
        p_payrexx_gateway_id: gatewayId,
        p_raw_payload: payload,
      })

      if (rpcError) {
        throw new Error(`process_payrexx_payment failed: ${rpcError.message}`)
      }
    } else if (FAILURE_STATUSES.has(normalizedStatus)) {
      const { error: failError } = await admin.rpc('fail_checkout_session', {
        p_reference_id: referenceId,
        p_status: normalizedStatus,
        p_reason: `payrexx:${normalizedStatus}`,
      })

      if (failError) {
        throw new Error(`fail_checkout_session failed: ${failError.message}`)
      }
    } else {
      throw new Error(`Unhandled Payrexx transaction status: ${normalizedStatus || 'unknown'}`)
    }

    const { error: markProcessedError } = await admin
      .from('webhook_events')
      .update({ processed: true, processing_error: null, processed_at: new Date().toISOString() })
      .eq('event_key', eventKey)

    if (markProcessedError) {
      console.error('Failed to mark webhook event as processed:', markProcessedError)
      return new Response('Payment processed, event state update failed', { status: 202 })
    }

    return new Response('ok', { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown webhook processing error'

    console.error('Payrexx webhook processing failed:', message, payload)

    const { error: markFailedError } = await admin
      .from('webhook_events')
      .update({ processed: false, processing_error: message, processed_at: null })
      .eq('event_key', eventKey)

    if (markFailedError) {
      console.error('Failed to update webhook_events after processing error:', markFailedError)
    }

    return new Response('Webhook processing failed', { status: 500 })
  }
})
