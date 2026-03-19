import { createClient } from 'npm:@supabase/supabase-js@2'

const PAYREXX_API_DEFAULT_VERSION = '1.14'

type Locale = 'de' | 'en' | 'fr'

type TemplateContent = {
  subject: string
  text: string
  html: string
}

type AutoRenewSubscriptionRow = {
  id: string
  seat_count: number
  amount_cents: number
  currency: string
  current_period_end: string | null
  metadata: Record<string, unknown> | null
  cancel_at_period_end: boolean | null
  account_id: string
}

type InvoiceStatus = 'draft' | 'open' | 'failed' | 'paid' | 'void' | 'cancelled'

type InvoiceRow = {
  id: string
  subscription_id: string
  status: InvoiceStatus
  created_at: string
}

type OrganizationAdminRow = {
  organization_id: number
  user_id: string
  created_at: string
}

type UserRow = {
  user_id: string
  language: string | null
  first_name: string | null
  last_name: string | null
}

type PayrexxGatewayPayload = {
  amount: number
  currency: string
  purpose: string
  successRedirectUrl: string
  failedRedirectUrl: string
  cancelRedirectUrl: string
  referenceId: string
  language: string
  skipResultPage: boolean
  validity: number
  subscriptionState: boolean
}

type PayrexxGatewayResponse = {
  status?: string
  data?: Array<{
    id?: number
    link?: string
    hash?: string
  }>
}

function env(name: string, fallback?: string): string {
  const value = Deno.env.get(name) ?? fallback
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

function encodeRfc3986(value: string): string {
  return encodeURIComponent(value)
}

function encodeRfc1738(value: string): string {
  return encodeURIComponent(value).replace(/%20/g, '+')
}

function normalizePayrexxSignatureEncoding(value: string): string {
  return value.replace(/[!'()*~]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)
}

function buildPayrexxQueryString(
  data: Record<string, unknown>,
  options?: { rfc1738?: boolean; normalizeSignatureChars?: boolean },
): string {
  const useRfc1738 = options?.rfc1738 ?? false
  const normalizeSignatureChars = options?.normalizeSignatureChars ?? false

  return Object.keys(data)
    .flatMap((key) => {
      const rawValue = data[key]
      if (rawValue === undefined || rawValue === null) return []

      const encode = useRfc1738 ? encodeRfc1738 : encodeRfc3986
      const encodedKey = encode(key)
      const encodedValue = encode(String(rawValue))

      return normalizeSignatureChars
        ? `${normalizePayrexxSignatureEncoding(encodedKey)}=${normalizePayrexxSignatureEncoding(encodedValue)}`
        : `${encodedKey}=${encodedValue}`
    })
    .join('&')
}

async function hmacSha256Base64(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  const bytes = new Uint8Array(signature)
  let binary = ''
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index])
  }
  return btoa(binary)
}

async function buildPayrexxSignature(data: Record<string, unknown>, secret: string): Promise<string> {
  // Match payrexxClient.ts behavior:
  // - signature over RFC1738 query string
  // - normalize !'()*~ to uppercase percent-encoding
  const query = buildPayrexxQueryString(data, { rfc1738: true, normalizeSignatureChars: true })
  return hmacSha256Base64(query, secret)
}

async function createPayrexxGateway(params: {
  instance: string
  apiSecret: string
  apiVersion: string
  payload: PayrexxGatewayPayload
}): Promise<{ gatewayId: number; checkoutUrl: string; gatewayHash: string | null }> {
  const data: Record<string, unknown> = {
    ...params.payload,
  }
  data.ApiSignature = await buildPayrexxSignature(data, params.apiSecret)
  // Match payrexxClient.ts behavior: request body uses default query-string encoding.
  const body = buildPayrexxQueryString(data)
  const url = `https://api.payrexx.com/v${params.apiVersion}/Gateway/?instance=${encodeURIComponent(params.instance)}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })

  const text = await response.text()
  if (!response.ok) {
    throw new Error(`Payrexx gateway creation failed (${response.status}): ${text}`)
  }

  let json: PayrexxGatewayResponse
  try {
    json = JSON.parse(text) as PayrexxGatewayResponse
  } catch {
    throw new Error(`Payrexx gateway creation returned invalid JSON: ${text}`)
  }

  const gateway = json.data?.[0]
  if (json.status !== 'success' || !gateway?.id || !gateway.link) {
    throw new Error(`Payrexx gateway creation returned unexpected payload: ${text}`)
  }

  return {
    gatewayId: gateway.id,
    checkoutUrl: gateway.link,
    gatewayHash: gateway.hash || null,
  }
}

function detectLocale(raw: string | null | undefined): Locale {
  if (!raw) return 'de'
  const normalized = raw.toLowerCase()
  if (normalized.startsWith('fr')) return 'fr'
  if (normalized.startsWith('en')) return 'en'
  return 'de'
}

function buildCheckoutLinkTemplate(
  locale: Locale,
  checkoutUrl: string,
  managementUrl: string,
): TemplateContent {

  if (locale === 'fr') {
    return {
      subject: 'EduTime: lien de paiement pour la licence d’organisation',
      text: `Bonjour,\n\nLe lien de paiement pour le renouvellement de votre licence d’organisation est prêt.\n\nLien de paiement: ${checkoutUrl}\n\nVous pouvez aussi y accéder ici: ${managementUrl}\n\nEquipe EduTime`,
      html: `<p>Bonjour,</p><p>Le lien de paiement pour le renouvellement de votre licence d’organisation est prêt.</p><p><a href="${checkoutUrl}">Ouvrir le lien de paiement</a></p><p>Vous pouvez aussi y accéder ici: <a href="${managementUrl}">${managementUrl}</a></p><p>Equipe EduTime</p>`,
    }
  }

  if (locale === 'en') {
    return {
      subject: 'EduTime: organization license payment link',
      text: `Hello,\n\nYour payment link for renewing your organization license is ready.\n\nPayment link: ${checkoutUrl}\n\nYou can also access it here: ${managementUrl}\n\nEduTime Team`,
      html: `<p>Hello,</p><p>Your payment link for renewing your organization license is ready.</p><p><a href="${checkoutUrl}">Open payment link</a></p><p>You can also access it here: <a href="${managementUrl}">${managementUrl}</a></p><p>EduTime Team</p>`,
    }
  }

  return {
    subject: 'EduTime: Zahlungslink für Organisationslizenz',
    text: `Hallo,\n\nDer Zahlungslink für die Verlängerung deiner Organisationslizenz ist bereit.\n\nZahlungslink: ${checkoutUrl}\n\nDu kannst ihn auch hier öffnen: ${managementUrl}\n\nEduTime Team`,
    html: `<p>Hallo,</p><p>Der Zahlungslink für die Verlängerung deiner Organisationslizenz ist bereit.</p><p><a href="${checkoutUrl}">Zahlungslink öffnen</a></p><p>Du kannst ihn auch hier öffnen: <a href="${managementUrl}">${managementUrl}</a></p><p>EduTime Team</p>`,
  }
}

async function sendEmailWithResend(
  apiKey: string,
  fromEmail: string,
  toEmail: string,
  content: TemplateContent,
): Promise<void> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      subject: content.subject,
      text: content.text,
      html: content.html,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Resend API error (${response.status}): ${body}`)
  }
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const requiredJobSecret = Deno.env.get('ORG_BILLING_JOB_SECRET')
  if (requiredJobSecret) {
    const incomingSecret = req.headers.get('x-job-secret')
    if (incomingSecret !== requiredJobSecret) {
      return new Response('Unauthorized', { status: 401 })
    }
  }

  try {
    const supabaseUrl = env('SUPABASE_URL')
    const serviceRoleKey = env('SUPABASE_SERVICE_ROLE_KEY')
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const payrexxInstance = Deno.env.get('PAYREXX_INSTANCE')
    const payrexxApiSecret = Deno.env.get('PAYREXX_API_SECRET')
    const payrexxApiVersion = (Deno.env.get('PAYREXX_API_VERSION') || PAYREXX_API_DEFAULT_VERSION).replace(
      /^v/i,
      '',
    )
    const fromEmail = Deno.env.get('BILLING_FROM_EMAIL') || 'EduTime <billing@edutime.ch>'
    const appUrl = Deno.env.get('NEXT_PUBLIC_APP_URL') || Deno.env.get('APP_URL') || 'https://edutime.ch'
    const nowIso = new Date().toISOString()

    const billing = createClient(supabaseUrl, serviceRoleKey, {
      db: { schema: 'billing' },
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const publicClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    let autoRenewCreatedCount = 0
    let autoRenewFailedCount = 0
    let checkoutLinkEmailsSent = 0
    let checkoutLinkEmailsFailed = 0
    if (payrexxInstance && payrexxApiSecret) {
      const { data: dueSubscriptions, error: dueSubscriptionsError } = await billing
        .from('subscriptions')
        .select(
          'id, seat_count, amount_cents, currency, current_period_end, metadata, cancel_at_period_end, account_id',
        )
        .eq('provider', 'payrexx')
        .in('status', ['active', 'active_unpaid'])
        .eq('cancel_at_period_end', false)
        .lte('current_period_end', nowIso)

      if (dueSubscriptionsError) {
        throw new Error(`Failed to fetch due org subscriptions: ${dueSubscriptionsError.message}`)
      }

      const orgSubscriptions = ((dueSubscriptions || []) as AutoRenewSubscriptionRow[]).filter(
        (row) => (row.metadata?.plan as string | undefined) === 'org',
      )

      const accountIds = Array.from(new Set(orgSubscriptions.map((row) => row.account_id)))
      const subscriptionIds = orgSubscriptions.map((row) => row.id)

      const accountOrgMap = new Map<string, number>()
      if (accountIds.length > 0) {
        const { data: accounts, error: accountsError } = await billing
          .from('accounts')
          .select('id, organization_id')
          .in('id', accountIds)

        if (accountsError) {
          throw new Error(`Failed to map org accounts: ${accountsError.message}`)
        }

        for (const account of accounts || []) {
          if (account.organization_id) {
            accountOrgMap.set(account.id, account.organization_id)
          }
        }
      }

      const openInvoiceSubscriptions = new Set<string>()
      if (subscriptionIds.length > 0) {
        const { data: invoices, error: invoicesError } = await billing
          .from('invoices')
          .select('id, subscription_id, status, created_at')
          .in('subscription_id', subscriptionIds)
          .order('created_at', { ascending: false })

        if (invoicesError) {
          throw new Error(`Failed to fetch org renewal invoices: ${invoicesError.message}`)
        }

        const latestInvoiceBySubscription = new Map<string, InvoiceRow>()
        for (const invoice of (invoices || []) as InvoiceRow[]) {
          if (!latestInvoiceBySubscription.has(invoice.subscription_id)) {
            latestInvoiceBySubscription.set(invoice.subscription_id, invoice)
          }
        }
        latestInvoiceBySubscription.forEach((invoice, subscriptionId) => {
          if (invoice.status === 'open' || invoice.status === 'draft' || invoice.status === 'failed') {
            openInvoiceSubscriptions.add(subscriptionId)
          }
        })
      }

      const organizationIds = Array.from(
        new Set(
          orgSubscriptions
            .map((subscription) => accountOrgMap.get(subscription.account_id))
            .filter((value): value is number => Number.isInteger(value)),
        ),
      )
      const adminByOrg = new Map<number, OrganizationAdminRow>()
      const userById = new Map<string, UserRow>()
      const adminEmailByUserId = new Map<string, string>()

      if (organizationIds.length > 0) {
        const { data: organizationAdmins, error: organizationAdminsError } = await publicClient
          .from('organization_administrators')
          .select('organization_id, user_id, created_at')
          .in('organization_id', organizationIds)
          .not('user_id', 'is', null)
          .order('created_at', { ascending: true })

        if (organizationAdminsError) {
          throw new Error(`Failed to fetch organization admins: ${organizationAdminsError.message}`)
        }

        for (const admin of (organizationAdmins || []) as OrganizationAdminRow[]) {
          if (!adminByOrg.has(admin.organization_id)) {
            adminByOrg.set(admin.organization_id, admin)
          }
        }
      }

      const userIdsForLookup = Array.from(
        new Set(
          Array.from(adminByOrg.values())
            .map((row) => row.user_id)
            .filter((value): value is string => Boolean(value)),
        ),
      )

      if (userIdsForLookup.length > 0) {
        const { data: users, error: usersError } = await publicClient
          .from('users')
          .select('user_id, language, first_name, last_name')
          .in('user_id', userIdsForLookup)

        if (usersError) {
          throw new Error(`Failed to fetch admin profiles for org renewals: ${usersError.message}`)
        }

        for (const user of (users || []) as UserRow[]) {
          userById.set(user.user_id, user)
        }

        for (const userId of userIdsForLookup) {
          const { data: authUserData, error: authUserError } = await publicClient.auth.admin.getUserById(userId)
          if (authUserError) {
            console.error(`Failed to fetch auth user email for ${userId}: ${authUserError.message}`)
            continue
          }

          const email = authUserData.user?.email
          if (email) {
            adminEmailByUserId.set(userId, email)
          }
        }
      }

      for (const subscription of orgSubscriptions) {
        try {
          if (openInvoiceSubscriptions.has(subscription.id)) {
            continue
          }

          const organizationId = accountOrgMap.get(subscription.account_id)
          if (!organizationId) {
            throw new Error(`Missing organization mapping for account ${subscription.account_id}`)
          }

          const admin = adminByOrg.get(organizationId)
          if (!admin?.user_id) {
            throw new Error(`Missing organization admin for organization ${organizationId}`)
          }

          const adminUser = userById.get(admin.user_id)
          const adminEmail = adminEmailByUserId.get(admin.user_id)
          const seatCountFromMetadata = Number(subscription.metadata?.next_period_seat_count ?? NaN)
          const seatCount = Number.isFinite(seatCountFromMetadata) && seatCountFromMetadata >= 3
            ? Math.trunc(seatCountFromMetadata)
            : subscription.seat_count

          if (!Number.isInteger(seatCount) || seatCount < 3) {
            throw new Error(`Invalid seat count for subscription ${subscription.id}`)
          }

          const amountCents = Number(subscription.amount_cents)
          if (!Number.isInteger(amountCents) || amountCents <= 0) {
            throw new Error(`Invalid amount for subscription ${subscription.id}`)
          }

          const renewalDate = subscription.current_period_end
            ? new Date(subscription.current_period_end)
            : new Date(nowIso)
          const referencePeriod = Number.isNaN(renewalDate.getTime())
            ? nowIso.slice(0, 10)
            : renewalDate.toISOString().slice(0, 10)
          const referenceId = `org-renewal-${subscription.id}-${referencePeriod}`
          const successUrl = `${appUrl}/checkout/success?ref=${referenceId}&plan=org`
          const failedUrl = `${appUrl}/checkout/failed?ref=${referenceId}`
          const cancelUrl = `${appUrl}/checkout/cancel?ref=${referenceId}`
          const locale = detectLocale(adminUser?.language)
          const language = locale === 'fr' ? 'fr' : locale === 'en' ? 'en' : 'de'

          const gateway = await createPayrexxGateway({
            instance: payrexxInstance,
            apiSecret: payrexxApiSecret,
            apiVersion: payrexxApiVersion,
            payload: {
              amount: amountCents,
              currency: subscription.currency || 'CHF',
              purpose: `EduTime Organizationslizenz Erneuerung (${seatCount} Sitze)`,
              successRedirectUrl: successUrl,
              failedRedirectUrl: failedUrl,
              cancelRedirectUrl: cancelUrl,
              referenceId,
              language,
              skipResultPage: false,
              validity: 120,
              subscriptionState: false,
            },
          })

          const periodStart = subscription.current_period_end
            ? new Date(subscription.current_period_end)
            : new Date(nowIso)
          const dueDate = new Date(
            Date.UTC(periodStart.getUTCFullYear(), periodStart.getUTCMonth(), periodStart.getUTCDate() + 30),
          ).toISOString()

          const { error: createCheckoutError } = await billing.rpc('create_org_checkout', {
            p_actor_user_id: admin.user_id,
            p_organization_id: organizationId,
            p_quantity: seatCount,
            p_amount_cents: amountCents,
            p_currency: subscription.currency || 'CHF',
            p_reference_id: referenceId,
            p_payrexx_gateway_id: gateway.gatewayId,
            p_payrexx_gateway_link: gateway.checkoutUrl,
            p_payrexx_gateway_hash: gateway.gatewayHash,
            p_expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            p_due_date: dueDate,
            p_metadata: {
              source: 'org_billing_jobs_auto_renew',
              auto_renew: true,
              previous_subscription_id: subscription.id,
              generated_at: nowIso,
            },
          })

          if (createCheckoutError) {
            throw new Error(`create_org_checkout failed: ${createCheckoutError.message}`)
          }

          autoRenewCreatedCount += 1

          if (resendApiKey && adminEmail) {
            try {
              const locale = detectLocale(adminUser?.language)
              const managementUrl = `${appUrl}/app/organization-management`
              const emailTemplate = buildCheckoutLinkTemplate(locale, gateway.checkoutUrl, managementUrl)
              await sendEmailWithResend(resendApiKey, fromEmail, adminEmail, emailTemplate)
              checkoutLinkEmailsSent += 1
            } catch (emailError) {
              checkoutLinkEmailsFailed += 1
              console.error(
                `org-billing-jobs checkout-link email failed for subscription ${subscription.id}:`,
                emailError instanceof Error ? emailError.message : emailError,
              )
            }
          } else {
            if (!resendApiKey) {
              console.warn('org-billing-jobs checkout-link email skipped: RESEND_API_KEY is not configured')
            } else if (!adminEmail) {
              console.warn(
                `org-billing-jobs checkout-link email skipped: missing admin email for organization ${organizationId}`,
              )
            }
          }
        } catch (error) {
          autoRenewFailedCount += 1
          console.error(
            `org-billing-jobs auto-renew failed for subscription ${subscription.id}:`,
            error instanceof Error ? error.message : error,
          )
        }
      }
    } else {
      console.warn(
        'org-billing-jobs auto-renew skipped: PAYREXX_INSTANCE or PAYREXX_API_SECRET not configured',
      )
    }

    const { data: cancellationFinalizationSummary, error: cancellationFinalizationError } = await billing.rpc(
      'run_org_cancellation_finalization_sweep',
      { p_reference_time: nowIso },
    )
    if (cancellationFinalizationError) {
      throw new Error(
        `run_org_cancellation_finalization_sweep failed: ${cancellationFinalizationError.message}`,
      )
    }

    const { data: delinquencySummary, error: delinquencyError } = await billing.rpc(
      'run_org_delinquency_sweep',
      { p_reference_time: nowIso },
    )
    if (delinquencyError) {
      throw new Error(`run_org_delinquency_sweep failed: ${delinquencyError.message}`)
    }

    return new Response(
      JSON.stringify({
        ok: true,
        delinquencySummary,
        cancellationFinalizationSummary,
        autoRenewCheckoutsCreated: autoRenewCreatedCount,
        autoRenewCheckoutsFailed: autoRenewFailedCount,
        checkoutLinkEmailsSent,
        checkoutLinkEmailsFailed,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown org billing job error'
    console.error('org-billing-jobs failed:', message)
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
