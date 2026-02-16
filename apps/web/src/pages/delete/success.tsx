import React from 'react'
import { Button, Container, Paper, Title, Text, AppShell, Group, Stack } from '@mantine/core'
import { IconCheck } from '@tabler/icons-react'
import { GetStaticPropsContext } from 'next/types'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function DeleteSuccess() {
  const t = useTranslations('Index')

  return (
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
          <Stack gap='md' align='center'>
            <Group justify='center'>
              <IconCheck
                style={{ fontSize: 64, color: 'var(--mantine-color-green-6)' }}
                size={50}
              />
            </Group>

            <Title ta='center'>{t('account_deleted')}</Title>
            <Text mt='sm' ta='center' c='dimmed'>
              {t('account_deleted_message')}
            </Text>

            <Button component={Link} href='/register' variant='filled' mt='md' fullWidth>
              {t('register_again')}
            </Button>
          </Stack>
        </Paper>
      </Container>
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
