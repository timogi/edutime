/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // output: 'export',
  // distDir: '_static',
  images: {
    unoptimized: true,
  },
  compiler: {
    styledComponents: true,
  },
  i18n: {
    locales: ['en', 'de', 'fr'],
    defaultLocale: 'de',
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.edutime.ch' }],
        destination: 'https://edutime.ch/:path*',
        permanent: true,
      },
      {
        source: '/privacy',
        destination: '/docs/privacy',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/js/script.js',
        destination: 'https://plausible.io/js/script.js',
      },
      {
        source: '/api/event',
        destination: 'https://plausible.io/api/event',
      },
    ]
  },
}

module.exports = nextConfig

// Injected content via Sentry wizard below

const { withSentryConfig } = require('@sentry/nextjs')

module.exports = withSentryConfig(module.exports, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: 'edutime',
  project: 'edutime-website',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: '/monitoring',

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Webpack-only Sentry build options (see @sentry/nextjs SentryBuildOptions.webpack)
  webpack: {
    // Automatically tree-shake Sentry SDK logger statements (replaces deprecated disableLogger)
    treeshake: {
      removeDebugLogging: true,
    },
    // Automatically annotate React components for breadcrumbs / session replay (replaces top-level option)
    reactComponentAnnotation: {
      enabled: true,
    },
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // https://docs.sentry.io/product/crons/ · https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
  },

  // Source map configuration
  sourcemaps: {
    // Automatically delete source maps after uploading to Sentry
    // This prevents them from being served to users while still allowing Sentry to use them for error tracking
    deleteSourcemapsAfterUpload: true,
  },
})
