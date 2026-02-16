import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import { GetStaticPropsContext } from 'next/types'
import { Container, Paper, Stack, Text, Title, Button, Loader, Center, Alert } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { supabase } from '@/utils/supabase/client'
import { LoadingScreen } from '@/components/LoadingScreen'
import { CheckoutLegalGate } from '@/components/CheckoutLegalGate'
import { IconAlertCircle } from '@tabler/icons-react'

export default function CheckoutPage() {
  const router = useRouter()
  const t = useTranslations('Index')
  const [isLoading, setIsLoading] = useState(true)
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [plan, setPlan] = useState<'annual' | 'org' | null>(null)
  const [qty, setQty] = useState<number | null>(null)
  const [organizationId, setOrganizationId] = useState<number | undefined>(undefined)
  const [legalAccepted, setLegalAccepted] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  const redirectToRegister = useCallback(() => {
    const planParam = router.query.plan as string
    const qtyParam = router.query.qty as string
    const redirectUrl = `/register?intent=${planParam === 'org' ? 'org' : 'annual'}${
      qtyParam ? `&qty=${qtyParam}` : ''
    }`
    router.replace(redirectUrl)
  }, [router])

  useEffect(() => {
    const initializeCheckout = async () => {
      try {
        // First get session from localStorage
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          redirectToRegister()
          return
        }

        // Validate the session is actually valid by checking with the server
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          // Session is stale/expired - clear it and redirect to register
          await supabase.auth.signOut({ scope: 'local' })
          redirectToRegister()
          return
        }

        // Store the access token for API calls
        setAccessToken(session.access_token)

        // Get plan and qty from query params
        const planParam = router.query.plan as string
        const qtyParam = router.query.qty ? parseInt(router.query.qty as string, 10) : null
        const orgIdParam = router.query.orgId
          ? parseInt(router.query.orgId as string, 10)
          : undefined

        if (!planParam || (planParam !== 'annual' && planParam !== 'org')) {
          setError('Invalid plan')
          setIsLoading(false)
          return
        }

        if (planParam === 'org' && (!qtyParam || qtyParam < 3)) {
          setError('Invalid quantity. Must be at least 3 for org plan')
          setIsLoading(false)
          return
        }

        if (planParam === 'org' && !orgIdParam) {
          setError('Organization ID is required for org plan')
          setIsLoading(false)
          return
        }

        setPlan(planParam)
        setQty(qtyParam)
        setOrganizationId(orgIdParam)

        // Don't proceed to checkout until legal documents are accepted
        // The CheckoutLegalGate will call onAllAccepted when ready
        setIsLoading(false)
      } catch (err: any) {
        console.error('Error initializing checkout:', err)
        setError(err.message || 'An error occurred')
        setIsLoading(false)
      }
    }

    if (router.isReady) {
      initializeCheckout()
    }
  }, [router.isReady, router.query, router, redirectToRegister])

  const handleAuthError = useCallback(() => {
    redirectToRegister()
  }, [redirectToRegister])

  const handleLegalAccepted = async () => {
    setLegalAccepted(true)
    // Now create checkout session
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          plan: plan!,
          qty: qty!,
          organizationId: organizationId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          redirectToRegister()
          return
        }
        throw new Error(data.error || 'Failed to create checkout session')
      }

      setCheckoutUrl(data.checkoutUrl)

      // Auto-redirect to checkout URL after a short delay
      setTimeout(() => {
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl
        }
      }, 2000)
    } catch (err: any) {
      console.error('Error creating checkout session:', err)
      setError(err.message || 'An error occurred')
    }
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  if (error) {
    return (
      <Container size={420} my={40}>
        <Paper withBorder p={30} radius='md'>
          <Stack gap='md' align='center'>
            <IconAlertCircle size={48} color='var(--mantine-color-red-6)' />
            <Title order={3} c='red'>
              Error
            </Title>
            <Text c='dimmed' ta='center'>
              {error}
            </Text>
            <Button onClick={() => router.push('/')}>Go to Home</Button>
          </Stack>
        </Paper>
      </Container>
    )
  }

  // Show legal gate if plan is set and documents not yet accepted
  if (plan && !legalAccepted) {
    return (
      <CheckoutLegalGate
        context={plan === 'org' ? 'checkout_org' : 'checkout_individual'}
        organizationId={organizationId}
        accessToken={accessToken || undefined}
        onAllAccepted={handleLegalAccepted}
        onAuthError={handleAuthError}
      />
    )
  }

  // Show redirecting message after legal acceptance
  if (legalAccepted && !checkoutUrl) {
    return (
      <Container size={420} my={40}>
        <Paper withBorder p={30} radius='md'>
          <Stack gap='md' align='center'>
            <Loader size='lg' />
            <Title order={3}>Redirecting to checkout...</Title>
            <Text c='dimmed' ta='center' size='sm'>
              You will be redirected to the payment page shortly.
            </Text>
          </Stack>
        </Paper>
      </Container>
    )
  }

  return (
    <Container size={420} my={40}>
      <Paper withBorder p={30} radius='md'>
        <Stack gap='md' align='center'>
          <Loader size='lg' />
          <Title order={3}>Redirecting to checkout...</Title>
          <Text c='dimmed' ta='center' size='sm'>
            You will be redirected to the payment page shortly.
          </Text>
          {checkoutUrl && (
            <Button component='a' href={checkoutUrl} variant='filled' fullWidth mt='md'>
              Continue to Checkout
            </Button>
          )}
        </Stack>
      </Paper>
    </Container>
  )
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../../messages/${locale}.json`)).default,
    },
  }
}
