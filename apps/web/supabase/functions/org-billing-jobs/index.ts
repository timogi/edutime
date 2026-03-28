import { createClient } from 'npm:@supabase/supabase-js@2'

const PAYREXX_API_DEFAULT_VERSION = '1.14'

const EDUTIME_TRANSACTIONAL_FROM = 'EduTime GmbH <noreply@send.edutime.ch>'

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

/** Days after period end until invoice payment is due (matches create_org_checkout p_due_date). Default 45. */
function resolveOrgInvoiceDueDaysAfterPeriodEnd(metadata: Record<string, unknown> | null): number {
  const raw = metadata?.invoice_due_days ?? metadata?.org_invoice_due_days
  const n = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : Number.NaN
  if (Number.isInteger(n) && n >= 1 && n <= 366) return n
  return 45
}

function formatPaymentDueDate(locale: Locale, paymentDueIso: string): string {
  const d = new Date(paymentDueIso)
  if (Number.isNaN(d.getTime())) return paymentDueIso
  const tag = locale === 'fr' ? 'fr-CH' : locale === 'en' ? 'en-GB' : 'de-CH'
  return new Intl.DateTimeFormat(tag, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(d)
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function resolveActorUserId(subscription: AutoRenewSubscriptionRow, fallbackAdminUserId: string): string {
  const raw = subscription.metadata?.responsible_user_id
  if (typeof raw === 'string' && UUID_RE.test(raw.trim())) {
    return raw.trim()
  }
  return fallbackAdminUserId
}

function resolveBillingRecipientEmail(
  subscription: AutoRenewSubscriptionRow,
  fallbackAdminEmail: string | undefined,
): string | undefined {
  const raw = subscription.metadata?.responsible_email
  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (trimmed.includes('@')) return trimmed
  }
  return fallbackAdminEmail
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

function formatCheckoutAmount(locale: Locale, amountCents: number, currency: string): string {
  const tag = locale === 'fr' ? 'fr-CH' : locale === 'en' ? 'en-CH' : 'de-CH'
  const code = currency.trim() || 'CHF'
  return new Intl.NumberFormat(tag, {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountCents / 100)
}

interface CheckoutLinkEmailContext {
  orgName: string
  amountCents: number
  currency: string
  seatCount: number
  /** Same instant as p_due_date passed to create_org_checkout (invoice payment deadline). */
  paymentDueIso: string
}

function buildCheckoutLinkTemplate(
  locale: Locale,
  checkoutUrl: string,
  ctx: CheckoutLinkEmailContext,
): TemplateContent {
  const name = ctx.orgName.trim() || 'Organisation'
  const amountLabel = formatCheckoutAmount(locale, ctx.amountCents, ctx.currency)
  const seats = ctx.seatCount
  const dueLabel = formatPaymentDueDate(locale, ctx.paymentDueIso)

  if (locale === 'fr') {
    return {
      subject: `EduTime: renouvellement de la licence — ${name}`,
      text: [
        'Bonjour',
        '',
        `Le renouvellement de la licence d’organisation EduTime pour « ${name} » est dû. Vous pouvez régler le montant ci-dessous ; l’accès reste possible en attendant.`,
        '',
        `Montant : ${amountLabel} pour ${seats} sièges (par an).`,
        `Échéance : paiement au plus tard le ${dueLabel}.`,
        '',
        `Lien de paiement : ${checkoutUrl}`,
        '',
        'Merci de ne pas répondre directement à cet e-mail. Pour toute question : info@edutime.ch',
        '',
        'Ce message a été envoyé à tous les administrateurs de l’organisation.',
        '',
        'Equipe EduTime',
      ].join('\n'),
      html: `<p>Bonjour</p>
<p>Le renouvellement de la licence d’organisation EduTime pour « ${name} » est dû. Vous pouvez régler le montant ci-dessous ; l’accès reste possible en attendant.</p>
<p><strong>Montant :</strong> ${amountLabel} pour ${seats} sièges (par an).<br>
<strong>Échéance :</strong> paiement au plus tard le <strong>${dueLabel}</strong>.</p>
<p><a href="${checkoutUrl}">Ouvrir le lien de paiement</a></p>
<p>Merci de ne pas répondre directement à cet e-mail. Pour toute question : <a href="mailto:info@edutime.ch">info@edutime.ch</a></p>
<p>Ce message a été envoyé à tous les administrateurs de l’organisation.</p>
<p>Equipe EduTime</p>`,
    }
  }

  if (locale === 'en') {
    return {
      subject: `EduTime: license renewal due — ${name}`,
      text: [
        'Hello',
        '',
        `Your EduTime organization license for «${name}» is due for renewal. You can pay using the link below; access can continue while payment is pending.`,
        '',
        `Amount: ${amountLabel} per year for ${seats} seats.`,
        `Payment deadline: pay by ${dueLabel}.`,
        '',
        `Payment link: ${checkoutUrl}`,
        '',
        'Please do not reply to this email directly. For questions: info@edutime.ch',
        '',
        'This message was sent to all organization administrators.',
        '',
        'EduTime Team',
      ].join('\n'),
      html: `<p>Hello</p>
<p>Your EduTime organization license for «${name}» is <strong>due for renewal</strong>. You can pay using the link below; access can continue while payment is pending.</p>
<p><strong>Amount:</strong> ${amountLabel} per year for ${seats} seats.<br>
<strong>Payment deadline:</strong> pay by <strong>${dueLabel}</strong>.</p>
<p><a href="${checkoutUrl}">Open payment link</a></p>
<p>Please do not reply to this email directly. For questions: <a href="mailto:info@edutime.ch">info@edutime.ch</a></p>
<p>This message was sent to all organization administrators.</p>
<p>EduTime Team</p>`,
    }
  }

  return {
    subject: `EduTime: Verlängerung Organisationslizenz — ${name}`,
    text: [
      'Guten Tag',
      '',
      `Die Verlängerung Ihrer EduTime-Organisationslizenz für «${name}» steht an.`,
      '',
      `Betrag: ${amountLabel} pro Jahr für ${seats} Sitze`,
      `Zahlungsfrist: Zahlung bis zum ${dueLabel}.`,
      '',
      `Zahlungslink öffnen: ${checkoutUrl}`,
      '',
      'Bitte antworten Sie nicht direkt auf diese E-Mail. Bei Fragen: info@edutime.ch',
      '',
      'Diese Nachricht wurde an alle Organisations-Admins gesendet.',
      '',
      'Freundliche Grüsse',
      '',
      'EduTime Team',
    ].join('\n'),
    html: `<p>Guten Tag</p>
<p>Die Verlängerung Ihrer EduTime-Organisationslizenz für «${name}» steht an.</p>
<p>Betrag: ${amountLabel} pro Jahr für ${seats} Sitze<br>
<strong>Zahlungsfrist:</strong> Zahlung bis zum <strong>${dueLabel}</strong>.</p>
<p><a href="${checkoutUrl}">Zahlungslink öffnen</a></p>
<p>Bitte antworten Sie nicht direkt auf diese E-Mail. Bei Fragen: <a href="mailto:info@edutime.ch">info@edutime.ch</a></p>
<p>Diese Nachricht wurde an alle Organisations-Admins gesendet.</p>
<p>Freundliche Grüsse</p>
<p>EduTime Team</p>`,
  }
}

type PaymentInvoiceNoticeType =
  | 'payment_deadline_passed'
  | 'pre_org_deactivation'
  | 'invoice_overdue_45'
  | 'invoice_overdue_90'

/** Legacy types map to the same templates as the current reminder kinds. */
function paymentInvoiceNoticePhase(
  reminderType: PaymentInvoiceNoticeType,
): 'deadline_passed' | 'final_warning' {
  if (reminderType === 'payment_deadline_passed' || reminderType === 'invoice_overdue_45') {
    return 'deadline_passed'
  }
  return 'final_warning'
}

function isPaymentInvoiceNoticeType(t: string): t is PaymentInvoiceNoticeType {
  return (
    t === 'payment_deadline_passed' ||
    t === 'pre_org_deactivation' ||
    t === 'invoice_overdue_45' ||
    t === 'invoice_overdue_90'
  )
}

function buildPaymentInvoiceNoticeTemplate(
  locale: Locale,
  reminderType: PaymentInvoiceNoticeType,
  orgName: string,
  managementUrl: string,
): TemplateContent {
  const name = orgName || 'Organization'
  const phase = paymentInvoiceNoticePhase(reminderType)

  if (locale === 'fr') {
    if (phase === 'deadline_passed') {
      return {
        subject: `EduTime: date d’échéance atteinte — ${name}`,
        text: [
          'Bonjour',
          '',
          `La date d’échéance de la facture EduTime ouverte pour l’organisation « ${name} » est atteinte. Veuillez régler le montant sans délai.`,
          '',
          `Sans paiement, l’accès peut être restreint. Si la facture reste impayée pendant 45 jours après cette échéance, le compte organisation sera désactivé et les licences prendront fin.`,
          '',
          `Gestion de la licence et de l’organisation : ${managementUrl}`,
          '',
          'Merci de ne pas répondre directement à cet e-mail. Pour toute question : info@edutime.ch',
          '',
          'Ce message a été envoyé à tous les administrateurs de l’organisation.',
          '',
          'Equipe EduTime',
        ].join('\n'),
        html: `<p>Bonjour</p>
<p>La date d’échéance de la facture EduTime ouverte pour l’organisation « ${name} » est atteinte. Veuillez régler le montant sans délai.</p>
<p>Sans paiement, l’accès peut être restreint. Si la facture reste impayée pendant <strong>45 jours</strong> après cette échéance, le compte organisation sera désactivé et les licences prendront fin.</p>
<p><a href="${managementUrl}">Gestion de la licence et de l’organisation</a></p>
<p>Merci de ne pas répondre directement à cet e-mail. Pour toute question : <a href="mailto:info@edutime.ch">info@edutime.ch</a></p>
<p>Ce message a été envoyé à tous les administrateurs de l’organisation.</p>
<p>Equipe EduTime</p>`,
      }
    }
    return {
      subject: `EduTime: dernière relance avant désactivation — ${name}`,
      text: [
        'Bonjour',
        '',
        `La période de 45 jours après l’échéance de la facture EduTime pour l’organisation « ${name} » est échue aujourd’hui et la facture est toujours impayée. Dans la même exécution automatique des tâches de facturation, le compte organisation sera désactivé et les licences prendront fin.`,
        '',
        `Réglez la facture via le lien ci-dessous ; après paiement, vous pourrez réactiver l’organisation dans la gestion et rétablir l’accès pour vos utilisateurs.`,
        '',
        `Gestion de la licence et de l’organisation : ${managementUrl}`,
        '',
        'Merci de ne pas répondre directement à cet e-mail. Pour toute question : info@edutime.ch',
        '',
        'Ce message a été envoyé à tous les administrateurs de l’organisation.',
        '',
        'Equipe EduTime',
      ].join('\n'),
      html: `<p>Bonjour</p>
<p>La période de <strong>45 jours</strong> après l’échéance de la facture EduTime pour l’organisation « ${name} » est échue aujourd’hui et la facture est toujours impayée. Dans la même exécution automatique des tâches de facturation, le compte organisation sera <strong>désactivé</strong> et les licences prendront fin.</p>
<p>Réglez la facture via le lien ci-dessous ; après paiement, vous pourrez <strong>réactiver</strong> l’organisation dans la gestion et rétablir l’accès pour vos utilisateurs.</p>
<p><a href="${managementUrl}">Gestion de la licence et de l’organisation</a></p>
<p>Merci de ne pas répondre directement à cet e-mail. Pour toute question : <a href="mailto:info@edutime.ch">info@edutime.ch</a></p>
<p>Ce message a été envoyé à tous les administrateurs de l’organisation.</p>
<p>Equipe EduTime</p>`,
    }
  }

  if (locale === 'en') {
    if (phase === 'deadline_passed') {
      return {
        subject: `EduTime: invoice due date reached — ${name}`,
        text: [
          'Hello',
          '',
          `The due date of the open EduTime invoice for organization «${name}» has been reached. Please settle the amount without delay.`,
          '',
          `Without payment, access may be restricted. If the invoice remains unpaid for 45 days after this due date, the organization will be deactivated and licenses will expire.`,
          '',
          `License and organization management: ${managementUrl}`,
          '',
          'Please do not reply to this email directly. For questions: info@edutime.ch',
          '',
          'This message was sent to all organization administrators.',
          '',
          'EduTime Team',
        ].join('\n'),
        html: `<p>Hello</p>
<p>The due date of the open EduTime invoice for organization «${name}» has been reached. Please settle the amount without delay.</p>
<p>Without payment, access may be restricted. If the invoice remains unpaid for <strong>45 days</strong> after this due date, the organization will be deactivated and licenses will expire.</p>
<p><a href="${managementUrl}">License and organization management</a></p>
<p>Please do not reply to this email directly. For questions: <a href="mailto:info@edutime.ch">info@edutime.ch</a></p>
<p>This message was sent to all organization administrators.</p>
<p>EduTime Team</p>`,
      }
    }
    return {
      subject: `EduTime: final notice before deactivation — ${name}`,
      text: [
        'Hello',
        '',
        `The 45-day period after the EduTime invoice due date for organization «${name}» ends today and the invoice is still unpaid. In the same automated billing run, the organization will be deactivated and licenses will end.`,
        '',
        `Pay the invoice using the link below; after payment you can reactivate the organization in management and restore access for your users.`,
        '',
        `License and organization management: ${managementUrl}`,
        '',
        'Please do not reply to this email directly. For questions: info@edutime.ch',
        '',
        'This message was sent to all organization administrators.',
        '',
        'EduTime Team',
      ].join('\n'),
      html: `<p>Hello</p>
<p>The <strong>45-day</strong> period after the EduTime invoice due date for organization «${name}» ends today and the invoice is still unpaid. In the same automated billing run, the organization will be <strong>deactivated</strong> and licenses will end.</p>
<p>Pay the invoice using the link below; after payment you can <strong>reactivate</strong> the organization in management and restore access for your users.</p>
<p><a href="${managementUrl}">License and organization management</a></p>
<p>Please do not reply to this email directly. For questions: <a href="mailto:info@edutime.ch">info@edutime.ch</a></p>
<p>This message was sent to all organization administrators.</p>
<p>EduTime Team</p>`,
    }
  }

  if (phase === 'deadline_passed') {
    return {
      subject: `EduTime: Zahlungsfrist erreicht — ${name}`,
      text: [
        'Guten Tag',
        '',
        `Die Zahlungsfrist (Fälligkeit) der offenen EduTime-Rechnung für Ihre Organisation «${name}» ist erreicht. Bitte begleichen Sie den Betrag umgehend.`,
        '',
        `Ohne Zahlung kann der Zugriff eingeschränkt werden. Bleibt die Rechnung 45 Tage nach dieser Fälligkeit unbezahlt, wird die Organisation deaktiviert und die Lizenzen laufen aus.`,
        '',
        `Zur Lizenz- und Organisationsverwaltung: ${managementUrl}`,
        '',
        'Bitte antworten Sie nicht direkt auf diese E-Mail. Bei Fragen: info@edutime.ch',
        '',
        'Diese Nachricht wurde an alle Organisations-Admins gesendet.',
        '',
        'Freundliche Grüsse',
        '',
        'EduTime Team',
      ].join('\n'),
      html: `<p>Guten Tag</p>
<p>Die Zahlungsfrist (Fälligkeit) der offenen EduTime-Rechnung für Ihre Organisation «${name}» ist erreicht. Bitte begleichen Sie den Betrag umgehend.</p>
<p>Ohne Zahlung kann der Zugriff eingeschränkt werden. Bleibt die Rechnung <strong>45 Tage</strong> nach dieser Fälligkeit unbezahlt, wird die Organisation deaktiviert und die Lizenzen laufen aus.</p>
<p><a href="${managementUrl}">Zur Lizenz- und Organisationsverwaltung</a></p>
<p>Bitte antworten Sie nicht direkt auf diese E-Mail. Bei Fragen: <a href="mailto:info@edutime.ch">info@edutime.ch</a></p>
<p>Diese Nachricht wurde an alle Organisations-Admins gesendet.</p>
<p>Freundliche Grüsse</p>
<p>EduTime Team</p>`,
    }
  }
  return {
    subject: `EduTime: Letzte Mahnung vor Deaktivierung — ${name}`,
    text: [
      'Guten Tag',
      '',
      `Die Nachfrist von 45 Tagen nach Rechnungsfälligkeit für Ihre Organisation «${name}» ist heute abgelaufen und die Rechnung ist weiterhin unbezahlt. Im selben automatischen Abrechnungslauf wird Ihre Organisation jetzt deaktiviert; Organisationssitze und Lizenzen werden beendet.`,
      '',
      `Bitte begleichen Sie die offene Rechnung über die Lizenz- und Organisationsverwaltung. Nach erfolgreicher Zahlung können Sie die Organisation dort wieder aktivieren und den Zugang für Ihre Nutzer wiederherstellen.`,
      '',
      `Zur Lizenz- und Organisationsverwaltung: ${managementUrl}`,
      '',
      'Bitte antworten Sie nicht direkt auf diese E-Mail. Bei Fragen: info@edutime.ch',
      '',
      'Diese Nachricht wurde an alle Organisations-Admins gesendet.',
      '',
      'Freundliche Grüsse',
      '',
      'EduTime Team',
    ].join('\n'),
    html: `<p>Guten Tag</p>
<p>Die Nachfrist von <strong>45 Tagen</strong> nach Rechnungsfälligkeit für Ihre Organisation «${name}» ist heute abgelaufen und die Rechnung ist weiterhin unbezahlt. Im <strong>selben automatischen Abrechnungslauf</strong> wird Ihre Organisation <strong>jetzt deaktiviert</strong>; Organisationssitze und Lizenzen werden beendet.</p>
<p>Bitte begleichen Sie die offene Rechnung über die Lizenz- und Organisationsverwaltung. Nach erfolgreicher Zahlung können Sie die Organisation dort <strong>wieder aktivieren</strong> und den Zugang für Ihre Nutzer wiederherstellen.</p>
<p><a href="${managementUrl}">Zur Lizenz- und Organisationsverwaltung</a></p>
<p>Bitte antworten Sie nicht direkt auf diese E-Mail. Bei Fragen: <a href="mailto:info@edutime.ch">info@edutime.ch</a></p>
<p>Diese Nachricht wurde an alle Organisations-Admins gesendet.</p>
<p>Freundliche Grüsse</p>
<p>EduTime Team</p>`,
  }
}

/** Email when org subscription ends because cancel_at_period_end (no auto-renew). */
function buildOrgCanceledAtPeriodEndNoticeTemplate(
  locale: Locale,
  orgName: string,
  managementUrl: string,
): TemplateContent {
  const name = orgName.trim() || 'Organisation'

  if (locale === 'fr') {
    return {
      subject: `EduTime: fin de la licence organisation — ${name}`,
      text: [
        'Bonjour',
        '',
        `La période de votre licence d’organisation EduTime pour « ${name} » est terminée. Le renouvellement automatique était désactivé : l’abonnement est clos et les sièges organisation ne sont plus actifs.`,
        '',
        `Vous pouvez souscrire à nouveau une licence ou gérer l’organisation ici : ${managementUrl}`,
        '',
        'Merci de ne pas répondre directement à cet e-mail. Pour toute question : info@edutime.ch',
        '',
        'Ce message a été envoyé à tous les administrateurs de l’organisation.',
        '',
        'Equipe EduTime',
      ].join('\n'),
      html: `<p>Bonjour</p>
<p>La période de votre licence d’organisation EduTime pour « ${name} » est <strong>terminée</strong>. Le renouvellement automatique était désactivé : l’abonnement est clos et les sièges organisation ne sont plus actifs.</p>
<p>Vous pouvez souscrire à nouveau une licence ou gérer l’organisation ici : <a href="${managementUrl}">gestion de l’organisation</a>.</p>
<p>Merci de ne pas répondre directement à cet e-mail. Pour toute question : <a href="mailto:info@edutime.ch">info@edutime.ch</a></p>
<p>Ce message a été envoyé à tous les administrateurs de l’organisation.</p>
<p>Equipe EduTime</p>`,
    }
  }

  if (locale === 'en') {
    return {
      subject: `EduTime: organization license ended — ${name}`,
      text: [
        'Hello',
        '',
        `The billing period for your EduTime organization license for «${name}» has ended. Automatic renewal was turned off: the subscription has ended and organization seats are no longer active.`,
        '',
        `You can purchase a new license or manage the organization here: ${managementUrl}`,
        '',
        'Please do not reply to this email directly. For questions: info@edutime.ch',
        '',
        'This message was sent to all organization administrators.',
        '',
        'EduTime Team',
      ].join('\n'),
      html: `<p>Hello</p>
<p>The billing period for your EduTime organization license for «${name}» has <strong>ended</strong>. Automatic renewal was turned off: the subscription has ended and organization seats are no longer active.</p>
<p>You can purchase a new license or manage the organization here: <a href="${managementUrl}">organization management</a>.</p>
<p>Please do not reply to this email directly. For questions: <a href="mailto:info@edutime.ch">info@edutime.ch</a></p>
<p>This message was sent to all organization administrators.</p>
<p>EduTime Team</p>`,
    }
  }

  return {
    subject: `EduTime: Organisationslizenz beendet — ${name}`,
    text: [
      'Guten Tag',
      '',
      `Die Laufzeit Ihrer EduTime-Organisationslizenz für «${name}» ist zu Ende. Die automatische Verlängerung war deaktiviert: Das Abonnement ist beendet und die Organisationssitze sind nicht mehr aktiv.`,
      '',
      `Sie können eine neue Lizenz erwerben oder die Organisation hier verwalten: ${managementUrl}`,
      '',
      'Bitte antworten Sie nicht direkt auf diese E-Mail. Bei Fragen: info@edutime.ch',
      '',
      'Diese Nachricht wurde an alle Organisations-Admins gesendet.',
      '',
      'Freundliche Grüsse',
      '',
      'EduTime Team',
    ].join('\n'),
    html: `<p>Guten Tag</p>
<p>Die Laufzeit Ihrer EduTime-Organisationslizenz für «${name}» ist <strong>zu Ende</strong>. Die automatische Verlängerung war deaktiviert: Das Abonnement ist beendet und die Organisationssitze sind nicht mehr aktiv.</p>
<p>Sie können eine neue Lizenz erwerben oder die Organisation hier verwalten: <a href="${managementUrl}">Zur Lizenz- und Organisationsverwaltung</a>.</p>
<p>Bitte antworten Sie nicht direkt auf diese E-Mail. Bei Fragen: <a href="mailto:info@edutime.ch">info@edutime.ch</a></p>
<p>Diese Nachricht wurde an alle Organisations-Admins gesendet.</p>
<p>Freundliche Grüsse</p>
<p>EduTime Team</p>`,
  }
}

function parseCanceledAtPeriodEndOrgIds(summary: unknown): number[] {
  if (summary === null || typeof summary !== 'object') return []
  const raw = (summary as Record<string, unknown>).canceled_at_period_end_organization_ids
  if (!Array.isArray(raw)) return []
  const out: number[] = []
  for (const item of raw) {
    if (typeof item === 'number' && Number.isInteger(item)) {
      out.push(item)
    } else if (typeof item === 'string' && /^\d+$/.test(item)) {
      out.push(Number.parseInt(item, 10))
    }
  }
  return out
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
    const fromEmail = EDUTIME_TRANSACTIONAL_FROM
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
        const { data: blockingIds, error: blockingError } = await billing.rpc(
          'org_subscription_ids_with_latest_unpaid_invoice',
          { p_subscription_ids: subscriptionIds },
        )
        if (blockingError) {
          throw new Error(`Failed to resolve org renewal invoice guard: ${blockingError.message}`)
        }
        for (const id of blockingIds || []) {
          if (typeof id === 'string') {
            openInvoiceSubscriptions.add(id)
          }
        }
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

          const actorUserId = resolveActorUserId(subscription, admin.user_id)
          const adminUser = userById.get(actorUserId) ?? userById.get(admin.user_id)
          const adminEmail = adminEmailByUserId.get(actorUserId) ?? adminEmailByUserId.get(admin.user_id)
          const recipientEmail = resolveBillingRecipientEmail(subscription, adminEmail)
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
          const invoiceDueDaysAfterPeriodEnd = resolveOrgInvoiceDueDaysAfterPeriodEnd(subscription.metadata)
          const dueDate = new Date(
            Date.UTC(
              periodStart.getUTCFullYear(),
              periodStart.getUTCMonth(),
              periodStart.getUTCDate() + invoiceDueDaysAfterPeriodEnd,
            ),
          ).toISOString()
          const { error: createCheckoutError } = await billing.rpc('create_org_checkout', {
            p_actor_user_id: actorUserId,
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

          if (resendApiKey && recipientEmail) {
            try {
              const locale = detectLocale(adminUser?.language)
              const { data: orgRowForEmail } = await publicClient
                .from('organizations')
                .select('name')
                .eq('id', organizationId)
                .maybeSingle()
              const orgNameForEmail = (orgRowForEmail?.name as string | undefined)?.trim() || 'Organisation'
              const emailTemplate = buildCheckoutLinkTemplate(locale, gateway.checkoutUrl, {
                orgName: orgNameForEmail,
                amountCents,
                currency: subscription.currency || 'CHF',
                seatCount,
                paymentDueIso: dueDate,
              })
              await sendEmailWithResend(resendApiKey, fromEmail, recipientEmail, emailTemplate)
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
            } else if (!recipientEmail) {
              console.warn(
                `org-billing-jobs checkout-link email skipped: missing billing recipient email for organization ${organizationId}`,
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

    const canceledPeriodEndOrgIds = parseCanceledAtPeriodEndOrgIds(cancellationFinalizationSummary)
    let orgCancelPeriodEndEmailsSent = 0
    let orgCancelPeriodEndEmailsFailed = 0

    if (resendApiKey) {
      const managementUrlBase = `${appUrl}/app/organization-management`

      for (const orgId of canceledPeriodEndOrgIds) {
        if (!Number.isInteger(orgId) || orgId <= 0) continue

        const { data: orgRow } = await publicClient
          .from('organizations')
          .select('name')
          .eq('id', orgId)
          .maybeSingle()

        const orgName = (orgRow?.name as string | undefined)?.trim() || 'Organisation'

        const { data: adminRows, error: adminsError } = await publicClient
          .from('organization_administrators')
          .select('user_id')
          .eq('organization_id', orgId)
          .not('user_id', 'is', null)

        if (adminsError) {
          console.error(
            `org-billing-jobs: failed to load admins for org ${orgId} (cancel-at-period-end notice):`,
            adminsError.message,
          )
          continue
        }

        const managementUrl = `${managementUrlBase}?organizationId=${encodeURIComponent(String(orgId))}`
        const dedupeEmails = new Set<string>()

        for (const row of adminRows || []) {
          const userId = row.user_id as string
          if (!userId) continue

          const { data: profile } = await publicClient
            .from('users')
            .select('language')
            .eq('user_id', userId)
            .maybeSingle()

          const locale = detectLocale(profile?.language ?? null)

          const { data: authUserData, error: authUserError } = await publicClient.auth.admin.getUserById(userId)
          if (authUserError) {
            console.error(
              `org-billing-jobs: auth lookup failed for admin ${userId} (org ${orgId}):`,
              authUserError.message,
            )
            continue
          }

          const email = authUserData.user?.email?.trim()
          if (!email || !email.includes('@') || dedupeEmails.has(email.toLowerCase())) continue
          dedupeEmails.add(email.toLowerCase())

          const tpl = buildOrgCanceledAtPeriodEndNoticeTemplate(locale, orgName, managementUrl)
          try {
            await sendEmailWithResend(resendApiKey, fromEmail, email, tpl)
            orgCancelPeriodEndEmailsSent += 1
          } catch (error) {
            orgCancelPeriodEndEmailsFailed += 1
            console.error(
              `org-billing-jobs cancel-at-period-end email failed for org ${orgId} → ${email}:`,
              error instanceof Error ? error.message : error,
            )
          }
        }
      }
    } else if (canceledPeriodEndOrgIds.length > 0) {
      console.warn(
        'org-billing-jobs cancel-at-period-end notices skipped: RESEND_API_KEY is not configured',
      )
    }

    const { data: renewalReminderSweepResult, error: renewalReminderSweepError } = await billing.rpc(
      'run_org_renewal_reminder_sweep',
      { p_reference_time: nowIso },
    )
    if (renewalReminderSweepError) {
      throw new Error(`run_org_renewal_reminder_sweep failed: ${renewalReminderSweepError.message}`)
    }

    let renewalReminderEmailsSent = 0
    let renewalReminderEmailsFailed = 0

    if (resendApiKey) {
      const todayStr = nowIso.slice(0, 10)
      const { data: pendingReminders, error: pendingRemindersError } = await billing
        .from('org_renewal_reminders')
        .select('id, organization_id, recipient_email, recipient_user_id, reminder_type, scheduled_for')
        .eq('status', 'pending')
        .lte('scheduled_for', todayStr)
        .limit(200)

      if (pendingRemindersError) {
        throw new Error(`Failed to load org renewal reminders: ${pendingRemindersError.message}`)
      }

      const managementUrlBase = `${appUrl}/app/organization-management`

      for (const row of pendingReminders || []) {
        const reminderType = String(row.reminder_type)
        if (!isPaymentInvoiceNoticeType(reminderType)) {
          console.warn(`org-billing-jobs: unexpected reminder_type ${reminderType} for row ${row.id}, skipping`)
          continue
        }

        const recipientEmail = String(row.recipient_email || '').trim()
        if (!recipientEmail.includes('@')) continue

        let locale: Locale = 'de'
        if (row.recipient_user_id) {
          const { data: profile } = await publicClient
            .from('users')
            .select('language')
            .eq('user_id', row.recipient_user_id)
            .maybeSingle()
          locale = detectLocale(profile?.language ?? null)
        }

        const { data: orgRow } = await publicClient
          .from('organizations')
          .select('name')
          .eq('id', row.organization_id)
          .maybeSingle()

        const orgName = (orgRow?.name as string | undefined)?.trim() || 'Organization'
        const managementUrl = `${managementUrlBase}?organizationId=${encodeURIComponent(String(row.organization_id))}`

        try {
          const tpl = buildPaymentInvoiceNoticeTemplate(
            locale,
            reminderType,
            orgName,
            managementUrl,
          )
          await sendEmailWithResend(resendApiKey, fromEmail, recipientEmail, tpl)
          renewalReminderEmailsSent += 1
          await billing
            .from('org_renewal_reminders')
            .update({ status: 'sent', sent_at: nowIso, last_error: null })
            .eq('id', row.id)
        } catch (error) {
          renewalReminderEmailsFailed += 1
          const msg = error instanceof Error ? error.message : String(error)
          console.error(`org-billing-jobs renewal reminder email failed for ${row.id}:`, msg)
          await billing
            .from('org_renewal_reminders')
            .update({ status: 'failed', last_error: msg })
            .eq('id', row.id)
        }
      }
    }

    const { data: delinquencySummary, error: delinquencyError } = await billing.rpc(
      'run_org_delinquency_sweep',
      { p_reference_time: nowIso },
    )
    if (delinquencyError) {
      throw new Error(`run_org_delinquency_sweep failed: ${delinquencyError.message}`)
    }

    const { data: hardDelinquencySummary, error: hardDelinquencyError } = await billing.rpc(
      'run_org_hard_delinquency_sweep',
      { p_reference_time: nowIso },
    )
    if (hardDelinquencyError) {
      throw new Error(`run_org_hard_delinquency_sweep failed: ${hardDelinquencyError.message}`)
    }

    const { data: scheduledOrgPurgeSummary, error: scheduledOrgPurgeError } = await billing.rpc(
      'purge_organizations_past_scheduled_deletion',
      { p_reference_time: nowIso },
    )
    if (scheduledOrgPurgeError) {
      throw new Error(`purge_organizations_past_scheduled_deletion failed: ${scheduledOrgPurgeError.message}`)
    }

    return new Response(
      JSON.stringify({
        ok: true,
        renewalReminderSweepResult,
        delinquencySummary,
        hardDelinquencySummary,
        scheduledOrgPurgeSummary,
        cancellationFinalizationSummary,
        autoRenewCheckoutsCreated: autoRenewCreatedCount,
        autoRenewCheckoutsFailed: autoRenewFailedCount,
        checkoutLinkEmailsSent,
        checkoutLinkEmailsFailed,
        renewalReminderEmailsSent,
        renewalReminderEmailsFailed,
        orgCancelPeriodEndEmailsSent,
        orgCancelPeriodEndEmailsFailed,
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
