import Head from 'next/head'
import { AppShell } from '@mantine/core'
import { HeaderSimple } from '@/components/Main/Header'
import { ContactHero } from '@/components/Main/Contact'
import { GetStaticPropsContext } from 'next'
import { Footer } from '@/components/Footer/Footer'
import { ImprintHero } from '@/components/Main/Imprint'
import { useTranslations } from 'next-intl'

export default function Imprint() {
  const t = useTranslations('Index')

  return (
    <AppShell header={{ height: 60 }} padding={0}>
      <Head>
        <title>EduTime - {t('imprint')}</title>
        <meta name='robots' content='noindex, nofollow' />
      </Head>
      <HeaderSimple />
      <ImprintHero />
      <ContactHero />
      <Footer />
    </AppShell>
  )
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../../messages/${locale}.json`)).default,
    },
  }
}
