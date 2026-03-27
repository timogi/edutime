/**
 * Server-only: sends organization member invite emails via Resend.
 */

export type OrgMemberInviteEmailLocale = 'de' | 'en' | 'fr'

const CONTACT_EMAIL = 'info@edutime.ch'

const EMAIL_COPY: Record<
  OrgMemberInviteEmailLocale,
  {
    subject: (orgName: string) => string
    greeting: string
    bodyIntro: (args: { orgName: string }) => string
    bodySignIn: (inviteeEmail: string) => string
    ctaLabel: string
    footer: string
    replyHint: string
  }
> = {
  de: {
    subject: (orgName) => `Einladung zu ${orgName} auf EduTime`,
    greeting: 'Hallo',
    bodyIntro: ({ orgName }) =>
      `Du wurdest eingeladen, der Organisation «${orgName}» auf EduTime beizutreten und eine Organisationslizenz zu nutzen.`,
    bodySignIn: (inviteeEmail) =>
      `Melde dich mit derselben E-Mail-Adresse (${inviteeEmail}) bei EduTime an und nimm die Einladung unter Konto an.`,
    ctaLabel: 'Zu EduTime',
    footer:
      'Wenn du diese Einladung nicht erwartet hast, kannst du diese E-Mail ignorieren.',
    replyHint: `Bitte antworte nicht direkt auf diese E-Mail. Bei Fragen erreichst du uns unter ${CONTACT_EMAIL}.`,
  },
  en: {
    subject: (orgName) => `You’re invited to ${orgName} on EduTime`,
    greeting: 'Hello',
    bodyIntro: ({ orgName }) =>
      `You were invited to join «${orgName}» on EduTime and use an organization license.`,
    bodySignIn: (inviteeEmail) =>
      `Sign in to EduTime with the same email address (${inviteeEmail}) and accept the invitation under Account.`,
    ctaLabel: 'Open EduTime',
    footer: 'If you did not expect this invitation, you can ignore this email.',
    replyHint: `Please do not reply directly to this email. For questions, contact us at ${CONTACT_EMAIL}.`,
  },
  fr: {
    subject: (orgName) => `Invitation à rejoindre ${orgName} sur EduTime`,
    greeting: 'Bonjour',
    bodyIntro: ({ orgName }) =>
      `Tu as été invité(e) à rejoindre l’organisation « ${orgName} » sur EduTime et à utiliser une licence d’organisation.`,
    bodySignIn: (inviteeEmail) =>
      `Connecte-toi à EduTime avec la même adresse e-mail (${inviteeEmail}) et accepte l’invitation sous Compte.`,
    ctaLabel: 'Ouvrir EduTime',
    footer:
      'Si tu n’attendais pas cette invitation, tu peux ignorer ce message.',
    replyHint: `Merci de ne pas répondre directement à ce message. Pour toute question, écris-nous à ${CONTACT_EMAIL}.`,
  },
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function resolveOrgInviteEmailLocale(
  acceptLanguageHeader: string | undefined,
): OrgMemberInviteEmailLocale {
  const raw = (acceptLanguageHeader || '').toLowerCase()
  if (raw.startsWith('de')) return 'de'
  if (raw.startsWith('fr')) return 'fr'
  return 'en'
}

export interface SendOrgMemberInviteEmailParams {
  resendApiKey: string
  fromEmail: string
  toEmail: string
  organizationName: string
  inviteeEmail: string
  acceptUrl: string
  locale: OrgMemberInviteEmailLocale
}

export async function sendOrgMemberInviteEmail(params: SendOrgMemberInviteEmailParams): Promise<void> {
  const { resendApiKey, fromEmail, toEmail, organizationName, inviteeEmail, acceptUrl, locale } = params

  const copy = EMAIL_COPY[locale]
  const safeInvitee = escapeHtml(inviteeEmail)
  const subject = copy.subject(organizationName)

  const introHtml = escapeHtml(
    copy.bodyIntro({
      orgName: organizationName,
    }),
  )
  const signInHtml = escapeHtml(copy.bodySignIn(inviteeEmail))
  const replyHintHtml = escapeHtml(copy.replyHint)

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
            <p style="margin:0 0 12px 0;">${introHtml}</p>
            <p style="margin:0 0 20px 0;">${signInHtml}</p>
            <p style="margin:24px 0 0 0;">
              <a href="${escapeHtml(acceptUrl)}" style="display:inline-block;background:#845ef7;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;">${escapeHtml(copy.ctaLabel)}</a>
            </p>
            <p style="margin:20px 0 0 0;font-size:13px;color:#868e96;line-height:1.45;">${escapeHtml(copy.footer)}</p>
            <p style="margin:12px 0 0 0;font-size:13px;color:#868e96;line-height:1.45;">${replyHintHtml}</p>
          </td></tr>
        </table>
        <p style="margin:16px 0 0 0;font-size:12px;color:#868e96;">${safeInvitee}</p>
      </td>
    </tr>
  </table>
</body>
</html>`

  const textLines = [
    `${copy.greeting},`,
    '',
    copy.bodyIntro({ orgName: organizationName }),
    '',
    copy.bodySignIn(inviteeEmail),
    '',
    `${copy.ctaLabel}: ${acceptUrl}`,
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
      text: textLines.join('\n'),
      html,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Resend API error (${response.status}): ${body}`)
  }
}
