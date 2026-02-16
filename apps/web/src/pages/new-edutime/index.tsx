import Head from 'next/head'
import { AppShell, Title, Text, Image, Container, Stack } from '@mantine/core'
import { HeaderSimple } from '@/components/Main/Header'
import { Footer } from '@/components/Footer/Footer'
import { useTranslations } from 'next-intl'
import { GetStaticPropsContext } from 'next/types'
import { ContactHero } from '@/components/Main/Contact'
import Link from 'next/link'

export default function NewEduTime() {
  const t = useTranslations('NewEduTime')

  return (
    <AppShell header={{ height: 60 }} padding={0}>
      <Head>
        <title>{t('title')}</title>
      </Head>
      <Container size={1100} my={75}>
        <Stack>
          <Title order={1}>{t('title')}</Title>
          <Text>{t('introduction')}</Text>
          <Title
            order={2}
            style={{ fontSize: '24px', fontWeight: 600, marginTop: 'var(--mantine-spacing-md)' }}
          >
            {t('exclusive-web-app')}
          </Title>
          <Text>{t('web-app-description')}</Text>

          <Title
            order={2}
            style={{ fontSize: '24px', fontWeight: 600, marginTop: 'var(--mantine-spacing-md)' }}
          >
            {t('future-smartphone-app')}
          </Title>
          <Text>{t('app-description')}</Text>
          <Title
            order={2}
            style={{ fontSize: '24px', fontWeight: 600, marginTop: 'var(--mantine-spacing-md)' }}
          >
            {t('simple-data-transfer')}
          </Title>
          <Text>
            {t('data-transfer-description1')}
            <Link href='/guide'>
              <Text c='blue'>{t('user-guide')}</Text>
            </Link>
            {t('data-transfer-description2')}
          </Text>
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
