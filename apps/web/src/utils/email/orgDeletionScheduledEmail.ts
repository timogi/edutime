/**
 * Server-only: informational email when an organization deletion is initiated (scheduled purge).
 */

import { type OrgMemberInviteEmailLocale } from '@/utils/email/orgMemberInviteEmail'

export type { OrgMemberInviteEmailLocale }

const CONTACT_EMAIL = 'info@edutime.ch'

const EMAIL_COPY: Record<
  OrgMemberInviteEmailLocale,
  {
    subject: (orgName: string) => string
    greeting: string
    intro: (orgName: string) => string
    licensesAndAccess: string
    purgeTimeline: string
    thanks: string
    questions: string
    noReply: string
    signoff: string
  }
> = {
  de: {
    subject: (orgName) => `EduTime: Löschung der Organisation «${orgName}» veranlasst`,
    greeting: 'Guten Tag',
    intro: (orgName) =>
      `die Löschung Ihrer Organisation «${orgName}» auf EduTime wurde in Auftrag gegeben.`,
    licensesAndAccess:
      'Die Organisationslizenzen wurden deaktiviert und der Zugang für Mitglieder ist geschlossen.',
    purgeTimeline:
      'Die Organisation und die zugehörigen Daten werden frühestens 30 Tage nach diesem Zeitpunkt vollständig gelöscht.',
    thanks:
      'Vielen Dank, dass Sie EduTime genutzt haben — schade, dass Sie gehen.',
    questions: `Bei Fragen erreichen Sie uns unter ${CONTACT_EMAIL}.`,
    noReply: 'Bitte antworten Sie nicht direkt auf diese E-Mail.',
    signoff: 'Freundliche Grüsse\nDas EduTime-Team',
  },
  en: {
    subject: (orgName) => `EduTime: Deletion of organization «${orgName}» has been initiated`,
    greeting: 'Hello',
    intro: (orgName) =>
      `The deletion of your organization «${orgName}» on EduTime has been requested.`,
    licensesAndAccess:
      'Organization licenses have been deactivated and member access has been closed.',
    purgeTimeline:
      'The organization and related data will be permanently removed no sooner than 30 days from now.',
    thanks: 'Thank you for using EduTime — we are sorry to see you go.',
    questions: `If you have questions, please contact us at ${CONTACT_EMAIL}.`,
    noReply: 'Please do not reply directly to this email.',
    signoff: 'Kind regards\nThe EduTime team',
  },
  fr: {
    subject: (orgName) => `EduTime : suppression de l’organisation « ${orgName} » lancée`,
    greeting: 'Bonjour',
    intro: (orgName) =>
      `la suppression de votre organisation « ${orgName} » sur EduTime a été demandée.`,
    licensesAndAccess:
      'Les licences d’organisation ont été désactivées et l’accès des membres est fermé.',
    purgeTimeline:
      'L’organisation et les données associées seront supprimées définitivement au plus tôt 30 jours après la présente date.',
    thanks:
      'Merci d’avoir utilisé EduTime — nous regrettons de vous voir partir.',
    questions: `Pour toute question, écrivez-nous à ${CONTACT_EMAIL}.`,
    noReply: 'Merci de ne pas répondre directement à ce message.',
    signoff: 'Cordialement\nL’équipe EduTime',
  },
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function normalizeUserLanguageToEmailLocale(
  language: string | null | undefined,
): OrgMemberInviteEmailLocale {
  const raw = (language || '').toLowerCase().trim()
  if (raw.startsWith('de')) return 'de'
  if (raw.startsWith('fr')) return 'fr'
  return 'en'
}

export interface SendOrgDeletionScheduledEmailParams {
  resendApiKey: string
  fromEmail: string
  toEmail: string
  organizationName: string
  locale: OrgMemberInviteEmailLocale
}

export async function sendOrgDeletionScheduledEmail(
  params: SendOrgDeletionScheduledEmailParams,
): Promise<void> {
  const { resendApiKey, fromEmail, toEmail, organizationName, locale } = params
  const copy = EMAIL_COPY[locale]
  const safeName = escapeHtml(organizationName)
  const subject = copy.subject(organizationName)

  const paragraphsHtml = [
    `<p>${copy.greeting},</p>`,
    `<p>${escapeHtml(copy.intro(organizationName))}</p>`,
    `<p>${escapeHtml(copy.licensesAndAccess)}</p>`,
    `<p>${escapeHtml(copy.purgeTimeline)}</p>`,
    `<p>${escapeHtml(copy.thanks)}</p>`,
    `<p>${escapeHtml(copy.questions)} ${escapeHtml(copy.noReply)}</p>`,
    `<p>${copy.signoff.split('\n').map((line) => escapeHtml(line)).join('<br/>')}</p>`,
  ].join('')

  const html = `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#111">${paragraphsHtml}</body></html>`

  const textLines = [
    `${copy.greeting},`,
    '',
    copy.intro(organizationName),
    '',
    copy.licensesAndAccess,
    '',
    copy.purgeTimeline,
    '',
    copy.thanks,
    '',
    `${copy.questions} ${copy.noReply}`,
    '',
    copy.signoff,
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
