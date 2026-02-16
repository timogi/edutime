import React, { useState, useEffect } from 'react'
import {
  PasswordInput,
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

export default function NewPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [alertType, setAlertType] = useState<'error' | 'success' | null>(null)
  const router = useRouter()

  const t = useTranslations('Index')

  useEffect(() => {
    // Check for error parameters in URL hash
    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      if (hash.includes('error=access_denied') && hash.includes('error_code=otp_expired')) {
        setMessage(t('recovery-link-error'))
        setAlertType('error')
      }
    }

    // Check if user has a valid session
    const checkAuth = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()
      if (error || !session) {
        setMessage(t('recovery-link-error'))
        setAlertType('error')
      }
    }
    checkAuth()
  }, [t])

  const getSpecificErrorMessage = (error: any) => {
    const errorMessage = error?.message?.toLowerCase() || ''

    if (errorMessage.includes('password') && errorMessage.includes('already')) {
      return t('password-already-used')
    }
    if (errorMessage.includes('weak') || errorMessage.includes('strength')) {
      return t('password-too-weak')
    }
    if (errorMessage.includes('short') || errorMessage.includes('length')) {
      return t('password-too-short')
    }
    if (errorMessage.includes('invalid')) {
      return t('invalid-password')
    }

    return t('update-error')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setMessage(t('password-mismatch'))
      setAlertType('error')
      return
    }

    try {
      const { data, error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setMessage(t('password-updated'))
      setAlertType('success')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (error) {
      setMessage(getSpecificErrorMessage(error))
      setAlertType('error')
    }
  }

  return (
    <>
      <Head>
        <title>EduTime - {t('page-title-recover-new-password')}</title>
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
          <Title ta='center'>{t('new-password')}</Title>
          <Paper withBorder shadow='md' p={30} mt={30} radius='md'>
            <Text size='sm' ta='center' mt={5}>
              {t('enter-new-password')}
            </Text>
            <form onSubmit={handleSubmit}>
              <PasswordInput
                label={t('password')}
                placeholder={t('password-placeholder')}
                required
                value={password}
                onChange={(event) => setPassword(event.currentTarget.value)}
                mt='md'
              />
              <PasswordInput
                label={t('confirm-password')}
                placeholder={t('confirm-password-placeholder')}
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.currentTarget.value)}
                mt='md'
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
                {t('set-password')}
              </Button>
            </form>
            <Text mt='md' ta='center'>
              {t('remember-password')}{' '}
              <Link href='/login' passHref>
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
