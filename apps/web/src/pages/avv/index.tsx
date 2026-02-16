import Head from 'next/head'
import styles from '../index.module.css'
import { AppShell } from '@mantine/core'
import { HeaderSimple } from '@/components/Main/Header'
import { ContactHero } from '@/components/Main/Contact'
import { GetStaticPropsContext } from 'next'
import { Footer } from '@/components/Footer/Footer'
import { AVVSection } from '@/components/Main/AVVSection'

export default function AVV() {
  return (
    <AppShell header={{ height: 60 }} padding={0}>
      <Head>
        <title>EduTime - AVV</title>
      </Head>
      <HeaderSimple />
      <AVVSection />
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
