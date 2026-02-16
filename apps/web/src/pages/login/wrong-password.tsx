import React from 'react'
import { Button, Container, Paper, Title, Text, AppShell, Group } from '@mantine/core'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { IconCheck, IconX } from '@tabler/icons-react'
import { GetStaticPropsContext } from 'next/types'
import { useTranslations } from 'next-intl'

export default function PasswordChanged() {
  const router = useRouter()

  const t = useTranslations('Index')

  const goToApp = () => {
    router.push('/login')
  }

  return (
    <>
      <Head>
        <title>EduTime - {t('page-title-wrong-password')}</title>
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
              <IconX style={{ fontSize: 64, color: 'var(--mantine-color-red-6)' }} size={50} />
            </Group>

            <Title>{t('wrong-password')}</Title>
            <Text mt='sm'>{t('automatic-logout')}</Text>
            <Button style={{ marginTop: 'var(--mantine-spacing-lg)' }} fullWidth onClick={goToApp}>
              {t('login')}
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
