export interface SubProcessorRow {
  company: string
  address: string
  processingLocation: string
  serviceType: string
}

/** Sub-processors aligned with the privacy policy (section 12.5) plus Sentry (error monitoring). */
export const subProcessorsDe: SubProcessorRow[] = [
  {
    company: 'Supabase, Inc.',
    address: '970 Toa Payoh North #07-04, Singapore 318992',
    processingLocation: 'Deutschland (Frankfurt, DE)',
    serviceType: 'Hosting, Datenbank, Authentifizierung',
  },
  {
    company: 'DigitalOcean, LLC',
    address: '101 6th Ave, New York, NY 10013, USA',
    processingLocation: 'Deutschland (Frankfurt, DE)',
    serviceType: 'Hosting, Webserver',
  },
  {
    company: 'Cloudflare, Inc.',
    address: '101 Townsend Street, San Francisco, CA 94107, USA',
    processingLocation: 'USA / global (CDN, Bot-Schutz)',
    serviceType: 'Webservices, CDN, Bot-Erkennung',
  },
  {
    company: 'Plausible Insights OÜ',
    address: 'Västriku tn 2, 50403, Tartu, Estland',
    processingLocation: 'EU (Estland)',
    serviceType: 'Web-Analyse',
  },
  {
    company: 'Payrexx AG',
    address: 'Burgstrasse 20, 3600 Thun, Schweiz',
    processingLocation: 'Schweiz',
    serviceType: 'Zahlungsabwicklung',
  },
  {
    company: 'Plus Five Five, Inc. (Resend)',
    address: '2261 Market Street #5039, San Francisco, CA 94114, USA',
    processingLocation: 'USA / ggf. EU',
    serviceType: 'Transaktions-E-Mails',
  },
  {
    company: 'Functional Software, Inc. d/b/a Sentry',
    address: '45 Fremont Street, 8th Floor, San Francisco, CA 94105, USA',
    processingLocation: 'USA / EU',
    serviceType: 'Fehlerüberwachung, Anwendungsmonitoring',
  },
]

export const subProcessorsEn: SubProcessorRow[] = [
  {
    company: 'Supabase, Inc.',
    address: '970 Toa Payoh North #07-04, Singapore 318992',
    processingLocation: 'Germany (Frankfurt, DE)',
    serviceType: 'Hosting, database, authentication',
  },
  {
    company: 'DigitalOcean, LLC',
    address: '101 6th Ave, New York, NY 10013, USA',
    processingLocation: 'Germany (Frankfurt, DE)',
    serviceType: 'Hosting, web server',
  },
  {
    company: 'Cloudflare, Inc.',
    address: '101 Townsend Street, San Francisco, CA 94107, USA',
    processingLocation: 'USA / global (CDN, bot protection)',
    serviceType: 'Web services, CDN, bot detection',
  },
  {
    company: 'Plausible Insights OÜ',
    address: 'Västriku tn 2, 50403, Tartu, Estonia',
    processingLocation: 'EU (Estonia)',
    serviceType: 'Web analytics',
  },
  {
    company: 'Payrexx AG',
    address: 'Burgstrasse 20, 3600 Thun, Switzerland',
    processingLocation: 'Switzerland',
    serviceType: 'Payment processing',
  },
  {
    company: 'Plus Five Five, Inc. (Resend)',
    address: '2261 Market Street #5039, San Francisco, CA 94114, USA',
    processingLocation: 'USA / possibly EU',
    serviceType: 'Transactional email',
  },
  {
    company: 'Functional Software, Inc. d/b/a Sentry',
    address: '45 Fremont Street, 8th Floor, San Francisco, CA 94105, USA',
    processingLocation: 'USA / EU',
    serviceType: 'Error monitoring, application monitoring',
  },
]

export const subProcessorsFr: SubProcessorRow[] = [
  {
    company: 'Supabase, Inc.',
    address: '970 Toa Payoh North #07-04, Singapore 318992',
    processingLocation: 'Allemagne (Francfort, DE)',
    serviceType: 'Hebergement, base de donnees, authentification',
  },
  {
    company: 'DigitalOcean, LLC',
    address: '101 6th Ave, New York, NY 10013, USA',
    processingLocation: 'Allemagne (Francfort, DE)',
    serviceType: 'Hebergement, serveur web',
  },
  {
    company: 'Cloudflare, Inc.',
    address: '101 Townsend Street, San Francisco, CA 94107, USA',
    processingLocation: 'USA / mondial (CDN, protection anti-bots)',
    serviceType: 'Services web, CDN, detection de bots',
  },
  {
    company: 'Plausible Insights OÜ',
    address: 'Västriku tn 2, 50403, Tartu, Estonie',
    processingLocation: 'UE (Estonie)',
    serviceType: 'Analyse web',
  },
  {
    company: 'Payrexx AG',
    address: 'Burgstrasse 20, 3600 Thun, Suisse',
    processingLocation: 'Suisse',
    serviceType: 'Traitement des paiements',
  },
  {
    company: 'Plus Five Five, Inc. (Resend)',
    address: '2261 Market Street #5039, San Francisco, CA 94114, USA',
    processingLocation: 'USA / eventuellement UE',
    serviceType: 'E-mails transactionnels',
  },
  {
    company: 'Functional Software, Inc. d/b/a Sentry',
    address: '45 Fremont Street, 8th Floor, San Francisco, CA 94105, USA',
    processingLocation: 'USA / UE',
    serviceType: 'Surveillance des erreurs, monitoring applicatif',
  },
]
