import * as Sentry from '@sentry/nextjs'

// Import server config when running in nodejs runtime
if (process.env.NEXT_RUNTIME === 'nodejs') {
  import('../sentry.server.config').catch(() => {
    // Fallback: initialize directly if import fails
    Sentry.init({
      dsn: 'https://e8004295d908c58cfcd3ac64d6ea00d4@o4508315694727168.ingest.de.sentry.io/4508315696431184',
      tracesSampleRate: 1,
      debug: false,
    })
  })
}

// Import edge config when running in edge runtime
if (process.env.NEXT_RUNTIME === 'edge') {
  import('../sentry.edge.config').catch(() => {
    // Fallback: initialize directly if import fails
    Sentry.init({
      dsn: 'https://e8004295d908c58cfcd3ac64d6ea00d4@o4508315694727168.ingest.de.sentry.io/4508315696431184',
      tracesSampleRate: 1,
      debug: false,
    })
  })
}

export async function register() {
  // Registration happens via side effects above
}

export const onRequestError = Sentry.captureRequestError
