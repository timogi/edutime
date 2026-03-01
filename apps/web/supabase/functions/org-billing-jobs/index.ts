import { createClient } from 'npm:@supabase/supabase-js@2'

type ReminderType = 'days_30' | 'days_7' | 'renewal_day'

type ReminderRow = {
  id: string
  recipient_email: string
  recipient_user_id: string | null
  reminder_type: ReminderType
  organization_id: number
  subscription_id: string
  scheduled_for: string
}

type Locale = 'de' | 'en' | 'fr'

type TemplateContent = {
  subject: string
  text: string
  html: string
}

function env(name: string, fallback?: string): string {
  const value = Deno.env.get(name) ?? fallback
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

function detectLocale(raw: string | null | undefined): Locale {
  if (!raw) return 'de'
  const normalized = raw.toLowerCase()
  if (normalized.startsWith('fr')) return 'fr'
  if (normalized.startsWith('en')) return 'en'
  return 'de'
}

function buildTemplate(
  locale: Locale,
  reminderType: ReminderType,
  appUrl: string,
  organizationId: number,
): TemplateContent {
  const billingUrl = `${appUrl}/app/settings/license-management?organizationId=${organizationId}`

  if (locale === 'fr') {
    const whenLabel =
      reminderType === 'days_30'
        ? 'dans 30 jours'
        : reminderType === 'days_7'
          ? 'dans 7 jours'
          : "aujourd'hui"
    return {
      subject: 'EduTime: renouvellement de licence organisation',
      text: `Bonjour,\n\nLa licence de votre organisation EduTime arrive a renouvellement ${whenLabel}. Merci de continuer la licence pour eviter une suspension de service.\n\nOuvrir la gestion des licences: ${billingUrl}\n\nEquipe EduTime`,
      html: `<p>Bonjour,</p><p>La licence de votre organisation EduTime arrive a renouvellement <strong>${whenLabel}</strong>. Merci de continuer la licence pour eviter une suspension de service.</p><p><a href="${billingUrl}">Ouvrir la gestion des licences</a></p><p>Equipe EduTime</p>`,
    }
  }

  if (locale === 'en') {
    const whenLabel =
      reminderType === 'days_30'
        ? 'in 30 days'
        : reminderType === 'days_7'
          ? 'in 7 days'
          : 'today'
    return {
      subject: 'EduTime: organization license renewal',
      text: `Hello,\n\nYour EduTime organization license is due for renewal ${whenLabel}. Please continue the license to avoid service suspension.\n\nOpen license management: ${billingUrl}\n\nEduTime Team`,
      html: `<p>Hello,</p><p>Your EduTime organization license is due for renewal <strong>${whenLabel}</strong>. Please continue the license to avoid service suspension.</p><p><a href="${billingUrl}">Open license management</a></p><p>EduTime Team</p>`,
    }
  }

  const whenLabel =
    reminderType === 'days_30'
      ? 'in 30 Tagen'
      : reminderType === 'days_7'
        ? 'in 7 Tagen'
        : 'heute'
  return {
    subject: 'EduTime: Erneuerung der Organisationslizenz',
    text: `Hallo,\n\nDie EduTime-Organisationslizenz muss ${whenLabel} erneuert werden. Bitte fuehre die Verlaengerung durch, damit es nicht zu einer Sperrung kommt.\n\nZur Lizenzverwaltung: ${billingUrl}\n\nEduTime Team`,
    html: `<p>Hallo,</p><p>Die EduTime-Organisationslizenz muss <strong>${whenLabel}</strong> erneuert werden. Bitte fuehre die Verlaengerung durch, damit es nicht zu einer Sperrung kommt.</p><p><a href="${billingUrl}">Zur Lizenzverwaltung</a></p><p>EduTime Team</p>`,
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

Deno.serve(async (req) => {
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
    const fromEmail = Deno.env.get('BILLING_FROM_EMAIL') || 'EduTime <billing@edutime.ch>'
    const appUrl = Deno.env.get('NEXT_PUBLIC_APP_URL') || Deno.env.get('APP_URL') || 'https://edutime.ch'
    const nowIso = new Date().toISOString()
    const todayIso = nowIso.slice(0, 10)

    const billing = createClient(supabaseUrl, serviceRoleKey, {
      db: { schema: 'billing' },
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const publicClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: delinquencySummary, error: delinquencyError } = await billing.rpc(
      'run_org_delinquency_sweep',
      { p_reference_time: nowIso },
    )
    if (delinquencyError) {
      throw new Error(`run_org_delinquency_sweep failed: ${delinquencyError.message}`)
    }

    const { data: reminderScheduleSummary, error: reminderScheduleError } = await billing.rpc(
      'run_org_renewal_reminder_sweep',
      { p_reference_time: nowIso },
    )
    if (reminderScheduleError) {
      throw new Error(`run_org_renewal_reminder_sweep failed: ${reminderScheduleError.message}`)
    }

    const { data: pendingReminders, error: pendingError } = await billing
      .from('org_renewal_reminders')
      .select(
        'id, recipient_email, recipient_user_id, reminder_type, organization_id, subscription_id, scheduled_for',
      )
      .eq('status', 'pending')
      .lte('scheduled_for', todayIso)
      .order('scheduled_for', { ascending: true })
      .limit(100)

    if (pendingError) {
      throw new Error(`Failed to fetch pending reminders: ${pendingError.message}`)
    }

    const reminders = (pendingReminders || []) as ReminderRow[]
    let sentCount = 0
    let failedCount = 0

    const userIds = Array.from(
      new Set(reminders.map((row) => row.recipient_user_id).filter((value): value is string => !!value)),
    )
    const localeMap = new Map<string, Locale>()

    if (userIds.length > 0) {
      const { data: users, error: usersError } = await publicClient
        .from('users')
        .select('user_id, language')
        .in('user_id', userIds)

      if (usersError) {
        throw new Error(`Failed to fetch user locales: ${usersError.message}`)
      }

      for (const row of users || []) {
        localeMap.set(row.user_id, detectLocale(row.language))
      }
    }

    for (const reminder of reminders) {
      try {
        if (!resendApiKey) {
          throw new Error('RESEND_API_KEY is not configured')
        }

        const locale = reminder.recipient_user_id
          ? localeMap.get(reminder.recipient_user_id) || 'de'
          : 'de'
        const content = buildTemplate(
          locale,
          reminder.reminder_type,
          appUrl,
          reminder.organization_id,
        )

        await sendEmailWithResend(resendApiKey, fromEmail, reminder.recipient_email, content)

        const { error: markSentError } = await billing
          .from('org_renewal_reminders')
          .update({
            status: 'sent',
            sent_at: nowIso,
            last_error: null,
          })
          .eq('id', reminder.id)

        if (markSentError) {
          throw new Error(`Failed to mark reminder sent: ${markSentError.message}`)
        }

        sentCount += 1
      } catch (error) {
        failedCount += 1
        const message = error instanceof Error ? error.message : 'Unknown reminder send error'

        const { error: markFailedError } = await billing
          .from('org_renewal_reminders')
          .update({
            status: 'failed',
            last_error: message,
          })
          .eq('id', reminder.id)

        if (markFailedError) {
          console.error('Failed to mark reminder failed:', markFailedError)
        }
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        delinquencySummary,
        reminderScheduleSummary,
        pendingReminders: reminders.length,
        remindersSent: sentCount,
        remindersFailed: failedCount,
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
