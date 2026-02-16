import React, { useState, useEffect, useRef } from 'react'
import {
  TextInput,
  PasswordInput,
  Anchor,
  Paper,
  Title,
  Text,
  Container,
  Group,
  Button,
  AppShell,
  Stack,
} from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Footer } from '@/components/Footer/Footer'
import { GetStaticPropsContext } from 'next/types'
import { useTranslations } from 'next-intl'
import { supabase } from '@/utils/supabase/client'
import { useWindowEvent } from '@mantine/hooks'

export default function AuthenticationTitle() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const [showResendConfirmation, setShowResendConfirmation] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Error states for fields
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const t = useTranslations('Index')

  // Listen for route changes to reset loading state
  useEffect(() => {
    const handleRouteChange = () => {
      setIsLoading(false)
      // Clear any pending timeout when navigation starts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }

    router.events.on('routeChangeStart', handleRouteChange)
    router.events.on('routeChangeComplete', handleRouteChange)
    router.events.on('routeChangeError', handleRouteChange)

    return () => {
      router.events.off('routeChangeStart', handleRouteChange)
      router.events.off('routeChangeComplete', handleRouteChange)
      router.events.off('routeChangeError', handleRouteChange)
      // Cleanup timeout on unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [router])

  const handleLogin = async () => {
    // Clear previous errors
    setEmailError('')
    setPasswordError('')
    setShowResendConfirmation(false)

    // Validate fields
    let hasErrors = false
    if (!email) {
      setEmailError(t('email-required'))
      hasErrors = true
    }
    if (!password) {
      setPasswordError(t('password-required'))
      hasErrors = true
    }

    if (hasErrors) {
      showNotification({
        title: t('validation-error') || 'Fehler',
        message: t('please-fill-all-fields') || 'Bitte füllen Sie alle erforderlichen Felder aus',
        color: 'red',
      })
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (error) {
        throw error
      }

      // Verify session is established
      if (!data.session) {
        // Wait a bit for session to be established
        await new Promise((resolve) => setTimeout(resolve, 300))
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session) {
          throw new Error('Session not established')
        }
      }

      // Wait for session to be fully established and cookies to be set
      // This ensures the UserProvider can detect the session when navigating
      await new Promise((resolve) => setTimeout(resolve, 200))

      // Verify session one more time before navigating
      const {
        data: { session: finalSession },
      } = await supabase.auth.getSession()
      if (!finalSession) {
        throw new Error('Session not established')
      }

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      // Don't navigate here - let UserProvider handle the redirect after data is loaded
      // The onAuthStateChange handler will redirect to /app once user data is fetched
      // Keep loading state until UserProvider redirects
      // The loading state will be cleared when navigation happens
    } catch (error: any) {
      // Translate Supabase error messages
      let errorMessage = t('login-failed')

      if (error?.message) {
        const errorMsg = error.message.toLowerCase()

        if (errorMsg.includes('email not confirmed') || errorMsg.includes('email_not_confirmed')) {
          errorMessage = t('email-not-confirmed')
          setShowResendConfirmation(true)
        } else if (
          errorMsg.includes('invalid login credentials') ||
          errorMsg.includes('invalid_credentials')
        ) {
          errorMessage = t('login-failed')
        } else if (errorMsg.includes('invalid email') || errorMsg.includes('email format')) {
          errorMessage = t('invalid-email')
          setEmailError(t('invalid-email'))
        } else {
          errorMessage = error.message || errorMessage
        }
      }

      showNotification({
        title: t('error') || 'Fehler',
        message: errorMessage,
        color: 'red',
      })
      setIsLoading(false)
    }
  }

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === 'NumpadEnter') {
      handleLogin()
    }
  }

  const handleResendConfirmation = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: 'https://edutime.ch/login',
        },
      })
      if (error) {
        showNotification({
          title: t('error') || 'Fehler',
          message: t('resend-confirmation-failed'),
          color: 'red',
        })
      } else {
        showNotification({
          title: t('success') || 'Erfolg',
          message: t('resend-confirmation-success'),
          color: 'green',
        })
      }
    } catch (error) {
      console.error('Error resending confirmation:', error)
      showNotification({
        title: t('error') || 'Fehler',
        message: t('resend-confirmation-failed'),
        color: 'red',
      })
    }
  }

  useWindowEvent('keydown', handleKeyPress as (event: KeyboardEvent) => void)

  return (
    <>
      <Head>
        <title>EduTime - {t('page-title-login')}</title>
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
          <Title ta='center'>{t('login-header')}</Title>
          <Text c='dimmed' size='sm' ta='center' mt={5}>
            {t('ask-account')}{' '}
            <Link href='/register' key={'register'}>
              <Anchor size='sm' component='button'>
                {t('create-account')}
              </Anchor>
            </Link>
          </Text>

          <Paper withBorder p={30} mt={30} radius='md'>
            <Stack gap='md'>
              <TextInput
                label={t('email')}
                placeholder={t('email-placeholder')}
                required
                value={email}
                onChange={(event) => {
                  setEmail(event.currentTarget.value)
                  if (emailError) setEmailError('')
                }}
                error={emailError}
                size='md'
              />
              <PasswordInput
                label={t('password')}
                placeholder={t('password-placeholder')}
                required
                value={password}
                onChange={(event) => {
                  setPassword(event.currentTarget.value)
                  if (passwordError) setPasswordError('')
                }}
                error={passwordError}
                size='md'
              />
              <Group justify='flex-end'>
                <Link href={'/recover'}>
                  <Anchor component='button' size='sm'>
                    {t('forgot-password')}
                  </Anchor>
                </Link>
              </Group>
              {showResendConfirmation && (
                <Button fullWidth variant='subtle' onClick={handleResendConfirmation} color='gray'>
                  {t('resend-confirmation')}
                </Button>
              )}
              <Button
                fullWidth
                onClick={handleLogin}
                loading={isLoading}
                variant='filled'
                size='md'
              >
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
