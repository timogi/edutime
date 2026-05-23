/**
 * Server-only: purchase confirmation after licence activation (Resend).
 */

export type PurchaseConfirmationLocale = 'de' | 'en' | 'fr'

const CONTACT_EMAIL = 'info@edutime.ch'
const EDUTIME_APP_LINK = 'https://edutime.ch/app'
const EDUTIME_ORG_MEMBERS_LINK = 'https://edutime.ch/app/members'

function getPurchaseConfirmationAppLink(isOrg: boolean): string {
  return isOrg ? EDUTIME_ORG_MEMBERS_LINK : EDUTIME_APP_LINK
}

function formatPeriodEnd(iso: string | null | undefined, locale: PurchaseConfirmationLocale): string | null {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  const localeTag = locale === 'de' ? 'de-CH' : locale === 'fr' ? 'fr-CH' : 'en-CH'
  return new Intl.DateTimeFormat(localeTag, { dateStyle: 'long' }).format(date)
}

const EMAIL_COPY: Record<
  PurchaseConfirmationLocale,
  {
    subject: (args: { orgName?: string | null }) => string
    greeting: string
    bodyActivated: (args: { orgName?: string | null; isOrg: boolean }) => string
    bodyRenewal: (periodEnd: string | null) => string
    bodyCancel: string
    ctaLabel: string
    footer: string
    replyHint: string
  }
> = {
  de: {
    subject: ({ orgName }) =>
      orgName ? `EduTime: Lizenz für «${orgName}» aktiviert` : 'EduTime: Deine Lizenz ist aktiv',
    greeting: 'Hallo',
    bodyActivated: ({ orgName, isOrg }) =>
      isOrg && orgName
        ? `Deine Zahlung war erfolgreich. Die Organisationslizenz für «${orgName}» ist jetzt aktiv.`
        : 'Deine Zahlung war erfolgreich. Deine EduTime-Jahreslizenz ist jetzt aktiv.',
    bodyRenewal: (periodEnd) =>
      periodEnd
        ? `Das Abonnement verlängert sich automatisch um ein weiteres Jahr, sofern du es nicht vor dem ${periodEnd} in den Kontoeinstellungen kündigst.`
        : 'Das Abonnement verlängert sich automatisch um jeweils ein weiteres Jahr, sofern du es nicht vor Ablauf der laufenden Periode in den Kontoeinstellungen kündigst.',
    bodyCancel:
      'Du kannst die automatische Verlängerung jederzeit vor Periodenende in der Lizenzverwaltung deaktivieren.',
    ctaLabel: 'Zur App',
    footer: 'Vielen Dank, dass du EduTime nutzt.',
    replyHint: `Bei Fragen erreichst du uns unter ${CONTACT_EMAIL}. Bitte antworte nicht direkt auf diese E-Mail.`,
  },
  en: {
    subject: ({ orgName }) =>
      orgName ? `EduTime: License for «${orgName}» activated` : 'EduTime: Your license is active',
    greeting: 'Hello',
    bodyActivated: ({ orgName, isOrg }) =>
      isOrg && orgName
        ? `Your payment was successful. The organization license for «${orgName}» is now active.`
        : 'Your payment was successful. Your EduTime annual license is now active.',
    bodyRenewal: (periodEnd) =>
      periodEnd
        ? `The subscription renews automatically for another year unless you cancel before ${periodEnd} in account settings.`
        : 'The subscription renews automatically each year unless you cancel before the end of the current period in account settings.',
    bodyCancel: 'You can turn off auto-renewal at any time before the period ends in license management.',
    ctaLabel: 'Open app',
    footer: 'Thank you for using EduTime.',
    replyHint: `If you have questions, contact us at ${CONTACT_EMAIL}. Please do not reply directly to this email.`,
  },
  fr: {
    subject: ({ orgName }) =>
      orgName
        ? `EduTime : licence pour « ${orgName} » activée`
        : 'EduTime : ta licence est active',
    greeting: 'Bonjour',
    bodyActivated: ({ orgName, isOrg }) =>
      isOrg && orgName
        ? `Ton paiement a réussi. La licence d'organisation pour « ${orgName} » est maintenant active.`
        : 'Ton paiement a réussi. Ta licence annuelle EduTime est maintenant active.',
    bodyRenewal: (periodEnd) =>
      periodEnd
        ? `L'abonnement se renouvelle automatiquement d'une année supplémentaire, sauf résiliation avant le ${periodEnd} dans les paramètres du compte.`
        : "L'abonnement se renouvelle automatiquement chaque année, sauf résiliation avant la fin de la période en cours dans les paramètres du compte.",
    bodyCancel:
      "Tu peux désactiver le renouvellement automatique à tout moment avant la fin de période dans la gestion de licence.",
    ctaLabel: "Ouvrir l'app",
    footer: "Merci d'utiliser EduTime.",
    replyHint: `Pour toute question, écris-nous à ${CONTACT_EMAIL}. Merci de ne pas répondre directement à ce message.`,
  },
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function resolvePurchaseConfirmationLocale(raw: string | null | undefined): PurchaseConfirmationLocale {
  const value = (raw || '').toLowerCase()
  if (value.startsWith('de')) return 'de'
  if (value.startsWith('fr')) return 'fr'
  return 'en'
}

export interface SendLicensePurchaseConfirmationEmailParams {
  resendApiKey: string
  fromEmail: string
  toEmail: string
  locale: PurchaseConfirmationLocale
  plan: 'annual' | 'org'
  organizationName?: string | null
  periodEnd?: string | null
  amountCents?: number
  quantity?: number
}

export async function sendLicensePurchaseConfirmationEmail(
  params: SendLicensePurchaseConfirmationEmailParams,
): Promise<void> {
  const {
    resendApiKey,
    fromEmail,
    toEmail,
    locale,
    plan,
    organizationName,
    periodEnd,
  } = params

  const isOrg = plan === 'org'
  const copy = EMAIL_COPY[locale]
  const periodEndLabel = formatPeriodEnd(periodEnd ?? null, locale)
  const appLink = getPurchaseConfirmationAppLink(isOrg)

  const subject = copy.subject({ orgName: organizationName })
  const activatedHtml = escapeHtml(copy.bodyActivated({ orgName: organizationName, isOrg }))
  const renewalHtml = escapeHtml(copy.bodyRenewal(periodEndLabel))
  const cancelHtml = escapeHtml(copy.bodyCancel)

  const html = `<!DOCTYPE html>
<html lang="${locale}">
<body style="margin:0;padding:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#f1f3f5;color:#212529;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:12px;padding:28px 24px;box-shadow:0 1px 3px rgba(0,0,0,.08);">
          <tr><td style="font-size:18px;font-weight:600;color:#845ef7;padding-bottom:8px;">EduTime</td></tr>
          <tr><td style="font-size:16px;line-height:1.55;color:#212529;">
            <p style="margin:0 0 12px 0;">${copy.greeting},</p>
            <p style="margin:0 0 12px 0;">${activatedHtml}</p>
            <p style="margin:0 0 12px 0;">${renewalHtml}</p>
            <p style="margin:0 0 20px 0;">${cancelHtml}</p>
            <p style="margin:24px 0 0 0;">
              <a href="${escapeHtml(appLink)}" style="display:inline-block;background:#845ef7;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;">${escapeHtml(copy.ctaLabel)}</a>
            </p>
            <p style="margin:20px 0 0 0;font-size:13px;color:#868e96;line-height:1.45;">${escapeHtml(copy.footer)}</p>
            <p style="margin:12px 0 0 0;font-size:13px;color:#868e96;line-height:1.45;">${escapeHtml(copy.replyHint)}</p>
          </td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const textLines = [
    `${copy.greeting},`,
    '',
    copy.bodyActivated({ orgName: organizationName, isOrg }),
    '',
    copy.bodyRenewal(periodEndLabel),
    '',
    copy.bodyCancel,
    '',
    `${copy.ctaLabel}: ${appLink}`,
    '',
    copy.footer,
    '',
    copy.replyHint,
  ]

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      subject,
      html,
      text: textLines.join('\n'),
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Resend API error (${response.status}): ${body}`)
  }
}

export type CheckoutConfirmationClaim = {
  claimed: boolean
  reason?: string
  email?: string
  locale?: string
  plan?: string
  organization_name?: string | null
  period_end?: string | null
  amount_cents?: number
  quantity?: number
}

function asClaim(raw: unknown): CheckoutConfirmationClaim | null {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return null
  return raw as CheckoutConfirmationClaim
}

export async function sendPurchaseConfirmationEmailForReference(
  referenceId: string,
  preClaimed?: CheckoutConfirmationClaim | null,
): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.BILLING_FROM_EMAIL

  if (!resendApiKey || !fromEmail) {
    console.warn('Purchase confirmation email skipped: RESEND_API_KEY or BILLING_FROM_EMAIL missing')
    return false
  }

  let claim = preClaimed ?? null

  if (!claim) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      console.warn('Purchase confirmation email skipped: missing Supabase service role config')
      return false
    }

    const { createClient } = await import('@supabase/supabase-js')
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      db: { schema: 'billing' },
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const { data: claimRaw, error: claimError } = await admin.rpc(
      'claim_checkout_purchase_confirmation_email',
      { p_reference_id: referenceId },
    )

    if (claimError) {
      console.error('Failed to claim purchase confirmation email:', claimError)
      return false
    }

    claim = asClaim(claimRaw)
  }

  if (!claim?.claimed || !claim.email) {
    return false
  }

  const plan = claim.plan === 'org' ? 'org' : 'annual'

  await sendLicensePurchaseConfirmationEmail({
    resendApiKey,
    fromEmail,
    toEmail: claim.email,
    locale: resolvePurchaseConfirmationLocale(claim.locale),
    plan,
    organizationName: claim.organization_name,
    periodEnd: claim.period_end,
    amountCents: claim.amount_cents,
    quantity: claim.quantity,
  })

  return true
}
