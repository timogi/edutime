import React, { useState, useEffect } from 'react'
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
  SimpleGrid,
} from '@mantine/core'
import { useTranslations } from 'next-intl'
import { useUser } from '@/contexts/UserProvider'
import { IconSettings, IconLogout, IconInfoCircle, IconUsers, IconCheck } from '@tabler/icons-react'
import { showNotification } from '@mantine/notifications'
import { useRouter } from 'next/router'
import { Account } from '@/components/Account/Account'
import { Members } from '@/components/Members/Members'
import { Footer } from '@/components/Footer/Footer'
import { OrgPriceCalculatorModal } from '@/components/Main/OrgPriceCalculatorModal'
import { updateMembership } from '@/utils/supabase/organizations'
import { supabase } from '@/utils/supabase/client'
import { hasActiveEntitlement, hasEverHadTrial } from '@edutime/shared'
import { INDIVIDUAL_ANNUAL_PRICE_CHF } from '@/utils/payments/pricing'
import classes from './NoLicenseView.module.css'
import pricingClasses from '../Main/Pricing.module.css'

export function NoLicenseView() {
  const t = useTranslations('Index')
  const t_noLicense = useTranslations('NoLicense')
  const t_pricing = useTranslations('Pricing')
  const { user, categories, refreshUserData, userEmail, logout, memberships, organizations } =
    useUser()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<'settings' | 'members' | null>(null)
  const [processingInvitation, setProcessingInvitation] = useState<number | null>(null)
  const [isStartingDemo, setIsStartingDemo] = useState(false)
  const [hasUsedDemo, setHasUsedDemo] = useState<boolean | null>(null)
  const [isRefreshingLicense, setIsRefreshingLicense] = useState(false)
  const [orgModalOpened, setOrgModalOpened] = useState(false)

  // Check if user is an administrator
  const isAdministrator = organizations && organizations.length > 0

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
      await updateMembership(organizationId, userEmail || user.email || '', 'active', null)
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
      await updateMembership(organizationId, userEmail || user.email || '', 'rejected', null)
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
            <Button variant='subtle' onClick={() => setActiveSection(null)}>
              ← {t_noLicense('back')}
            </Button>
          </Group>
          <Account userData={user} reloadUserData={refreshUserData} />
        </Stack>
      </Container>
    )
  }

  if (activeSection === 'members') {
    return (
      <Container size={1200} py='xl'>
        <Stack gap='xl'>
          <Group>
            <Button variant='subtle' onClick={() => setActiveSection(null)}>
              ← {t_noLicense('back')}
            </Button>
          </Group>
          <Members
            organizations={organizations}
            userData={user}
            onMembersChanged={refreshUserData}
          />
        </Stack>
      </Container>
    )
  }

  return (
    <>
      <Container size={1000} py='xl'>
        <Stack gap='xl' align='center'>
          <div className={classes.header}>
            <Title order={1} ta='center' mb='md'>
              {t_noLicense('title')}
            </Title>
            <Text size='lg' c='dimmed' ta='center' maw={600}>
              {isAdministrator ? t_noLicense('description-admin') : t_noLicense('description')}
            </Text>
          </div>

          {router.query.checkout === 'pending' && (
            <Alert icon={<IconInfoCircle size={16} />} color='orange' variant='light' w='100%' maw={800}>
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

          {/* Administrator Member Management */}
          {isAdministrator && (
            <Card padding='xl' radius='md' withBorder w='100%' maw={800}>
              <Stack gap='md'>
                <Group justify='space-between' align='center'>
                  <Title order={3}>{t('member-management') || 'Mitgliederverwaltung'}</Title>
                  <Badge color='violet' variant='light' size='lg'>
                    {organizations.length}
                  </Badge>
                </Group>
                <Alert icon={<IconInfoCircle size={16} />} color='violet' variant='light'>
                  <Text size='sm'>
                    {t('member-management-description') ||
                      'Sie sind Administrator einer Organisation. Verwalten Sie die Mitglieder Ihrer Organisation.'}
                  </Text>
                </Alert>
                <Button
                  variant='filled'
                  leftSection={<IconUsers size={18} />}
                  onClick={() => setActiveSection('members')}
                  fullWidth
                  mt='md'
                >
                  {t('manage-members') || 'Mitglieder verwalten'}
                </Button>
              </Stack>
            </Card>
          )}

          {/* Pending Invitations */}
          {pendingInvitations.length > 0 && (
            <Card padding='xl' radius='md' withBorder w='100%' maw={800}>
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
              <OrgPriceCalculatorModal
                opened={orgModalOpened}
                onClose={() => setOrgModalOpened(false)}
              />

              <SimpleGrid
                cols={{ base: 1, md: hasUsedDemo === false ? 3 : 2 }}
                spacing='lg'
                w='100%'
              >
                {/* Demo Card - Only show if user hasn't used a trial */}
                {hasUsedDemo === false && (
                  <Card
                    className={pricingClasses.pricingCard}
                    padding='xl'
                    radius='md'
                    withBorder
                    style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
                  >
                    <Stack gap='lg' h='100%' justify='space-between' style={{ flex: 1 }}>
                      <div>
                        <Badge size='lg' variant='light' color='violet' mb='sm'>
                          {t_noLicense('demo-badge')}
                        </Badge>
                        <Title order={3} className={pricingClasses.planTitle}>
                          {t_pricing('demoTitle')}
                        </Title>
                        <Text size='sm' c='dimmed' mt='xs'>
                          {t_pricing('demoSubtitle')}
                        </Text>
                      </div>

                      <Divider />

                      <Stack gap='sm' className={pricingClasses.features} style={{ flex: 1 }}>
                        <Group gap='sm' align='flex-start'>
                          <IconCheck size={20} className={pricingClasses.checkIcon} />
                          <Text size='sm'>{t_pricing('demoFeature1')}</Text>
                        </Group>
                        <Group gap='sm' align='flex-start'>
                          <IconCheck size={20} className={pricingClasses.checkIcon} />
                          <Text size='sm'>{t_pricing('demoFeature2')}</Text>
                        </Group>
                        <Group gap='sm' align='flex-start'>
                          <IconCheck size={20} className={pricingClasses.checkIcon} />
                          <Text size='sm'>{t_pricing('demoFeature3')}</Text>
                        </Group>
                        <Group gap='sm' align='flex-start'>
                          <IconCheck size={20} className={pricingClasses.checkIcon} />
                          <Text size='sm'>{t_pricing('demoFeature4')}</Text>
                        </Group>
                      </Stack>

                      <Button
                        onClick={handleStartDemo}
                        size='lg'
                        variant='filled'
                        fullWidth
                        mt='auto'
                        loading={isStartingDemo}
                        disabled={isStartingDemo}
                      >
                        {t_noLicense('start-demo')}
                      </Button>
                    </Stack>
                  </Card>
                )}

                {/* Purchase License Card */}
                <Card
                  className={`${pricingClasses.pricingCard} ${pricingClasses.popularCard}`}
                  padding='xl'
                  radius='lg'
                  withBorder
                  shadow='xl'
                  style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
                >
                  <Stack gap='lg' h='100%' justify='space-between' style={{ flex: 1 }}>
                    <div>
                      <Badge size='lg' variant='filled' color='violet' mb='sm'>
                        {t_pricing('mostPopular')}
                      </Badge>
                      <Title order={3} className={pricingClasses.planTitle}>
                        {t_pricing('planName')}
                      </Title>
                    </div>

                    <div className={pricingClasses.priceSection}>
                      <Group gap='xs' align='flex-start' justify='center' wrap='nowrap'>
                        <Text size='3.5rem' fw={700} className={pricingClasses.price} lh={1}>
                          {INDIVIDUAL_ANNUAL_PRICE_CHF}
                        </Text>
                        <Text size='lg' c='dimmed' mt='md' lh={1}>
                          CHF
                        </Text>
                      </Group>
                      <Text size='sm' c='dimmed' mt='xs' ta='center'>
                        {t_pricing('perYear')}
                      </Text>
                    </div>

                    <Divider />

                    <Stack gap='sm' className={pricingClasses.features}>
                      <Group gap='sm' align='flex-start'>
                        <IconCheck size={20} className={pricingClasses.checkIcon} />
                        <Text size='sm'>{t_pricing('feature1')}</Text>
                      </Group>
                      <Group gap='sm' align='flex-start'>
                        <IconCheck size={20} className={pricingClasses.checkIcon} />
                        <Text size='sm'>{t_pricing('feature2')}</Text>
                      </Group>
                      <Group gap='sm' align='flex-start'>
                        <IconCheck size={20} className={pricingClasses.checkIcon} />
                        <Text size='sm'>{t_pricing('feature3')}</Text>
                      </Group>
                      <Group gap='sm' align='flex-start'>
                        <IconCheck size={20} className={pricingClasses.checkIcon} />
                        <Text size='sm'>{t_pricing('feature4')}</Text>
                      </Group>
                    </Stack>

                    <Button onClick={handlePurchase} size='lg' variant='filled' fullWidth mt='auto'>
                      {t_noLicense('purchase-now')}
                    </Button>
                  </Stack>
                </Card>

                {/* Multiple Licenses Card */}
                <Card
                  className={pricingClasses.pricingCard}
                  padding='xl'
                  radius='md'
                  withBorder
                  style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
                >
                  <Stack gap='lg' h='100%' justify='space-between' style={{ flex: 1 }}>
                    <div>
                      <Badge size='lg' variant='light' color='violet' mb='sm'>
                        {t_pricing('multipleLicenses')}
                      </Badge>
                      <Title order={3} className={pricingClasses.planTitle}>
                        {t_pricing('multipleLicensesTitle')}
                      </Title>
                    </div>

                    <div className={pricingClasses.priceSection}>
                      <Group gap='xs' align='flex-start' justify='center' wrap='nowrap'>
                        <Text size='3rem' fw={700} className={pricingClasses.price} lh={1}>
                          3+
                        </Text>
                        <Text size='lg' c='dimmed' mt='md' lh={1}>
                          {t_pricing('licenses')}
                        </Text>
                      </Group>
                    </div>

                    <Divider />

                    <Stack gap='sm' className={pricingClasses.features}>
                      <Group gap='sm' align='flex-start'>
                        <IconCheck size={20} className={pricingClasses.checkIcon} />
                        <Text size='sm'>{t_pricing('multipleFeature1')}</Text>
                      </Group>
                      <Group gap='sm' align='flex-start'>
                        <IconCheck size={20} className={pricingClasses.checkIcon} />
                        <Text size='sm'>{t_pricing('multipleFeature2')}</Text>
                      </Group>
                      <Group gap='sm' align='flex-start'>
                        <IconCheck size={20} className={pricingClasses.checkIcon} />
                        <Text size='sm'>{t_pricing('multipleFeature3')}</Text>
                      </Group>
                      <Group gap='sm' align='flex-start'>
                        <IconCheck size={20} className={pricingClasses.checkIcon} />
                        <Text size='sm'>{t_pricing('multipleFeature4')}</Text>
                      </Group>
                    </Stack>

                    <Button
                      onClick={() => setOrgModalOpened(true)}
                      size='lg'
                      variant='filled'
                      fullWidth
                      mt='auto'
                    >
                      {t_pricing('requestQuote')}
                    </Button>
                  </Stack>
                </Card>
              </SimpleGrid>
            </>
          )}

          <Divider w='100%' />

          {/* User Info and Actions */}
          <Card className={classes.accountCard} padding='xl' radius='md' withBorder w='100%'>
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
