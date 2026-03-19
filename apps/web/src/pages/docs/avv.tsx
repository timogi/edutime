import Head from 'next/head'
import { AppShell } from '@mantine/core'
import { HeaderSimple } from '@/components/Main/Header'
import { ContactHero } from '@/components/Main/Contact'
import { GetStaticPropsContext } from 'next'
import { Footer } from '@/components/Footer/Footer'
import { AVVContent } from '@/components/Legal/avv'

export default function AVVDocs() {
  return (
    <AppShell header={{ height: 60 }} padding={0}>
      <Head>
        <title>EduTime - AVV</title>
      </Head>
      <HeaderSimple />
      <AVVContent />
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
