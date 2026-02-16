import React, { useState, useEffect } from 'react'
import {
  TextInput,
  Button,
  Container,
  Paper,
  Title,
  Text,
  AppShell,
  Anchor,
  Alert,
} from '@mantine/core'
import { IconAlertCircle, IconCheck } from '@tabler/icons-react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '@/utils/supabase/client'
import { useTranslations } from 'next-intl'
import { GetStaticPropsContext } from 'next/types'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [alertType, setAlertType] = useState<'error' | 'success' | null>(null)
  const router = useRouter()

  const t = useTranslations('Index')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const redirectTo = 'https://edutime.ch/recover/new-password'
      const options = { redirectTo }
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, options)
      if (error) throw error
      setMessage(t('check-inbox'))
      setAlertType('success')
    } catch (error) {
      setMessage(t('reset-failed'))
      setAlertType('error')
    }
  }

  useEffect(() => {
    // Use setTimeout to avoid async calls directly in onAuthStateChange handler (deadlock bug)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Defer async operations to avoid deadlock
        setTimeout(async () => {
          const newPassword = prompt(t('prompt-new-password'))
          if (newPassword) {
            try {
              const { data, error } = await supabase.auth.updateUser({ password: newPassword })
              if (data) alert(t('password-updated'))
              if (error) alert(t('update-error'))
            } catch (error) {
              alert(t('update-error'))
            }
          }
        }, 0)
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [t])

  return (
    <>
      <Head>
        <title>EduTime - {t('page-title-recover')}</title>
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
          <Title ta='center'>{t('forgot-password')}</Title>
          <Paper
            withBorder
            shadow='md'
            p={30}
            mt={30}
            radius='md'
            style={{
              backgroundColor: 'var(--mantine-color-body)',
            }}
          >
            <Text size='sm' ta='center' mt={5}>
              {t('enter-email')}
            </Text>
            <form onSubmit={handleSubmit}>
              <TextInput
                label={t('email')}
                placeholder={t('email-placeholder')}
                required
                value={email}
                onChange={(event) => setEmail(event.currentTarget.value)}
                mt='md'
                size='md'
                styles={{
                  input: {
                    backgroundColor: 'var(--mantine-color-body)',
                    borderColor: 'var(--mantine-color-border)',
                  },
                }}
              />
              {message && (
                <Alert
                  icon={
                    alertType === 'error' ? <IconAlertCircle size={16} /> : <IconCheck size={16} />
                  }
                  title={alertType === 'error' ? 'Fehler' : 'Erfolg'}
                  color={alertType === 'error' ? 'red' : 'green'}
                  mt='sm'
                >
                  {message}
                </Alert>
              )}
              <Button fullWidth mt='lg' type='submit'>
                {t('send-instructions')}
              </Button>
            </form>
            <Text mt='md' ta='center'>
              {t('remember-password')}{' '}
              <Link href='/login'>
                <Anchor>{t('sign-in')}</Anchor>
              </Link>
            </Text>
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
