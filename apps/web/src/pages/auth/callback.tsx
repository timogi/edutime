import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { GetStaticPropsContext } from 'next/types'
import { Container, Paper, Stack, Text, Title, Loader, Center } from '@mantine/core'
import Link from 'next/link'
import { supabase } from '@/utils/supabase/client'
import { getPostAuthRedirect, parseIntentFromQuery } from '@/utils/auth/intent'
import { LoadingScreen } from '@/components/LoadingScreen'

export default function AuthCallback() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Supabase redirects with hash fragments (#access_token=...&refresh_token=...)
        // First, try to get session from hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        if (accessToken && refreshToken) {
          // Set the session from hash fragments
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (setSessionError) {
            console.error('Error setting session:', setSessionError)
            setError('Authentication failed. Please try again.')
            setIsProcessing(false)
            return
          }
        } else {
          // Fallback: try to get existing session
          const { data, error: exchangeError } = await supabase.auth.getSession()

          if (exchangeError || !data.session) {
            console.error('Error getting session:', exchangeError)
            setError('No session found. Please try logging in again.')
            setIsProcessing(false)
            return
          }
        }

        // Parse intent and qty from query params
        const { intent, qty } = parseIntentFromQuery(router.query)

        // If intent is demo, activate demo before redirecting
        if (intent === 'demo') {
          try {
            const {
              data: { session: currentSession },
            } = await supabase.auth.getSession()

            if (currentSession?.access_token) {
              const response = await fetch('/api/users/start-demo', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${currentSession.access_token}`,
                },
                credentials: 'include',
                body: JSON.stringify({ user_id: currentSession.user.id }),
              })

              if (!response.ok) {
                const data = await response.json()
                console.error('Error starting demo:', data.error)
                // Don't block the flow if demo activation fails - user can start it manually
              }
            }
          } catch (demoError) {
            console.error('Error activating demo:', demoError)
            // Don't block the flow if demo activation fails
          }
        }

        // Get redirect URL based on intent
        const redirectUrl = getPostAuthRedirect(intent, qty)

        // Redirect to the appropriate page
        router.replace(redirectUrl)
      } catch (err) {
        console.error('Error in auth callback:', err)
        setError('An unexpected error occurred. Please try again.')
        setIsProcessing(false)
      }
    }

    // Only process if we have query params (Supabase redirects include these)
    if (router.isReady) {
      handleAuthCallback()
    }
  }, [router.isReady, router.query, router])

  if (isProcessing) {
    return <LoadingScreen />
  }

  if (error) {
    return (
      <Container size={420} my={40}>
        <Paper withBorder p={30} radius='md'>
          <Stack gap='md' align='center'>
            <Title order={3} c='red'>
              Authentication Error
            </Title>
            <Text c='dimmed' ta='center'>
              {error}
            </Text>
            <Link href='/login'>
              <button>Go to Login</button>
            </Link>
          </Stack>
        </Paper>
      </Container>
    )
  }

  return <LoadingScreen />
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../../messages/${locale}.json`)).default,
    },
  }
}
