import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { MantineProvider } from '@mantine/core'
import { useRouter } from 'next/router'
import { NextIntlClientProvider } from 'next-intl'
import { Notifications } from '@mantine/notifications'
import { DatesProvider } from '@mantine/dates'
import 'dayjs/locale/de'
import '@mantine/dates/styles.css'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import UserProvider from '@/contexts/UserProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { supabase } from '@/utils/supabase/client'
import { AppLayout } from '@/components/AppLayout'

dayjs.extend(customParseFormat)
import { useSyncExternalStore, useEffect } from 'react'
import { GetStaticPropsContext } from 'next'
import Head from 'next/head'

// Create a client for React Query with sensible defaults
// Removed networkMode: 'online' as it prevents queries when browser reports offline during tab switches
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // Consider data stale after 1 minute
      gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
      refetchOnWindowFocus: true, // Refetch when window regains focus
      refetchOnReconnect: true, // Refetch when network reconnects
      retry: 2, // Retry failed requests
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
})

const emptySubscribe = () => () => {}

export default function App(props: AppProps) {
  const router = useRouter()
  const isLoaded = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )

  const isAppRoute = router.pathname.startsWith('/app')

  useEffect(() => {
    // Global error handler for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
      // Prevent the default behavior which logs to console
      event.preventDefault()
    }

    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error)
    }

    // Handle visibility changes to refresh Supabase session when tab becomes visible
    // Use setTimeout to avoid async calls directly in event handler
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Use setTimeout to defer async operations and avoid potential deadlocks
        setTimeout(async () => {
          try {
            const {
              data: { session },
              error,
            } = await supabase.auth.getSession()
            if (error) {
              // Session check error - silently handle
              return
            }
            if (session) {
              // Refresh session to ensure it's still valid
              await supabase.auth.refreshSession()
            }
          } catch (error) {
            // Silently handle visibility change errors
          }
        }, 0)
      }
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const page = <props.Component {...props.pageProps} />

  return (
    <>
      <Head>
        {/* Ensure critical styles are loaded early */}
        <style>{`
          body {
            opacity: ${isLoaded ? 1 : 0};
            transition: opacity 0.2s ease-in-out;
          }
        `}</style>
      </Head>
      <NextIntlClientProvider
        locale={router.locale}
        messages={props.pageProps.messages}
        timeZone='Europe/Vienna'
      >
        <QueryClientProvider client={queryClient}>
          <MantineProvider
            theme={{
              primaryColor: 'violet',
            }}
            defaultColorScheme='light'
          >
            <DatesProvider settings={{ locale: 'de' }}>
              <UserProvider>
                <Notifications position='top-right' zIndex={1000} />
                {isAppRoute ? <AppLayout>{page}</AppLayout> : page}
              </UserProvider>
            </DatesProvider>
          </MantineProvider>
        </QueryClientProvider>
      </NextIntlClientProvider>
    </>
  )
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../messages/${locale}.json`)).default,
    },
  }
}
