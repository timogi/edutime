import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { MantineProvider, useMantineColorScheme } from '@mantine/core'
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
import { AppLayout } from '@/components/AppLayout'

dayjs.extend(customParseFormat)
import { useSyncExternalStore, useEffect } from 'react'
import { GetStaticPropsContext } from 'next'
import Head from 'next/head'
import { isBenignNavigatorLockError } from '@/utils/auth/navigatorLockErrors'

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

function SystemColorSchemeOnly() {
  const { clearColorScheme } = useMantineColorScheme()
  useEffect(() => {
    clearColorScheme()
  }, [clearColorScheme])
  return null
}

export default function App(props: AppProps) {
  const router = useRouter()
  const isLoaded = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )

  const isAppRoute = router.pathname.startsWith('/app')

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isBenignNavigatorLockError(event.reason)) {
        event.preventDefault()
        return
      }
      console.error('Unhandled promise rejection:', event.reason)
      event.preventDefault()
    }

    const handleError = (event: ErrorEvent) => {
      if (isBenignNavigatorLockError(event.error)) {
        event.preventDefault()
        return
      }
      console.error('Global error:', event.error)
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
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
            defaultColorScheme='auto'
          >
            <SystemColorSchemeOnly />
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
