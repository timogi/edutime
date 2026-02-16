import React, { useState, useEffect } from 'react'
import {
  TextInput,
  PasswordInput,
  Anchor,
  Paper,
  Title,
  Text,
  Container,
  Button,
  AppShell,
  Stack,
  Group,
  Checkbox,
  Alert,
} from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Footer } from '@/components/Footer/Footer'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { GetStaticPropsContext } from 'next/types'
import { supabase } from '@/utils/supabase/client'
import { useMediaQuery } from '@mantine/hooks'
import { buildEmailRedirectTo, parseIntentFromQuery } from '@/utils/auth/intent'
import { IconMail } from '@tabler/icons-react'

export default function RegistrationForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const router = useRouter()
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [intent, setIntent] = useState<'demo' | 'annual' | 'org' | undefined>()
  const [qty, setQty] = useState<number | undefined>()

  // Error states for fields
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [termsError, setTermsError] = useState('')

  const isSmallScreen = useMediaQuery('(max-width: 768px)')

  const t = useTranslations('Index')

  // Parse intent and qty from query params
  useEffect(() => {
    const { intent: parsedIntent, qty: parsedQty } = parseIntentFromQuery(router.query)
    setIntent(parsedIntent)
    setQty(parsedQty)
  }, [router.query])

  const clearErrors = () => {
    setEmailError('')
    setPasswordError('')
    setConfirmPasswordError('')
    setTermsError('')
  }

  const handleRegister = async () => {
    clearErrors()
    let hasErrors = false

    if (!email) {
      setEmailError(t('email-required'))
      hasErrors = true
    }

    if (!password) {
      setPasswordError(t('password-required') || t('password') + ' ' + t('required'))
      hasErrors = true
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError(t('passwords-not-match'))
      hasErrors = true
    }

    if (!termsAccepted) {
      setTermsError(t('accept-terms-required'))
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

    // Store register intent in localStorage before submission
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          'edutime_register_intent',
          JSON.stringify({
            timestamp: Date.now(),
            termsAccepted: true,
            privacyAccepted: true,
          }),
        )
      } catch (e) {
        console.error('Failed to store register intent:', e)
      }
    }

    setIsLoading(true)
    try {
      // Build email redirect URL with intent and qty
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://edutime.ch'
      const emailRedirectTo = intent
        ? buildEmailRedirectTo(origin, intent, qty)
        : `${origin}/auth/callback`

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo,
        },
      })

      if (error) throw error

      setEmailSent(true)
    } catch (error: any) {
      // Translate Supabase error messages
      let errorMessage = t('registration-failed') || 'Registrierung fehlgeschlagen'

      if (error?.message) {
        const errorMsg = error.message.toLowerCase()

        // Check for specific Supabase error codes and messages
        if (
          errorMsg.includes('user already registered') ||
          errorMsg.includes('email_exists') ||
          errorMsg.includes('already registered')
        ) {
          errorMessage = t('email-already-in-use')
        } else if (
          errorMsg.includes('weak') ||
          errorMsg.includes('easy to guess') ||
          errorMsg.includes('password is known')
        ) {
          errorMessage = t('password-too-weak')
        } else if (errorMsg.includes('invalid email') || errorMsg.includes('email format')) {
          errorMessage = t('invalid-email')
        } else if (errorMsg.includes('password') && errorMsg.includes('6')) {
          errorMessage = t('password-too-short')
        } else if (errorMsg.includes('signup_disabled') || errorMsg.includes('signup disabled')) {
          errorMessage = t('signup-disabled')
        } else {
          // Try to use the error message directly, or fallback to translated message
          errorMessage = t(`error-${error.code}`) || error.message || errorMessage
        }
      }

      showNotification({
        title: t('error') || 'Fehler',
        message: errorMessage,
        color: 'red',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>EduTime - {t('page-title-register')}</title>
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
        <Container size={700} my={40}>
          <Title ta='center'>{t('register-header')}</Title>
          <Text c='dimmed' size='sm' ta='center' mt={5}>
            {t('already-account')}{' '}
            <Link
              href={intent ? `/login?intent=${intent}${qty ? `&qty=${qty}` : ''}` : '/login'}
              key={'login'}
            >
              <Anchor size='sm' component='button'>
                {t('login')}
              </Anchor>
            </Link>
          </Text>

          <Paper withBorder p={30} mt={30} radius='md'>
            {emailSent ? (
              <Stack gap='md' align='center'>
                <IconMail size={48} color='var(--mantine-color-violet-6)' />
                <Title order={3} ta='center'>
                  {t('check-inbox') || 'Bitte bestätigen Sie Ihre E-Mail'}
                </Title>
                <Text c='dimmed' ta='center' size='sm'>
                  {t('confirmEmail') ||
                    'Wir haben Ihnen eine Bestätigungs-E-Mail gesendet. Bitte klicken Sie auf den Link in der E-Mail, um Ihr Konto zu aktivieren. Danach geht es automatisch weiter.'}
                </Text>
                <Button
                  variant='subtle'
                  onClick={async () => {
                    try {
                      const origin =
                        typeof window !== 'undefined'
                          ? window.location.origin
                          : 'https://edutime.ch'
                      const emailRedirectTo = intent
                        ? buildEmailRedirectTo(origin, intent, qty)
                        : `${origin}/auth/callback`

                      const { error } = await supabase.auth.resend({
                        type: 'signup',
                        email,
                        options: {
                          emailRedirectTo,
                        },
                      })

                      if (error) throw error

                      showNotification({
                        title: t('success') || 'Erfolg',
                        message: t('resend-confirmation-success') || 'E-Mail wurde erneut gesendet',
                        color: 'green',
                      })
                    } catch (error: any) {
                      showNotification({
                        title: t('error') || 'Fehler',
                        message:
                          t('resend-confirmation-failed') ||
                          'E-Mail konnte nicht erneut gesendet werden',
                        color: 'red',
                      })
                    }
                  }}
                >
                  {t('resend-confirmation') || 'E-Mail erneut senden'}
                </Button>
              </Stack>
            ) : (
              <Stack gap={'md'}>
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
                    if (confirmPasswordError && event.currentTarget.value === confirmPassword) {
                      setConfirmPasswordError('')
                    }
                  }}
                  error={passwordError}
                  size='md'
                />
                <PasswordInput
                  label={t('confirm-password')}
                  placeholder={t('confirm-password')}
                  required
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.currentTarget.value)
                    if (confirmPasswordError) {
                      if (event.currentTarget.value === password) {
                        setConfirmPasswordError('')
                      } else {
                        setConfirmPasswordError(t('passwords-not-match'))
                      }
                    }
                  }}
                  error={confirmPasswordError}
                  size='md'
                />
                <div>
                  <Checkbox
                    required
                    label={
                      <Text>
                        Ich akzeptiere die{' '}
                        <Link
                          href={'/docs/terms'}
                          target='_blank'
                          style={{ textDecoration: 'underline' }}
                        >
                          Nutzungsbedingungen
                        </Link>{' '}
                        und die{' '}
                        <Link
                          href={'/docs/privacy'}
                          target='_blank'
                          style={{ textDecoration: 'underline' }}
                        >
                          Datenschutzbestimmungen
                        </Link>
                        .
                      </Text>
                    }
                    checked={termsAccepted}
                    onChange={(event) => {
                      setTermsAccepted(event.currentTarget.checked)
                      if (termsError) setTermsError('')
                    }}
                    error={termsError ? true : false}
                  />
                  {termsError && (
                    <Text size='xs' c='red' mt={4} ml={28}>
                      {termsError}
                    </Text>
                  )}
                </div>
                <Button
                  fullWidth
                  onClick={handleRegister}
                  loading={isLoading}
                  variant='filled'
                  size='md'
                >
                  {t('register')}
                </Button>
              </Stack>
            )}
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
