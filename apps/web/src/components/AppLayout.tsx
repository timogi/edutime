import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import { AppShell, Center, Loader } from '@mantine/core'
import { AppNavbar } from '@/components/Navbar'
import { Header } from '@/components/Header/Header'
import { LoadingScreen } from '@/components/LoadingScreen'
import { LegalGate } from '@/components/LegalGate'
import { useUser } from '@/contexts/UserProvider'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import classes from '../pages/app/index.module.css'

export const HEADER_HEIGHT = 60

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isLoading, isInitialized, user, categories, hasActiveSubscription, organizations } =
    useUser()
  const [opened, setOpened] = useState(false)
  const router = useRouter()
  const t = useTranslations('Index')

  // Derive the current view from the URL path
  const currentView = router.pathname.replace('/app/', '').replace('/app', '') || 'time-tracking'

  // Close mobile nav when view changes
  const [prevView, setPrevView] = useState(currentView)
  if (prevView !== currentView) {
    setPrevView(currentView)
    if (opened) setOpened(false)
  }

  // Get page title based on current view
  const getPageTitle = () => {
    const titleKey = `page-title-${currentView}`
    const pageTitle = t(titleKey as any)
    return pageTitle ? `EduTime - ${pageTitle}` : 'EduTime'
  }

  // Redirect to /app/no-license if user doesn't have an active subscription
  useEffect(() => {
    if (isInitialized && user && !hasActiveSubscription && router.pathname !== '/app/no-license') {
      router.replace('/app/no-license')
    }
  }, [isInitialized, user, hasActiveSubscription, router])

  // Redirect to app if user has active subscription and is on /app/no-license
  useEffect(() => {
    if (isInitialized && user && hasActiveSubscription && router.pathname === '/app/no-license') {
      router.replace('/app/time-tracking')
    }
  }, [isInitialized, user, hasActiveSubscription, router])

  // Before initialization completes we have no user data for the shell
  if (!isInitialized) {
    return <LoadingScreen />
  }

  // No authenticated user — UserProvider is redirecting to /login
  if (!user) {
    return <LoadingScreen />
  }

  // ── From here on the AppShell is ALWAYS rendered ──
  // All other loading / redirect states use an inline loader inside the
  // content area so the header + sidebar stay visible.

  const showSidebar = router.pathname !== '/app/no-license'

  const renderContent = () => {
    // Subscription redirect in progress — keep shell, show inline loader
    if (!hasActiveSubscription && router.pathname !== '/app/no-license') {
      return (
        <Center h='100%'>
          <Loader size='lg' />
        </Center>
      )
    }

    // Categories still loading on very first load (rare after init)
    if (isLoading && (!categories || categories.length === 0)) {
      return (
        <Center h='100%'>
          <Loader size='lg' />
        </Center>
      )
    }

    return children
  }

  return (
    <LegalGate>
      <Head>
        <title>{getPageTitle()}</title>
        <meta name='apple-itunes-app' />
      </Head>
      <AppShell
        navbar={
          showSidebar
            ? {
                width: { md: 300 },
                breakpoint: 'md',
                collapsed: { mobile: !opened },
              }
            : undefined
        }
        header={{
          height: HEADER_HEIGHT,
        }}
        padding={0}
      >
        <AppShell.Header>
          <Header opened={opened} setOpened={setOpened} />
        </AppShell.Header>
        {showSidebar && (
          <AppShell.Navbar>
            <AppNavbar
              currentView={currentView}
              subscriptionActive={hasActiveSubscription}
              loaded={isInitialized}
              userData={user}
              organizations={organizations}
            />
          </AppShell.Navbar>
        )}
        <AppShell.Main className={classes.wrapper}>{renderContent()}</AppShell.Main>
      </AppShell>
    </LegalGate>
  )
}
