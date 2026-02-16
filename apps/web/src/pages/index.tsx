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
import { GetStaticPropsContext } from 'next'

import Head from 'next/head'

export default function Home() {
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
