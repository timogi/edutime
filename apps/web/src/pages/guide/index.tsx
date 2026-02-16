import Head from 'next/head'
import { rem, AppShell, Title, Text, Button, Image, Container, Stack } from '@mantine/core'
import { HeaderSimple } from '@/components/Main/Header'
import { ContactHero } from '@/components/Main/Contact'
import { GetStaticPropsContext } from 'next'
import { Footer } from '@/components/Footer/Footer'
import { ImprintHero } from '@/components/Main/Imprint'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function UserGuide() {
  const t = useTranslations('UserGuide')
  const t_index = useTranslations('Index')

  return (
    <AppShell header={{ height: 60 }} padding={0}>
      <Head>
        <title>EduTime - {t('user-guide-title')}</title>
      </Head>
      <Container size={1100} my={75}>
        <Stack gap='lg'>
          <Title order={1}>{t('user-guide-title')}</Title>
          <Stack gap='xs'>
            <Title order={2}>{t('intro')}</Title>
            <Text size='lg'>{t('intro-text')}</Text>
          </Stack>

          <Stack gap='md'>
            <Title order={2}>{t('registration')}</Title>
            <Text>{t('registration-text')}</Text>
            <Link href={'/register'}>
              <Button>{t_index('register')}</Button>
            </Link>
            <Text>{t('seat-text')}</Text>
          </Stack>

          <Stack gap='md'>
            <Title order={2}>{t('migration')}</Title>
            <Text>{t('migration-text')}</Text>
          </Stack>

          <Stack gap='md'>
            <Title order={2}>{t('time-recording')}</Title>
            <Text fw={500}>{t('time-recording-intro')}</Text>
            <Text>{t('time-recording-text')}</Text>
            <Text>{t('time-recording-text2')}</Text>
            <Text>{t('time-recording-create')}</Text>
            <Text>{t('time-recording-further-categories')}</Text>
            <Image alt={t('time-recording')} src={'/time-recording.png'} maw={800} radius={'md'} />
          </Stack>

          <Stack gap='md'>
            <Title order={2}>{t('calendar')}</Title>
            <Text>{t('calendar-text')}</Text>
            <Image alt={t('calendar')} src={'/schoolyear.png'} maw={800} radius={'md'} />
          </Stack>

          <Stack gap='md'>
            <Title order={2}>{t('statistics')}</Title>
            <Text>{t('statistics-text')}</Text>
          </Stack>

          <Stack gap='md'>
            <Title order={2}>{t('reporting')}</Title>
            <Text>{t('reporting-text')}</Text>
          </Stack>
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
