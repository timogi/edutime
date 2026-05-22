import React from 'react'
import { Paper, Container, Stack, Button, Box, Text } from '@mantine/core'
import Head from 'next/head'
import Link from 'next/link'
import { IconUser, IconLogin } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'
import { GetStaticPropsContext } from 'next/types'
import { HeaderSimple } from '@/components/Main/Header'
import { Footer } from '@/components/Footer/Footer'

const NoAccountPage = () => {
  const t = useTranslations('Index')

  return (
    <>
      <Head>
        <title>{`EduTime - ${t('page-title-no-account')}`}</title>
      </Head>
      <Box
        component='div'
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--mantine-color-body)',
        }}
      >
        <Box component='header' style={{ flexShrink: 0, height: 60 }}>
          <HeaderSimple showThemeToggle={false} />
        </Box>

        <Box
          component='main'
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1rem',
          }}
        >
          <Container size={400} w='100%'>
            <Paper withBorder shadow='md' p={{ base: 'lg', sm: 30 }} radius='md'>
              <Stack gap='md'>
                <Text>{t('no_account_intro')}</Text>
                <Stack gap='xs'>
                <Button component={Link} href='/login' fullWidth leftSection={<IconLogin size={18} />}>
                  {t('login')}
                </Button>
                <Button
                  component={Link}
                  href='/register'
                  fullWidth
                  variant='default'
                  leftSection={<IconUser size={18} />}
                >
                  {t('register')}
                </Button>
                </Stack>
              </Stack>
            </Paper>
          </Container>
        </Box>

        <Box component='footer' style={{ flexShrink: 0 }}>
          <Footer />
        </Box>
      </Box>
    </>
  )
}

export default NoAccountPage

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../../messages/${locale}.json`)).default,
    },
  }
}
