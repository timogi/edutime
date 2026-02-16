import {
  Container,
  Grid,
  Card,
  Text,
  Box,
  AppShell,
  Button,
  Alert,
  Title,
  useMantineTheme,
} from '@mantine/core'
import Image from 'next/image'
import { HeaderSimple } from '@/components/Main/Header'
import { ContactHero } from '@/components/Main/Contact'
import { Footer } from '@/components/Footer/Footer'
import Head from 'next/head'
import { GetStaticPropsContext } from 'next'
import { IconBrandGooglePlay, IconBrandApple, IconAlertCircle } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'

const TestAppPage = () => {
  const t = useTranslations()
  const theme = useMantineTheme()

  return (
    <AppShell header={{ height: 60 }} padding={0}>
      <Head>
        <title>{t('MobileApp.title')}</title>
      </Head>

      <Box bg='light-dark(white, var(--mantine-color-dark-7))' py='xl'>
        <Container size='md'>
          <Title order={1} ta='center' mb='xl'>
            {t('MobileApp.heading')}
          </Title>

          <Text ta='center' c='dimmed' mb='xl'>
            {t('MobileApp.description')}
          </Text>

          <Alert icon={<IconAlertCircle size='1rem' />} mb='xl'>
            {t('Index.license_required')}
          </Alert>

          <Grid justify='center' gutter='xl' mb='xl'>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder padding='0' radius='md' shadow='sm' pb='xl'>
                <Box ta='center'>
                  <Card
                    p='md'
                    mb='md'
                    radius={0}
                    style={{
                      background: 'linear-gradient(45deg, #fa5252 0%, #7950f2 100%)',
                    }}
                  >
                    <Text size='lg' c='white' fw={800}>
                      {t('MobileApp.android')}
                    </Text>
                  </Card>
                  <Box mb='md'>
                    <Image
                      src='/playstore.svg'
                      alt={t('MobileApp.playstore_qr')}
                      width={200}
                      height={200}
                    />
                  </Box>
                  <Box maw={250} mx='auto'>
                    <Text size='sm' c='dimmed' mb='md'>
                      {t('MobileApp.android_instruction')}
                    </Text>
                    <Button
                      leftSection={<IconBrandGooglePlay size={14} />}
                      variant='default'
                      component='a'
                      href='https://play.google.com/store/apps/details?id=ch.edutime.app&pcampaignid=web_share'
                      target='_blank'
                    >
                      {t('MobileApp.android_cta')}
                    </Button>
                  </Box>
                </Box>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder padding='0' radius='md' shadow='sm' pb='xl'>
                <Box ta='center'>
                  <Card
                    p='md'
                    mb='md'
                    radius={0}
                    style={{
                      background: 'linear-gradient(225deg, #fa5252 0%, #5f3dc4 100%)',
                    }}
                  >
                    <Text size='lg' c='white' fw={800}>
                      {t('MobileApp.ios')}
                    </Text>
                  </Card>
                  <Box mb='md'>
                    <Image
                      src='/testflight.svg'
                      alt={t('MobileApp.appstore_qr')}
                      width={200}
                      height={200}
                    />
                  </Box>
                  <Box maw={300} mx='auto'>
                    <Text size='sm' c='dimmed' mb='md'>
                      {t('MobileApp.ios_instruction')}
                    </Text>
                    <Button
                      leftSection={<IconBrandApple size={14} />}
                      variant='default'
                      component='a'
                      href='https://apps.apple.com/ch/app/edutime-zeitmanagement/id6739214927'
                      target='_blank'
                    >
                      {t('MobileApp.ios_cta')}
                    </Button>
                  </Box>
                </Box>
              </Card>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      <ContactHero />
      <Footer />
    </AppShell>
  )
}

export default TestAppPage

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../../messages/${locale}.json`)).default,
    },
  }
}
