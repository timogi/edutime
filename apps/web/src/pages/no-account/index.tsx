import React from 'react'
import { Paper, Title, Text, Container, Stack, Button, AppShell } from '@mantine/core'
import Head from 'next/head'
import Link from 'next/link'
import { IconUser, IconKey } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'
import { GetStaticPropsContext } from 'next/types'

const NoAccountPage = () => {
  const t = useTranslations('Index')

  return (
    <>
      <Head>
        <title>EduTime - {t('page-title-no-account')}</title>
      </Head>
      <AppShell>
        <Container size={600} my={40}>
          <Paper withBorder shadow='md' p={30} radius='md'>
            <Stack gap='sm'>
              <Title order={2}>{t('no_account_title')}</Title>

              <Text>{t('no_account_description')}</Text>

              <Stack gap='sm'>
                <Stack gap={5}>
                  <Text size='sm' c='dimmed'>
                    {t('no_account_register_button')}
                  </Text>
                  <Button
                    component={Link}
                    href='/register'
                    fullWidth
                    size='md'
                    leftSection={<IconUser size={20} />}
                  >
                    {t('register')}
                  </Button>
                </Stack>

                <Stack gap={5}>
                  <Text size='sm' c='dimmed'>
                    {t('no_account_license_button')}
                  </Text>
                  <Button
                    component={Link}
                    href='/license'
                    fullWidth
                    size='md'
                    variant='light'
                    leftSection={<IconKey size={20} />}
                  >
                    {t('informations')}
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          </Paper>
        </Container>
      </AppShell>
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
