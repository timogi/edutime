import React from 'react'
import { Paper, Title, Text, Container, Button, AppShell, Stack, Group } from '@mantine/core'
import Head from 'next/head'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { GetStaticPropsContext } from 'next/types'
import { IconCheck } from '@tabler/icons-react'

export default function RegistrationSuccess() {
  const t = useTranslations('Index')

  return (
    <>
      <Head>
        <title>EduTime - {t('page-title-register-success')}</title>
      </Head>
      <AppShell
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--mantine-color-body)',
        }}
      >
        <Container size={420} my={40}>
          <Paper withBorder p={30} radius='md'>
            <Stack gap='md' align='center' ta='center'>
              <Group justify='center'>
                <IconCheck size={64} style={{ color: 'var(--mantine-color-green-6)' }} />
              </Group>
              <Title order={2}>{t('successfullyRegistered')}</Title>
              <Text c='dimmed' size='sm'>
                {t('confirmEmail')}
              </Text>
              <Button component={Link} href='/login' variant='filled' size='md' fullWidth mt='md'>
                {t('login')}
              </Button>
            </Stack>
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
