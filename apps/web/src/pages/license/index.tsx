import Head from 'next/head'
import { AppShell, Title, Text, Container, Stack } from '@mantine/core'
import { HeaderSimple } from '@/components/Main/Header'
import { ContactHero } from '@/components/Main/Contact'
import { GetStaticPropsContext } from 'next'
import { Footer } from '@/components/Footer/Footer'
import { useTranslations } from 'next-intl'

export default function EduTimeLicense() {
  const t = useTranslations('EduTimeLicense')

  return (
    <AppShell
      header={{ height: 60 }}
      padding={0}
      bg='light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-8))'
    >
      <Head>
        <title>EduTime - {t('license-title')}</title>
      </Head>
      <Container size={1100} my={75}>
        <Stack gap='sm'>
          <Title order={1}>{t('license-title')}</Title>
          <Text>{t('license-intro')}</Text>
          <Title order={2}>{t('how-to-obtain-title')}</Title>
          <Text>{t('how-to-obtain-text')}</Text>
          <Title order={2}>{t('special-conditions-title')}</Title>
          <Text>{t('special-conditions-text')}</Text>
          <Title order={2}>{t('partner-organizations-title')}</Title>
          <Text>{t('partner-organizations-text')}</Text>
        </Stack>
      </Container>
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
