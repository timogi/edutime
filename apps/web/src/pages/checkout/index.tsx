import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/router'
import { GetStaticPropsContext } from 'next/types'
import {
  Container,
  Paper,
  Stack,
  Text,
  Title,
  Button,
  Loader,
  Center,
  Alert,
  TextInput,
} from '@mantine/core'
import { useTranslations } from 'next-intl'
import { supabase } from '@/utils/supabase/client'
import { LoadingScreen } from '@/components/LoadingScreen'
import { CheckoutLegalGate } from '@/components/CheckoutLegalGate'
import { IconAlertCircle } from '@tabler/icons-react'

type CheckoutApiResponse = {
  checkoutUrl?: string
  sessionId?: string
  error?: string
}

type BillingCycle = 'annual' | 'daily_test'
type OrganizationCheckoutOption = {
  id: number
  name: string
  seats: number
}

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'An unexpected error occurred'
}

export default function CheckoutPage() {
  const router = useRouter()
  const t = useTranslations('Index')
  const tCheckout = useTranslations('Checkout')
  const [isLoading, setIsLoading] = useState(true)
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [plan, setPlan] = useState<'annual' | 'org' | null>(null)
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual')
  const [qty, setQty] = useState<number | null>(null)
  const [organizationId, setOrganizationId] = useState<number | undefined>(undefined)
  const [needsOrganizationSetup, setNeedsOrganizationSetup] = useState(false)
  const [organizationName, setOrganizationName] = useState('')
  const [autoSelectedOrganization, setAutoSelectedOrganization] =
    useState<OrganizationCheckoutOption | null>(null)
  const [existingUnlicensedOrgCount, setExistingUnlicensedOrgCount] = useState(0)
  const [firstUnlicensedOrg, setFirstUnlicensedOrg] = useState<OrganizationCheckoutOption | null>(null)
  const [isCreatingOrganization, setIsCreatingOrganization] = useState(false)
  const [legalAccepted, setLegalAccepted] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const isCheckoutRequestInFlightRef = useRef(false)
  const hasCheckoutBeenStartedRef = useRef(false)

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
        const billingCycleParam = router.query.billingCycle as string | undefined
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

        const resolvedBillingCycle: BillingCycle =
          billingCycleParam === 'daily_test' ? 'daily_test' : 'annual'
        if (planParam === 'org' && resolvedBillingCycle !== 'annual') {
          setError('Invalid billing cycle for org plan')
          setIsLoading(false)
          return
        }

        if (planParam === 'org' && !orgIdParam) {
          const { data: orgRows, error: orgError } = await supabase
            .from('organization_administrators')
            .select('organization_id, organizations(id, name, seats, is_active)')
            .eq('user_id', user.id)
            .eq('organizations.is_active', true)

          if (orgError) {
            setError(t('checkout-org-load-failed'))
            setIsLoading(false)
            return
          }

          const organizationOptions: OrganizationCheckoutOption[] = (orgRows || [])
            .map((row) => {
              const organization = row.organizations as {
                id: number
                name: string | null
                seats: number | null
              } | null
              if (!organization?.id) return null

              return {
                id: organization.id,
                name: organization.name || `${t('org-license-management-title')} #${organization.id}`,
                seats: organization.seats ?? 3,
              }
            })
            .filter((org): org is OrganizationCheckoutOption => org !== null)

          if (organizationOptions.length > 0) {
            const headers: Record<string, string> = {
              'Content-Type': 'application/json',
            }
            if (session.access_token) {
              headers['Authorization'] = `Bearer ${session.access_token}`
            }

            const orgLicenseChecks = await Promise.all(
              organizationOptions.map(async (org) => {
                try {
                  const response = await fetch(
                    `/api/billing/org-license?organizationId=${encodeURIComponent(String(org.id))}`,
                    {
                      method: 'GET',
                      headers,
                      credentials: 'include',
                    },
                  )
                  const payload = (await response.json()) as {
                    data?: { seatCount: number | null } | null
                  }
                  const hasExistingOrgLicense =
                    response.ok &&
                    payload.data != null &&
                    typeof payload.data.seatCount === 'number' &&
                    payload.data.seatCount >= 3
                  return { org, hasExistingOrgLicense }
                } catch {
                  return { org, hasExistingOrgLicense: false }
                }
              }),
            )

            const licensedOrganizations = orgLicenseChecks
              .filter((check) => check.hasExistingOrgLicense)
              .map((check) => check.org)
            const unlicensedChecks = orgLicenseChecks.filter((check) => !check.hasExistingOrgLicense)
            setExistingUnlicensedOrgCount(unlicensedChecks.length)
            setFirstUnlicensedOrg(unlicensedChecks.length > 0 ? unlicensedChecks[0].org : null)

            if (licensedOrganizations.length > 0) {
              const selectedOrg = licensedOrganizations[0]
              setOrganizationId(selectedOrg.id)
              setAutoSelectedOrganization(selectedOrg)
              setPlan(planParam)
              setBillingCycle(resolvedBillingCycle)
              setQty(qtyParam)
              setNeedsOrganizationSetup(false)
              setIsLoading(false)
              return
            }
          } else {
            setExistingUnlicensedOrgCount(0)
            setFirstUnlicensedOrg(null)
          }

          setPlan(planParam)
          setBillingCycle(resolvedBillingCycle)
          setQty(qtyParam)
          setOrganizationId(undefined)
          setAutoSelectedOrganization(null)
          setNeedsOrganizationSetup(true)
          setIsLoading(false)
          return
        }

        setPlan(planParam)
        setBillingCycle(resolvedBillingCycle)
        setQty(qtyParam)
        setOrganizationId(orgIdParam)
        setAutoSelectedOrganization(null)
        setNeedsOrganizationSetup(false)

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
  }, [router.isReady, router.query, router, redirectToRegister, t])

  const handleAuthError = useCallback(() => {
    redirectToRegister()
  }, [redirectToRegister])

  const handleGoBack = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
      return
    }
    router.push('/')
  }, [router])

  const handleCreateOrganization = async () => {
    if (!plan || plan !== 'org') return
    if (!qty || qty < 3) {
      setError(t('checkout-org-invalid-quantity'))
      return
    }
    if (!organizationName.trim()) {
      setError(t('checkout-org-name-required'))
      return
    }

    setIsCreatingOrganization(true)
    setError(null)
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`
      }

      const response = await fetch('/api/billing/org-license/create-organization', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          name: organizationName.trim(),
          seats: qty,
        }),
      })

      const payload = (await response.json()) as {
        organizationId?: number
        error?: string
      }

      if (!response.ok || !payload.organizationId) {
        throw new Error(payload.error || t('checkout-org-create-failed'))
      }

      setOrganizationId(payload.organizationId)
      setAutoSelectedOrganization(null)
      setNeedsOrganizationSetup(false)
    } catch (creationError: unknown) {
      console.error('Failed to create organization during checkout:', creationError)
      setError(getErrorMessage(creationError))
    } finally {
      setIsCreatingOrganization(false)
    }
  }

  const handleLegalAccepted = async () => {
    if (hasCheckoutBeenStartedRef.current || isCheckoutRequestInFlightRef.current) {
      return
    }

    setLegalAccepted(true)
    isCheckoutRequestInFlightRef.current = true

    const handleCheckoutFailure = (message: string) => {
      const normalizedMessage = message.toLowerCase()
      const userFacingMessage =
        normalizedMessage.includes('internal server error') ||
        normalizedMessage.includes('status 5')
          ? t('checkout-session-unavailable')
          : normalizedMessage.includes('already have an active personal license')
            ? t('checkout-personal-license-already-active')
            : normalizedMessage.includes('organization legal documents must be accepted')
              ? t('checkout-org-legal-required')
          : message

      // Stop auto-looping through legal acceptance and show a dedicated error state instead.
      setCheckoutUrl(null)
      setError(userFacingMessage)
    }

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
          billingCycle,
          qty: qty!,
          organizationId: organizationId,
        }),
      })

      const contentType = response.headers.get('content-type') || ''
      const rawBody = await response.text()
      let data: CheckoutApiResponse = {}

      if (rawBody) {
        if (contentType.includes('application/json')) {
          try {
            data = JSON.parse(rawBody) as CheckoutApiResponse
          } catch (parseError) {
            console.error('Checkout API returned invalid JSON:', {
              status: response.status,
              contentType,
              rawBodyPreview: rawBody.slice(0, 300),
              parseError,
            })
            handleCheckoutFailure('Checkout API returned invalid response. Please try again.')
            return
          }
        } else {
          // Useful in development when Next.js returns an HTML error page instead of JSON.
          console.error('Checkout API returned non-JSON response:', {
            status: response.status,
            contentType,
            rawBodyPreview: rawBody.slice(0, 300),
          })
          handleCheckoutFailure(
            `Checkout API returned non-JSON response (status ${response.status}). Check server logs.`,
          )
          return
        }
      }

      if (!response.ok) {
        if (response.status === 401) {
          redirectToRegister()
          return
        }
        handleCheckoutFailure(data.error || `Failed to create checkout session (status ${response.status})`)
        return
      }

      hasCheckoutBeenStartedRef.current = true
      setCheckoutUrl(data.checkoutUrl ?? null)

      // Auto-redirect to checkout URL after a short delay
      setTimeout(() => {
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl
        }
      }, 2000)
    } catch (error: unknown) {
      console.error('Error creating checkout session:', error)
      if (!hasCheckoutBeenStartedRef.current) {
        handleCheckoutFailure(getErrorMessage(error))
      }
    }
    finally {
      isCheckoutRequestInFlightRef.current = false
    }
  }

  const handleSwitchToNewOrganization = useCallback(() => {
    setOrganizationId(undefined)
    setNeedsOrganizationSetup(true)
    setAutoSelectedOrganization(null)
    setLegalAccepted(false)
    setError(null)
  }, [])

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
              {t('error')}
            </Title>
            <Text c='dimmed' ta='center'>
              {error}
            </Text>
            <Button onClick={handleGoBack}>{t('checkout-go-back')}</Button>
          </Stack>
        </Paper>
      </Container>
    )
  }

  if (plan === 'org' && needsOrganizationSetup) {
    return (
      <Container size={520} my={40}>
        <Paper withBorder p={30} radius='md'>
          <Stack gap='md'>
            <Title order={3}>{t('checkout-org-setup-title')}</Title>
            <Text c='dimmed' size='sm'>
              {t('checkout-org-setup-description')}
            </Text>
            {existingUnlicensedOrgCount > 0 ? (
              <Alert icon={<IconAlertCircle size='1rem' />} color='yellow' variant='light'>
                <Stack gap='sm'>
                  <Text size='sm'>{t('checkout-org-existing-no-license-note', { count: existingUnlicensedOrgCount })}</Text>
                  {firstUnlicensedOrg ? (
                    <Button
                      variant='light'
                      onClick={() =>
                        void router.push(
                          `/app/organization-management?organizationId=${encodeURIComponent(String(firstUnlicensedOrg.id))}`,
                        )
                      }
                    >
                      {t('checkout-org-manage-existing-button')}
                    </Button>
                  ) : null}
                </Stack>
              </Alert>
            ) : null}
            <TextInput
              label={t('checkout-org-name-label')}
              placeholder={t('checkout-org-name-placeholder')}
              value={organizationName}
              onChange={(event) => setOrganizationName(event.currentTarget.value)}
            />
            <Text c='dimmed' size='sm'>
              {t('checkout-org-seat-count-info', { count: qty || 0 })}
            </Text>
            <Button onClick={handleCreateOrganization} loading={isCreatingOrganization}>
              {t('checkout-org-create-button')}
            </Button>
          </Stack>
        </Paper>
      </Container>
    )
  }

  // Show legal gate if plan is set and documents not yet accepted
  if (plan && !legalAccepted) {
    const legalContext = plan === 'org' ? 'checkout_org' : 'checkout_individual'
    return (
      <>
        {plan === 'org' && autoSelectedOrganization ? (
          <Container size={600} my='md'>
            <Alert icon={<IconAlertCircle size='1rem' />} color='blue' variant='light'>
              <Stack gap='xs'>
                <Text size='sm'>
                  {t('checkout-org-existing-org-info', { name: autoSelectedOrganization.name })}
                </Text>
                <Text size='sm' c='dimmed'>
                  {t('checkout-org-seat-count-info', { count: qty || autoSelectedOrganization.seats })}
                </Text>
                <Button variant='light' size='xs' onClick={handleSwitchToNewOrganization}>
                  {t('checkout-org-use-new-org-button')}
                </Button>
              </Stack>
            </Alert>
          </Container>
        ) : null}
        <CheckoutLegalGate
          accessToken={accessToken || undefined}
          legalContext={legalContext}
          organizationId={plan === 'org' ? organizationId : undefined}
          onAllAccepted={handleLegalAccepted}
          onAuthError={handleAuthError}
        />
      </>
    )
  }

  // Show redirecting message after legal acceptance
  if (legalAccepted && !checkoutUrl) {
    return (
      <Container size={420} my={40}>
        <Paper withBorder p={30} radius='md'>
          <Stack gap='md' align='center'>
            <Loader size='lg' />
            <Title order={3}>{tCheckout('redirecting')}</Title>
            <Text c='dimmed' ta='center' size='sm'>
              {tCheckout('redirectingDescription')}
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
          <Title order={3}>{tCheckout('redirecting')}</Title>
          <Text c='dimmed' ta='center' size='sm'>
            {tCheckout('redirectingDescription')}
          </Text>
          {checkoutUrl && (
            <Button component='a' href={checkoutUrl} variant='filled' fullWidth mt='md'>
              {tCheckout('continueToPayment')}
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
