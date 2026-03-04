import React, { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Group,
  Modal,
  NumberInput,
  Paper,
  Select,
  Stack,
  Table,
  Text,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import { useUser } from '@/contexts/UserProvider'
import { supabase } from '@/utils/supabase/client'

interface LicenseManagementSubscription {
  id: string
  status: string
  cancel_at_period_end: boolean
  canceled_at: string | null
  current_period_start: string | null
  current_period_end: string | null
  currency: string
  amount_cents: number
}

interface LicenseManagementInvoice {
  id: string
  amount_cents: number
  currency: string
  status: string
  provider_invoice_id: string | null
  paid_at: string | null
  created_at: string
}

interface LicenseManagementData {
  subscription: LicenseManagementSubscription | null
  invoices: LicenseManagementInvoice[]
}

interface OrgBillingStatusData {
  subscriptionId: string
  subscriptionStatus: string
  amountCents: number
  currency: string
  seatCount: number | null
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  graceDays: number
  suspendAt: string | null
  invoiceId: string | null
  invoiceStatus: string | null
  invoiceDueDate: string | null
  invoicePaidAt: string | null
  payrexxGatewayLink: string | null
  checkoutReferenceId: string | null
  responsibleEmail: string | null
}

export default function LicenseManagementPage() {
  const t = useTranslations('Index')
  const router = useRouter()
  const { user, organizations } = useUser()
  const [licenseManagementData, setLicenseManagementData] = useState<LicenseManagementData | null>(null)
  const [isLoadingLicenseManagement, setIsLoadingLicenseManagement] = useState(false)
  const [isCancelingSubscription, setIsCancelingSubscription] = useState(false)
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null)
  const [orgSeatCount, setOrgSeatCount] = useState<number>(3)
  const [orgBillingStatus, setOrgBillingStatus] = useState<OrgBillingStatusData | null>(null)
  const [isLoadingOrgBilling, setIsLoadingOrgBilling] = useState(false)
  const [isCreatingOrgCheckout, setIsCreatingOrgCheckout] = useState(false)
  const [cancelModalOpened, { open: openCancelModal, close: closeCancelModal }] = useDisclosure(false)

  const formatDate = (value: string | null) => {
    if (!value) return t('license-unlimited')
    return new Date(value).toLocaleDateString(router.locale || 'de')
  }

  const formatAmount = (amountCents: number, currency: string) => {
    return new Intl.NumberFormat(router.locale || 'de-CH', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amountCents / 100)
  }

  const getInvoiceStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
      case 'open':
      case 'draft':
      case 'cancelled':
      case 'failed':
        return t(`license-management-history-status-${status}`)
      default:
        return t('license-management-history-status-unknown')
    }
  }

  const getOrgSubscriptionStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return t('org-license-status-active-paid')
      case 'active_unpaid':
        return t('org-license-status-active-unpaid')
      case 'suspended':
        return t('org-license-status-suspended')
      default:
        return t('license-management-history-status-unknown')
    }
  }

  const getOrgSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green'
      case 'active_unpaid':
        return 'orange'
      case 'suspended':
        return 'red'
      default:
        return 'gray'
    }
  }

  const getAuthenticatedRequestInit = useCallback(
    async (init?: Omit<RequestInit, 'headers' | 'credentials'>): Promise<RequestInit> => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      }

      return {
        ...init,
        headers,
        credentials: 'include',
      }
    },
    [],
  )

  const loadLicenseManagementData = useCallback(async () => {
    setIsLoadingLicenseManagement(true)
    try {
      const requestInit = await getAuthenticatedRequestInit()
      const response = await fetch('/api/billing/personal-subscription', requestInit)
      const payload = (await response.json()) as LicenseManagementData & { error?: string }

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to fetch license management data')
      }

      setLicenseManagementData(payload)
    } catch (error) {
      console.error('Error loading license management data:', error)
      notifications.show({
        title: t('error'),
        message: t('license-management-cancel-error'),
        color: 'red',
      })
    } finally {
      setIsLoadingLicenseManagement(false)
    }
  }, [getAuthenticatedRequestInit, t])

  const loadOrgBillingData = useCallback(
    async (organizationId: string) => {
      setIsLoadingOrgBilling(true)
      try {
        const requestInit = await getAuthenticatedRequestInit()
        const response = await fetch(
          `/api/billing/org-license?organizationId=${encodeURIComponent(organizationId)}`,
          requestInit,
        )
        const payload = (await response.json()) as {
          data?: OrgBillingStatusData | null
          error?: string
        }

        if (!response.ok) {
          throw new Error(payload.error || 'Failed to fetch org billing data')
        }

        setOrgBillingStatus(payload.data || null)
        if (payload.data?.seatCount && payload.data.seatCount >= 3) {
          setOrgSeatCount(payload.data.seatCount)
        }
      } catch (error) {
        console.error('Error loading org billing data:', error)
        notifications.show({
          title: t('error'),
          message: t('org-license-load-error'),
          color: 'red',
        })
      } finally {
        setIsLoadingOrgBilling(false)
      }
    },
    [getAuthenticatedRequestInit, t],
  )

  const createOrRenewOrgCheckout = useCallback(async () => {
    if (!selectedOrganizationId) {
      notifications.show({
        title: t('error'),
        message: t('org-license-select-org'),
        color: 'red',
      })
      return
    }
    if (!orgSeatCount || orgSeatCount < 3) {
      notifications.show({
        title: t('error'),
        message: t('org-license-seat-min'),
        color: 'red',
      })
      return
    }

    setIsCreatingOrgCheckout(true)
    try {
      const requestInit = await getAuthenticatedRequestInit({
        method: 'POST',
        body: JSON.stringify({
          organizationId: Number(selectedOrganizationId),
          quantity: orgSeatCount,
        }),
      })
      const response = await fetch('/api/billing/org-license', requestInit)
      const payload = (await response.json()) as {
        checkoutUrl?: string
        error?: string
      }

      if (!response.ok || !payload.checkoutUrl) {
        throw new Error(payload.error || 'Failed to create org checkout')
      }

      notifications.show({
        title: t('org-license-checkout-created-title'),
        message: t('org-license-checkout-created-message'),
        color: 'green',
      })

      window.location.href = payload.checkoutUrl
    } catch (error) {
      console.error('Error creating org checkout:', error)
      notifications.show({
        title: t('error'),
        message: t('org-license-checkout-error'),
        color: 'red',
      })
    } finally {
      setIsCreatingOrgCheckout(false)
    }
  }, [getAuthenticatedRequestInit, orgSeatCount, selectedOrganizationId, t])

  const handleCancelAtPeriodEnd = async () => {
    setIsCancelingSubscription(true)
    try {
      const requestInit = await getAuthenticatedRequestInit({
        method: 'POST',
      })
      const response = await fetch('/api/billing/personal-subscription/cancel', requestInit)
      const payload = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to cancel subscription')
      }

      notifications.show({
        title: t('license-management-title'),
        message: t('license-management-cancel-success'),
        color: 'green',
      })
      closeCancelModal()
      await loadLicenseManagementData()
    } catch (error) {
      console.error('Error cancelling personal subscription:', error)
      notifications.show({
        title: t('error'),
        message: t('license-management-cancel-error'),
        color: 'red',
      })
    } finally {
      setIsCancelingSubscription(false)
    }
  }

  useEffect(() => {
    if (!user?.user_id) return
    void loadLicenseManagementData()
  }, [user?.user_id, loadLicenseManagementData])

  useEffect(() => {
    if (!organizations || organizations.length === 0) {
      setSelectedOrganizationId(null)
      return
    }

    setSelectedOrganizationId((current) =>
      current && organizations.some((org) => String(org.id) === current)
        ? current
        : String(organizations[0].id),
    )
  }, [organizations])

  useEffect(() => {
    if (!selectedOrganizationId) {
      setOrgBillingStatus(null)
      return
    }
    void loadOrgBillingData(selectedOrganizationId)
  }, [selectedOrganizationId, loadOrgBillingData])

  if (!user) return null

  return (
    <Container size={1000} py='xl'>
      <Modal
        opened={cancelModalOpened}
        onClose={closeCancelModal}
        title={t('license-management-cancel-confirm-title')}
        centered
        styles={{
          title: {
            color: 'var(--mantine-color-text)',
            fontWeight: 600,
          },
          content: {
            backgroundColor: 'var(--mantine-color-body)',
          },
          header: {
            backgroundColor: 'var(--mantine-color-body)',
          },
        }}
      >
        <Stack gap='sm'>
          <Text size='sm' c='dimmed'>
            {t('license-management-cancel-confirm-message')}
          </Text>
          <Group justify='flex-end'>
            <Button variant='default' onClick={closeCancelModal}>
              {t('keep-subscription')}
            </Button>
            <Button color='red' onClick={handleCancelAtPeriodEnd} loading={isCancelingSubscription}>
              {t('license-management-cancel-confirm-action')}
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Stack gap='lg'>
        <Group>
          <Button variant='subtle' onClick={() => router.push('/app/settings')}>
            ← {t('back')}
          </Button>
        </Group>

        <Card radius='md' withBorder>
          <Stack gap='sm' p='lg'>
            <Text size='xl'>{t('license-management-title')}</Text>
            <Text size='sm' c='dimmed'>
              {t('license-management-description')}
            </Text>

            {isLoadingLicenseManagement ? (
              <Text c='dimmed'>{t('license-management-loading')}</Text>
            ) : !licenseManagementData?.subscription ? (
              <Text c='dimmed'>{t('license-management-empty')}</Text>
            ) : (
              <Stack gap='md'>
                <Paper withBorder radius='md' p='md'>
                  <Stack gap='xs'>
                    <Group justify='space-between' align='flex-start'>
                      <Text fw={600}>{t('license-kind-personal')}</Text>
                      <Badge
                        color={licenseManagementData.subscription.cancel_at_period_end ? 'orange' : 'green'}
                        variant='light'
                      >
                        {licenseManagementData.subscription.cancel_at_period_end
                          ? t('license-management-status-cancel-at-period-end')
                          : t('license-management-status-active')}
                      </Badge>
                    </Group>
                    <Text size='sm' c='dimmed'>
                      {t('license-management-current-period-end')}:{' '}
                      {formatDate(licenseManagementData.subscription.current_period_end)}
                    </Text>
                    {licenseManagementData.subscription.canceled_at ? (
                      <Text size='sm' c='dimmed'>
                        {t('license-management-canceled-at')}:{' '}
                        {formatDate(licenseManagementData.subscription.canceled_at)}
                      </Text>
                    ) : null}
                    {!licenseManagementData.subscription.cancel_at_period_end ? (
                      <Group justify='flex-start' mt='xs'>
                        <Button color='red' variant='light' onClick={openCancelModal}>
                          {t('license-management-cancel-button')}
                        </Button>
                      </Group>
                    ) : null}
                  </Stack>
                </Paper>

                <Text size='lg' fw={600}>
                  {t('license-management-history-title')}
                </Text>

                {licenseManagementData.invoices.length === 0 ? (
                  <Text c='dimmed'>{t('license-management-history-empty')}</Text>
                ) : (
                  <Table striped highlightOnHover withTableBorder>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>{t('license-management-history-date')}</Table.Th>
                        <Table.Th>{t('license-management-history-amount')}</Table.Th>
                        <Table.Th>{t('license-management-history-status')}</Table.Th>
                        <Table.Th>{t('license-management-history-reference')}</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {licenseManagementData.invoices.map((invoice) => (
                        <Table.Tr key={invoice.id}>
                          <Table.Td>{formatDate(invoice.paid_at || invoice.created_at)}</Table.Td>
                          <Table.Td>{formatAmount(invoice.amount_cents, invoice.currency)}</Table.Td>
                          <Table.Td>{getInvoiceStatusLabel(invoice.status)}</Table.Td>
                          <Table.Td>{invoice.provider_invoice_id || '-'}</Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                )}
              </Stack>
            )}
          </Stack>
        </Card>

        {organizations.length > 0 ? (
          <Card radius='md' withBorder>
            <Stack gap='sm' p='lg'>
              <Text size='xl'>{t('org-license-management-title')}</Text>
              <Text size='sm' c='dimmed'>
                {t('org-license-management-description')}
              </Text>

              <Group grow align='end'>
                <Select
                  label={t('org-license-organization')}
                  data={organizations.map((org) => ({
                    value: String(org.id),
                    label: org.name,
                  }))}
                  value={selectedOrganizationId}
                  onChange={setSelectedOrganizationId}
                />
                <NumberInput
                  label={t('org-license-seat-count')}
                  value={orgSeatCount}
                  min={3}
                  max={100}
                  onChange={(value) => {
                    if (typeof value === 'number' && Number.isFinite(value)) {
                      setOrgSeatCount(value)
                    }
                  }}
                />
              </Group>

              {isLoadingOrgBilling ? (
                <Text c='dimmed'>{t('license-management-loading')}</Text>
              ) : orgBillingStatus ? (
                <Paper withBorder radius='md' p='md'>
                  <Stack gap='xs'>
                    <Group justify='space-between' align='flex-start'>
                      <Text fw={600}>{t('license-kind-org_seat')}</Text>
                      <Badge
                        color={getOrgSubscriptionStatusColor(orgBillingStatus.subscriptionStatus)}
                        variant='light'
                      >
                        {getOrgSubscriptionStatusLabel(orgBillingStatus.subscriptionStatus)}
                      </Badge>
                    </Group>
                    <Text size='sm' c='dimmed'>
                      {t('license-management-current-period-end')}:{' '}
                      {formatDate(orgBillingStatus.currentPeriodEnd)}
                    </Text>
                    <Text size='sm' c='dimmed'>
                      {t('org-license-invoice-status')}:{' '}
                      {orgBillingStatus.invoiceStatus
                        ? getInvoiceStatusLabel(orgBillingStatus.invoiceStatus)
                        : t('license-management-history-status-unknown')}
                    </Text>
                    {orgBillingStatus.invoiceDueDate ? (
                      <Text size='sm' c='dimmed'>
                        {t('org-license-invoice-due-date')}: {formatDate(orgBillingStatus.invoiceDueDate)}
                      </Text>
                    ) : null}
                    {orgBillingStatus.responsibleEmail ? (
                      <Text size='sm' c='dimmed'>
                        {t('org-license-responsible-email')}: {orgBillingStatus.responsibleEmail}
                      </Text>
                    ) : null}
                    {orgBillingStatus.subscriptionStatus === 'active_unpaid' ? (
                      <Alert color='orange' variant='light'>
                        {t('org-license-unpaid-warning')}
                      </Alert>
                    ) : null}
                    {orgBillingStatus.subscriptionStatus === 'suspended' ? (
                      <Alert color='red' variant='light'>
                        {t('org-license-suspended-warning')}
                      </Alert>
                    ) : null}
                    <Group mt='xs'>
                      {orgBillingStatus.payrexxGatewayLink ? (
                        <Button
                          component='a'
                          href={orgBillingStatus.payrexxGatewayLink}
                          target='_blank'
                          rel='noreferrer'
                          variant='light'
                        >
                          {t('org-license-open-payment-link')}
                        </Button>
                      ) : null}
                    </Group>
                  </Stack>
                </Paper>
              ) : (
                <Paper withBorder radius='md' p='md'>
                  <Stack gap='sm'>
                    <Text c='dimmed'>{t('org-license-empty')}</Text>
                    <Button
                      variant='filled'
                      onClick={createOrRenewOrgCheckout}
                      loading={isCreatingOrgCheckout}
                    >
                      {t('org-license-create-button')}
                    </Button>
                  </Stack>
                </Paper>
              )}
            </Stack>
          </Card>
        ) : null}
      </Stack>
    </Container>
  )
}

export async function getServerSideProps({ locale }: GetServerSidePropsContext) {
  return {
    props: {
      messages: (await import(`../../../../messages/${locale}.json`)).default,
    },
  }
}
