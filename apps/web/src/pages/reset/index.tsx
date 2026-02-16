import React, { useState } from 'react'
import { Button, Container, Paper, Title, Text, AppShell, PasswordInput } from '@mantine/core'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { changePassword } from '@/utils/supabase/user'
import { GetStaticPropsContext } from 'next/types'
import { useTranslations } from 'next-intl'

export default function ChangePassword() {
  const [message, setMessage] = useState<string>('')
  const [oldPassword, setOldPassword] = useState<string>('')
  const [newPassword, setNewPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const router = useRouter()

  const t = useTranslations('Index')

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage(t('passwords_do_not_match'))
      return
    }

    try {
      const response = await changePassword(oldPassword, newPassword)
      if (response?.error) {
        setMessage(response.error)
        if (response.error === 'Invalid current password') {
          router.push('/login/wrong-password')
        }
      } else {
        router.push('/reset/success')
      }
    } catch (error: any) {
      setMessage(error.message)
    }
  }

  return (
    <>
      <Head>
        <title>EduTime - {t('page-title-reset')}</title>
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
          <Title ta='center'>{t('change_password')}</Title>
          <Paper withBorder p={30} mt={30} radius='md'>
            <PasswordInput
              label={t('current_password')}
              placeholder={t('current_password_prompt')}
              required
              value={oldPassword}
              onChange={(event) => setOldPassword(event.currentTarget.value)}
              mt='md'
            />
            <PasswordInput
              label={t('new_password')}
              placeholder={t('new_password_prompt')}
              required
              value={newPassword}
              onChange={(event) => setNewPassword(event.currentTarget.value)}
              mt='md'
            />
            <PasswordInput
              label={t('confirm_password')}
              placeholder={t('confirm_password_prompt')}
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.currentTarget.value)}
              mt='md'
            />
            {message && (
              <Text c='red' mt='sm'>
                {message}
              </Text>
            )}
            <Button fullWidth mt='lg' type='submit' onClick={handleChangePassword}>
              {t('change_password')}
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
