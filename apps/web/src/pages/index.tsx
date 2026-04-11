import { Footer } from '@/components/Footer/Footer'
import { ContactHero } from '@/components/Main/Contact'
import { CookieDialog } from '@/components/Main/CookieDialog'
import { AppPlatforms } from '@/components/Main/AppPlatforms'
import { PartnerOrganizations } from '@/components/Main/PartnerOrganizations'
import { DemoSection } from '@/components/Main/DemoSection'
import { Pricing } from '@/components/Main/Pricing'
import { ShareWithSchool } from '@/components/Main/ShareWithSchool'
import { HeaderSimple } from '@/components/Main/Header'
import { TimeRecordingHero } from '@/components/Main/TimeRecordingHero'
import { AppShell } from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import { GetStaticPropsContext } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

const ACCOUNT_DELETION_QUEUED_TOAST_KEY = 'edutime_account_deletion_queued_toast_shown'
/** @deprecated Old redirect param; same toast as queued deletion */
const ACCOUNT_DELETED_TOAST_KEY = 'edutime_account_deleted_toast_shown'

export default function Home() {
  const router = useRouter()
  const t = useTranslations('Index')

  useEffect(() => {
    if (!router.isReady) return

    const queued = router.query.accountDeletionQueued === '1'
    const legacyDeleted = router.query.accountDeleted === '1'
    if (!queued && !legacyDeleted) return

    const storageKey = queued ? ACCOUNT_DELETION_QUEUED_TOAST_KEY : ACCOUNT_DELETED_TOAST_KEY

    const stripDeletionQueryParams = () => {
      if (typeof window === 'undefined') return
      const url = new URL(window.location.href)
      let changed = false
      if (url.searchParams.has('accountDeletionQueued')) {
        url.searchParams.delete('accountDeletionQueued')
        changed = true
      }
      if (url.searchParams.has('accountDeleted')) {
        url.searchParams.delete('accountDeleted')
        changed = true
      }
      if (!changed) return
      const next = url.pathname + (url.search || '')
      window.history.replaceState(null, '', next || url.pathname)
    }

    if (sessionStorage.getItem(storageKey) === '1') {
      stripDeletionQueryParams()
      return
    }
    sessionStorage.setItem(storageKey, '1')

    showNotification({
      title: t('account_deletion_queued_title'),
      message: t('account_deletion_queued_message'),
      color: 'blue',
    })

    stripDeletionQueryParams()
  }, [router.isReady, router.query.accountDeletionQueued, router.query.accountDeleted, t])

  return (
    <AppShell header={{ height: 60 }} padding={0}>
      <Head>
        <title>EduTime</title>
      </Head>
      <AppShell.Header>
        <HeaderSimple />
      </AppShell.Header>
      <TimeRecordingHero />
      <AppPlatforms />
      <PartnerOrganizations />
      <div id='pricing'>
        <Pricing />
      </div>
      <ShareWithSchool />
      <ContactHero />
      <Footer />
      <CookieDialog />
    </AppShell>
  )
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../messages/${locale}.json`)).default,
    },
  }
}
