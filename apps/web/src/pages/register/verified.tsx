// same like success but email verified with a tick
import React from 'react'
import { Button, Container, Paper, Title, Text, AppShell, Group } from '@mantine/core'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { IconCheck } from '@tabler/icons-react'
import { GetStaticPropsContext } from 'next/types'
import { useTranslations } from 'next-intl'

export default function EmailVerified() {
  const router = useRouter()

  const t = useTranslations('Index')

  const goToApp = () => {
    router.push('/app')
  }

  return (
    <>
      <Head>
        <title>EduTime - {t('page-title-register-verified')}</title>
      </Head>
      <AppShell
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Container size={420} my={40}>
          <Paper withBorder p={30} mt={30} radius='md'>
            <Group justify='center' mb={20}>
              <IconCheck
                style={{ fontSize: 64, color: 'var(--mantine-color-green-6)' }}
                size={50}
              />
            </Group>

            <Title>{t('email_verified')}</Title>
            <Text mt='sm'>{t('email_verified_successfully')}</Text>
            <Button
              style={{ marginTop: 'var(--mantine-spacing-lg)' }}
              fullWidth
              onClick={() => router.push('/login')}
            >
              {t('go_to_login')}
            </Button>
          </Paper>
        </Container>
      </AppShell>
    </>
  )
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../../messages/${locale}.json`)).default,
    },
  }
}
