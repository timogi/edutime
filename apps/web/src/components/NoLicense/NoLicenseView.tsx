import React, { useState, useEffect, useMemo } from 'react'
import {
  Container,
  Title,
  Text,
  Card,
  Stack,
  Button,
  Badge,
  Group,
  Divider,
  Alert,
  Loader,
  Select,
} from '@mantine/core'
import { useTranslations } from 'next-intl'
import { useUser } from '@/contexts/UserProvider'
import { IconSettings, IconLogout, IconInfoCircle, IconAlertTriangle } from '@tabler/icons-react'
import { showNotification } from '@mantine/notifications'
import { useRouter } from 'next/router'
import { Account } from '@/components/Account/Account'
import { Footer } from '@/components/Footer/Footer'
import { PricingCards } from '@/components/Main/Pricing'
import { acceptOrganizationInvite, rejectOrganizationInvite } from '@/utils/supabase/organizations'
import { supabase } from '@/utils/supabase/client'
import { hasActiveEntitlement, hasEverHadTrial } from '@edutime/shared'
import classes from './NoLicenseView.module.css'

type OrgBillingGateStatus =
  | 'idle'
  | 'loading'
  | 'needs_checkout'
  | 'licensed_no_seat'
  | 'suspended'

export function NoLicenseView() {
  const t = useTranslations('Index')
  const t_noLicense = useTranslations('NoLicense')
  const {
    user,
    categories,
    refreshUserData,
    userEmail,
    logout,
    memberships,
    organizations,
    hasActiveSubscription,
  } = useUser()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<'settings' | null>(null)
  const [processingInvitation, setProcessingInvitation] = useState<number | null>(null)
  const [isStartingDemo, setIsStartingDemo] = useState(false)
  const [hasUsedDemo, setHasUsedDemo] = useState<boolean | null>(null)
  const [isRefreshingLicense, setIsRefreshingLicense] = useState(false)
  const [orgBillingGate, setOrgBillingGate] = useState<OrgBillingGateStatus>('idle')

  // Check if user is an administrator
  const isAdministrator = organizations && organizations.length > 0
  const isOrgAdminWithoutActiveSubscription = isAdministrator && !hasActiveSubscription
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)

  useEffect(() => {
    if (!organizations.length) {
      setSelectedOrgId(null)
      return
    }
    setSelectedOrgId((prev) => {
      if (prev && organizations.some((o) => String(o.id) === prev)) return prev
      return String(organizations[0].id)
    })
  }, [organizations])

  const selectedOrganization = useMemo(() => {
    if (!organizations.length) return null
    if (selectedOrgId) {
      const match = organizations.find((o) => String(o.id) === selectedOrgId)
      if (match) return match
    }
    return organizations[0]
  }, [organizations, selectedOrgId])

  useEffect(() => {
    if (!isOrgAdminWithoutActiveSubscription || !selectedOrganization?.id) {
      setOrgBillingGate('idle')
      return
    }

    setOrgBillingGate('loading')
    let cancelled = false

    const loadOrgBilling = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session?.access_token) {
          if (!cancelled) setOrgBillingGate('needs_checkout')
          return
        }

        const response = await fetch(
          `/api/billing/org-license?organizationId=${selectedOrganization.id}`,
          {
            credentials: 'include',
            headers: { Authorization: `Bearer ${session.access_token}` },
          },
        )

        if (!response.ok) {
          if (!cancelled) setOrgBillingGate('needs_checkout')
          return
        }

        const payload = (await response.json()) as {
          data?: { subscriptionStatus?: string } | null
        }

        if (cancelled) return

        const status = payload.data?.subscriptionStatus
        if (status === 'active' || status === 'active_unpaid') {
          setOrgBillingGate('licensed_no_seat')
        } else if (status === 'suspended') {
          setOrgBillingGate('suspended')
        } else {
          setOrgBillingGate('needs_checkout')
        }
      } catch (error) {
        console.error('Failed to load org billing status for no-license view:', error)
        if (!cancelled) setOrgBillingGate('needs_checkout')
      }
    }

    void loadOrgBilling()
    return () => {
      cancelled = true
    }
  }, [isOrgAdminWithoutActiveSubscription, selectedOrganization?.id])

  const orgBillingUnresolved =
    isOrgAdminWithoutActiveSubscription &&
    (orgBillingGate === 'idle' || orgBillingGate === 'loading')


  // Check if user has ever had a trial on component mount
  useEffect(() => {
    const checkTrialStatus = async () => {
      if (user?.user_id) {
        try {
          const hasTrial = await hasEverHadTrial(supabase, user.user_id)
          setHasUsedDemo(hasTrial)
        } catch (error) {
          console.error('Error checking trial status:', error)
          setHasUsedDemo(false) // Default to showing demo option on error
        }
      }
    }

    checkTrialStatus()
  }, [user?.user_id])

  if (!user) return null

  // Filter for pending invitations
  const pendingInvitations =
    memberships?.filter((membership) => membership.status === 'invited') || []

  const handleAcceptInvitation = async (organizationId: number) => {
    setProcessingInvitation(organizationId)
    try {
      await acceptOrganizationInvite(organizationId)
      await refreshUserData()
      showNotification({
        title: t('success') || 'Erfolg',
        message: t('invitation-accepted') || 'Einladung angenommen',
        color: 'green',
      })
      // Redirect to /app after accepting invitation
      router.replace('/app')
    } catch (error) {
      showNotification({
        title: t('error') || 'Fehler',
        message: t('invitation-accept-failed') || 'Einladung konnte nicht angenommen werden',
        color: 'red',
      })
      setProcessingInvitation(null)
    }
  }

  const handleRejectInvitation = async (organizationId: number) => {
    setProcessingInvitation(organizationId)
    try {
      await rejectOrganizationInvite(organizationId)
      await refreshUserData()
      showNotification({
        title: t('success') || 'Erfolg',
        message: t('invitation-rejected') || 'Einladung abgelehnt',
        color: 'green',
      })
    } catch (error) {
      showNotification({
        title: t('error') || 'Fehler',
        message: t('invitation-reject-failed') || 'Einladung konnte nicht abgelehnt werden',
        color: 'red',
      })
    } finally {
      setProcessingInvitation(null)
    }
  }

  const handleStartDemo = async () => {
    setIsStartingDemo(true)
    try {
      // Get the current session to use for authentication
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session || !session.access_token) {
        showNotification({
          title: t('error') || 'Fehler',
          message: 'Unauthorized - Please log in again',
          color: 'red',
        })
        setIsStartingDemo(false)
        return
      }

      // Call the API route to start the demo
      // Send the access token in the Authorization header for reliable authentication
      const response = await fetch('/api/users/start-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`, // Send access token directly
        },
        credentials: 'include', // Also send cookies as fallback
        body: JSON.stringify({ user_id: user.user_id }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('API error response:', data)
        throw new Error(data.error || 'Failed to start demo')
      }

      // Check if the returned entitlement is a new trial or an existing one
      // If valid_from is older than 5 seconds, it's an existing trial
      if (data.entitlement) {
        const validFrom = new Date(data.entitlement.valid_from)
        const now = new Date()
        const secondsSinceCreation = (now.getTime() - validFrom.getTime()) / 1000

        // If the trial was created more than 5 seconds ago, it's an existing trial
        if (secondsSinceCreation > 5) {
          setHasUsedDemo(true) // Update state to hide the demo card
          showNotification({
            title: t_noLicense('demo-already-used') || 'Demo bereits verwendet',
            message:
              t_noLicense('demo-already-used-message') ||
              'Sie haben Ihre Demo bereits verwendet. Bitte erwerben Sie eine Lizenz, um EduTime weiterhin zu nutzen.',
            color: 'orange',
          })
          setIsStartingDemo(false)
          return
        }
      }

      // Refresh user data to update subscription status
      await refreshUserData()

      // Wait for entitlement to be active before redirecting
      // Poll the entitlement status with retries to handle async updates
      let retries = 0
      const maxRetries = 10
      let isActive = false

      while (retries < maxRetries && !isActive) {
        // Small delay to allow the database to update
        await new Promise((resolve) => setTimeout(resolve, 200))

        try {
          isActive = await hasActiveEntitlement(supabase, user.user_id)
          if (isActive) {
            break
          }
        } catch (error) {
          console.error('Error checking entitlement status:', error)
        }

        retries++
      }

      if (isActive) {
        showNotification({
          title: t_noLicense('demo-started') || 'Demo gestartet',
          message: t_noLicense('demo-started-message') || 'Ihre 30-tägige Demo wurde gestartet',
          color: 'green',
        })

        // Redirect to app after successful demo start
        router.replace('/app/time-tracking')
      } else {
        // If still not active after retries, refresh the page to trigger the redirect
        // This handles edge cases where the state hasn't updated yet
        window.location.href = '/app/time-tracking'
      }
    } catch (error) {
      console.error('Error starting demo:', error)
      showNotification({
        title: t('error') || 'Fehler',
        message:
          error instanceof Error
            ? error.message
            : t_noLicense('demo-start-failed') || 'Demo konnte nicht gestartet werden',
        color: 'red',
      })
    } finally {
      setIsStartingDemo(false)
    }
  }

  const handlePurchase = () => {
    router.push('/checkout?plan=annual')
  }

  const handleRefreshLicenseStatus = async () => {
    setIsRefreshingLicense(true)
    try {
      await refreshUserData()
      const isActive = await hasActiveEntitlement(supabase, user.user_id)

      if (isActive) {
        router.replace('/app/time-tracking')
        return
      }

      showNotification({
        title: t_noLicense('activationPendingTitle'),
        message: t_noLicense('activationPendingMessage'),
        color: 'orange',
      })
    } catch (error) {
      console.error('Error refreshing license status:', error)
      showNotification({
        title: t('error') || 'Fehler',
        message: t_noLicense('activationRefreshFailed'),
        color: 'red',
      })
    } finally {
      setIsRefreshingLicense(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (activeSection === 'settings') {
    return (
      <Container size={1200} py='xl'>
        <Stack gap='xl'>
          <Group>
            <Button variant='subtle' onClick={() => void router.push('/app/settings')}>
              ← {t_noLicense('back')}
            </Button>
          </Group>
          <Account userData={user} reloadUserData={refreshUserData} />
        </Stack>
      </Container>
    )
  }

  const handleOpenOrganizationManagement = () => {
    if (!selectedOrganization) return
    router.push(`/app/organization-management?organizationId=${selectedOrganization.id}`)
  }

  const handleOpenMembersPage = () => {
    if (!selectedOrganization) return
    void router.push(`/app/members?organizationId=${selectedOrganization.id}`)
  }

  const showOrgCheckoutPendingAlert =
    isOrgAdminWithoutActiveSubscription &&
    router.query.checkout === 'pending' &&
    router.query.plan === 'org'
  const showIndividualCheckoutPendingAlert =
    router.query.checkout === 'pending' && !showOrgCheckoutPendingAlert

  return (
    <>
      <Container size={1200} py='xl'>
        <Stack gap='xl' align='center'>
          <div className={classes.header}>
            <Title order={1} ta='center' mb='md'>
              {t_noLicense('title')}
            </Title>
            {!isOrgAdminWithoutActiveSubscription && (
              <Text size='lg' c='dimmed' ta='center' maw={isOrgAdminWithoutActiveSubscription ? 700 : 600}>
                {isAdministrator ? t_noLicense('description-admin') : t_noLicense('description')}
              </Text>
            )}
          </div>

          {showOrgCheckoutPendingAlert && (
            <Alert
              icon={<IconInfoCircle size={16} />}
              color='orange'
              variant='light'
              w='100%'
            >
              <Stack gap='xs'>
                <Text size='sm'>{t_noLicense('activationPendingMessage')}</Text>
                <Button
                  variant='light'
                  onClick={handleRefreshLicenseStatus}
                  loading={isRefreshingLicense}
                  disabled={isRefreshingLicense}
                >
                  {t_noLicense('refreshActivation')}
                </Button>
              </Stack>
            </Alert>
          )}

          {showIndividualCheckoutPendingAlert && (
            <Alert icon={<IconInfoCircle size={16} />} color='orange' variant='light' w='100%'>
              <Stack gap='xs'>
                <Text size='sm'>{t_noLicense('activationPendingMessage')}</Text>
                <Button
                  variant='light'
                  onClick={handleRefreshLicenseStatus}
                  loading={isRefreshingLicense}
                  disabled={isRefreshingLicense}
                >
                  {t_noLicense('refreshActivation')}
                </Button>
              </Stack>
            </Alert>
          )}

          {isOrgAdminWithoutActiveSubscription && (
            <Card padding='xl' radius='md' withBorder w='100%'>
              <Stack gap='md' align='stretch'>
                {orgBillingUnresolved ? (
                  <>
                    <Title order={3}>{t_noLicense('org-billing-status-loading')}</Title>
                    <Loader size='sm' />
                  </>
                ) : (
                  <>
                    <Title order={3}>
                      {orgBillingGate === 'licensed_no_seat'
                        ? t_noLicense('org-admin-licensed-card-title')
                        : t_noLicense('org-no-license-title')}
                    </Title>
                    {organizations.length > 1 ? (
                      <Select
                        label={t('org-license-organization')}
                        data={organizations.map((org) => ({
                          value: String(org.id),
                          label: org.is_active
                            ? org.name
                            : `${org.name} (${t_noLicense('org-select-inactive-suffix')})`,
                        }))}
                        value={selectedOrgId}
                        onChange={(value) => {
                          if (value) setSelectedOrgId(value)
                        }}
                        w='100%'
                      />
                    ) : (
                      <Text size='sm' fw={500}>
                        {selectedOrganization?.name ?? '—'}
                      </Text>
                    )}
                    {selectedOrganization &&
                    !selectedOrganization.is_active &&
                    !selectedOrganization.scheduled_deletion_at ? (
                      <Alert icon={<IconAlertTriangle size={16} />} color='orange' variant='light'>
                        <Text size='sm'>{t_noLicense('org-inactive-billing-hint')}</Text>
                      </Alert>
                    ) : null}
                    <Stack gap='sm' w='100%' mt='xs'>
                      {orgBillingGate === 'licensed_no_seat' ? (
                        <>
                          <Button variant='filled' fullWidth onClick={handleOpenMembersPage}>
                            {t('no-license-manage-members-button')}
                          </Button>
                          <Text size='xs' c='dimmed' ta='center'>
                            {t('no-license-manage-members-hint')}
                          </Text>
                        </>
                      ) : null}
                      <Button variant='light' fullWidth onClick={handleOpenOrganizationManagement}>
                        {t('org-organization-settings-button')}
                      </Button>
                    </Stack>
                  </>
                )}
              </Stack>
            </Card>
          )}

          {/* Pending Invitations */}
          {pendingInvitations.length > 0 && (
            <Card padding='xl' radius='md' withBorder w='100%'>
              <Stack gap='md'>
                <Group justify='space-between' align='center'>
                  <Title order={3}>{t('pending-invitations') || 'Offene Einladungen'}</Title>
                  <Badge color='violet' variant='light' size='lg'>
                    {pendingInvitations.length}
                  </Badge>
                </Group>
                <Alert icon={<IconInfoCircle size={16} />} color='violet' variant='light'>
                  <Text size='sm'>
                    {t('pending-invitations-description') ||
                      'Sie haben offene Einladungen von Organisationen. Wenn Sie eine Einladung annehmen, erhalten Sie Zugang zu EduTime.'}
                  </Text>
                </Alert>
                <Stack gap='sm'>
                  {pendingInvitations.map((membership) => (
                    <Card key={membership.id} padding='md' radius='md' withBorder>
                      <Group justify='space-between' align='center'>
                        <Stack gap={4}>
                          <Text fw={500} size='lg'>
                            {membership.name}
                          </Text>
                          <Badge color='violet' variant='light'>
                            {t('invited')}
                          </Badge>
                        </Stack>
                        <Button.Group>
                          <Button
                            variant='filled'
                            onClick={() => handleAcceptInvitation(membership.id)}
                            loading={processingInvitation === membership.id}
                            disabled={processingInvitation !== null}
                          >
                            {t('accept')}
                          </Button>
                          <Button
                            variant='default'
                            onClick={() => handleRejectInvitation(membership.id)}
                            loading={processingInvitation === membership.id}
                            disabled={processingInvitation !== null}
                          >
                            {t('reject')}
                          </Button>
                        </Button.Group>
                      </Group>
                    </Card>
                  ))}
                </Stack>
              </Stack>
            </Card>
          )}

          {/* Pricing Cards - hide for administrators who manage members */}
          {!isAdministrator && (
            <>
              <PricingCards
                embedded
                hideDemoCard={hasUsedDemo !== false}
                onDemoClick={handleStartDemo}
                onStandardClick={handlePurchase}
                demoButtonLabel={t_noLicense('start-demo')}
                standardButtonLabel={t_noLicense('purchase-now')}
              />
            </>
          )}

          {isAdministrator ? (
            <Divider
              w='100%'
              label={t_noLicense('personal-license-section-label')}
              labelPosition='center'
              my='lg'
            />
          ) : null}

          <Divider w='100%' my='md' />

          {/* User Info and Actions */}
          <Card padding='xl' radius='md' withBorder w='100%'>
            <Stack gap='lg'>
              {/* Email Display */}
              <Group justify='space-between'>
                <Stack gap='xs'>
                  <Text size='sm' c='dimmed'>
                    {t('email')}
                  </Text>
                  <Text size='lg' fw={500}>
                    {userEmail || user.email}
                  </Text>
                </Stack>
              </Group>

              <Divider />

              {/* Settings and Logout Buttons */}
              <Group justify='space-between'>
                <Button
                  variant='subtle'
                  leftSection={<IconSettings size={18} />}
                  onClick={() => setActiveSection('settings')}
                  size='md'
                >
                  {t_noLicense('settings')}
                </Button>
                <Button
                  variant='subtle'
                  color='red'
                  leftSection={<IconLogout size={18} />}
                  onClick={handleLogout}
                  size='md'
                >
                  {t('logout')}
                </Button>
              </Group>
            </Stack>
          </Card>
        </Stack>
      </Container>
      <Footer />
    </>
  )
}
