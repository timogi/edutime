import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, Badge, Button, Card, Container, Group, Paper, Select, Stack, Table, Text, TextInput } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import { useUser } from '@/contexts/UserProvider'
import { supabase } from '@/utils/supabase/client'

type OrgAdmin = {
  user_id: string
  email: string | null
  created_at: string
}

type OrgBillingData = {
  subscriptionId: string
  subscriptionStatus: string
  amountCents: number
  currency: string
  seatCount: number | null
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  canceledAt: string | null
  graceDays: number
  suspendAt: string | null
  invoiceId: string | null
  invoiceStatus: string | null
  invoiceDueDate: string | null
  invoicePaidAt: string | null
  payrexxGatewayLink: string | null
  checkoutReferenceId: string | null
  responsibleEmail: string | null
  invoices: Array<{
    id: string
    amount_cents: number
    currency: string
    status: string
    provider_invoice_id: string | null
    paid_at: string | null
    created_at: string
  }>
}

type OrgManagementPayload = {
  organization?: {
    id: number
    name: string
    seats: number
  }
  admins?: OrgAdmin[]
  billing?: OrgBillingData | null
  error?: string
}

const formatDate = (value: string | null, locale: string, fallback: string) => {
  if (!value) return fallback
  return new Date(value).toLocaleDateString(locale)
}

const formatAmount = (amountCents: number, currency: string, locale: string) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountCents / 100)

export default function OrganizationManagementPage() {
  const t = useTranslations('Index')
  const router = useRouter()
  const { user, organizations, refreshUserData, hasActiveSubscription } = useUser()

  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null)
  const [payload, setPayload] = useState<OrgManagementPayload | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [renameValue, setRenameValue] = useState('')
  const [isSavingName, setIsSavingName] = useState(false)
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [isAddingAdmin, setIsAddingAdmin] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)
  const [isReactivating, setIsReactivating] = useState(false)
  const [removingAdminUserId, setRemovingAdminUserId] = useState<string | null>(null)

  const locale = router.locale || 'de-CH'

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

  const getInvoiceStatusLabel = useCallback(
    (status: string) => {
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
    },
    [t],
  )

  const getOrgSubscriptionStatusLabel = useCallback(
    (status: string) => {
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
    },
    [t],
  )

  const getOrgSubscriptionStatusColor = useCallback((status: string) => {
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
  }, [])

  const loadManagementData = useCallback(
    async (organizationId: string) => {
      setIsLoading(true)
      try {
        const requestInit = await getAuthenticatedRequestInit()
        const response = await fetch(
          `/api/billing/org-license/management?organizationId=${encodeURIComponent(organizationId)}`,
          requestInit,
        )
        const data = (await response.json()) as OrgManagementPayload
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load organization management')
        }
        setPayload(data)
        setRenameValue(data.organization?.name || '')
      } catch (error) {
        notifications.show({
          title: t('error'),
          message: error instanceof Error ? error.message : t('org-management-load-error'),
          color: 'red',
        })
        setPayload(null)
      } finally {
        setIsLoading(false)
      }
    },
    [getAuthenticatedRequestInit, t],
  )

  useEffect(() => {
    if (!organizations || organizations.length === 0) {
      setSelectedOrganizationId(null)
      return
    }

    const queryOrgId = typeof router.query.organizationId === 'string' ? router.query.organizationId : null
    setSelectedOrganizationId((current) => {
      if (queryOrgId && organizations.some((org) => String(org.id) === queryOrgId)) return queryOrgId
      if (current && organizations.some((org) => String(org.id) === current)) return current
      return String(organizations[0].id)
    })
  }, [organizations, router.query.organizationId])

  useEffect(() => {
    if (!selectedOrganizationId) {
      setPayload(null)
      return
    }
    void loadManagementData(selectedOrganizationId)
  }, [selectedOrganizationId, loadManagementData])

  const postAction = useCallback(
    async (body: Record<string, unknown>) => {
      const requestInit = await getAuthenticatedRequestInit({
        method: 'POST',
        body: JSON.stringify(body),
      })
      const response = await fetch('/api/billing/org-license/management', requestInit)
      const data = (await response.json()) as { error?: string }
      if (!response.ok) {
        throw new Error(data.error || 'Request failed')
      }
    },
    [getAuthenticatedRequestInit],
  )

  const handleRename = async () => {
    if (!selectedOrganizationId) return
    setIsSavingName(true)
    try {
      const requestInit = await getAuthenticatedRequestInit({
        method: 'PATCH',
        body: JSON.stringify({
          organizationId: Number(selectedOrganizationId),
          name: renameValue,
        }),
      })
      const response = await fetch('/api/billing/org-license/management', requestInit)
      const data = (await response.json()) as { error?: string }
      if (!response.ok) {
        throw new Error(data.error || 'Failed to rename organization')
      }
      notifications.show({
        title: t('org-management-rename-success-title'),
        message: t('org-management-rename-success-message'),
        color: 'green',
      })
      await refreshUserData()
      await loadManagementData(selectedOrganizationId)
    } catch (error) {
      notifications.show({
        title: t('error'),
        message: error instanceof Error ? error.message : t('org-management-rename-error'),
        color: 'red',
      })
    } finally {
      setIsSavingName(false)
    }
  }

  const handleAddAdmin = async () => {
    if (!selectedOrganizationId) return
    setIsAddingAdmin(true)
    try {
      await postAction({
        action: 'addAdmin',
        organizationId: Number(selectedOrganizationId),
        email: newAdminEmail,
      })
      notifications.show({
        title: t('org-management-admin-add-success-title'),
        message: t('org-management-admin-add-success-message'),
        color: 'green',
      })
      setNewAdminEmail('')
      await loadManagementData(selectedOrganizationId)
    } catch (error) {
      notifications.show({
        title: t('error'),
        message: error instanceof Error ? error.message : t('org-management-admin-add-error'),
        color: 'red',
      })
    } finally {
      setIsAddingAdmin(false)
    }
  }

  const handleRemoveAdmin = async (removeUserId: string) => {
    if (!selectedOrganizationId) return
    setRemovingAdminUserId(removeUserId)
    try {
      await postAction({
        action: 'removeAdmin',
        organizationId: Number(selectedOrganizationId),
        removeUserId,
      })
      notifications.show({
        title: t('org-management-admin-remove-success-title'),
        message: t('org-management-admin-remove-success-message'),
        color: 'green',
      })
      await loadManagementData(selectedOrganizationId)
    } catch (error) {
      notifications.show({
        title: t('error'),
        message: error instanceof Error ? error.message : t('org-management-admin-remove-error'),
        color: 'red',
      })
    } finally {
      setRemovingAdminUserId(null)
    }
  }

  const handleCancel = async () => {
    if (!selectedOrganizationId) return
    setIsCanceling(true)
    try {
      await postAction({
        action: 'cancel',
        organizationId: Number(selectedOrganizationId),
      })
      notifications.show({
        title: t('org-management-cancel-success-title'),
        message: t('org-management-cancel-success-message'),
        color: 'green',
      })
      await loadManagementData(selectedOrganizationId)
    } catch (error) {
      notifications.show({
        title: t('error'),
        message: error instanceof Error ? error.message : t('org-management-cancel-error'),
        color: 'red',
      })
    } finally {
      setIsCanceling(false)
    }
  }

  const handleReactivate = async () => {
    if (!selectedOrganizationId) return
    setIsReactivating(true)
    try {
      await postAction({
        action: 'reactivate',
        organizationId: Number(selectedOrganizationId),
      })
      notifications.show({
        title: t('org-management-reactivate-success-title'),
        message: t('org-management-reactivate-success-message'),
        color: 'green',
      })
      await loadManagementData(selectedOrganizationId)
    } catch (error) {
      notifications.show({
        title: t('error'),
        message: error instanceof Error ? error.message : t('org-management-reactivate-error'),
        color: 'red',
      })
    } finally {
      setIsReactivating(false)
    }
  }

  const adminCount = payload?.admins?.length || 0
  const canRemoveAdmins = adminCount > 1
  const isOrgCanceled = Boolean(payload?.billing?.cancelAtPeriodEnd)

  const selectedOrgName = useMemo(() => {
    if (!selectedOrganizationId) return null
    return organizations.find((org) => String(org.id) === selectedOrganizationId)?.name || null
  }, [organizations, selectedOrganizationId])
  const backPath = hasActiveSubscription ? '/app/members' : '/app/no-license'

  if (!user) return null

  if (!organizations.length) {
    return (
      <Container size={1000} py='xl'>
        <Stack gap='md'>
          <Group>
            <Button variant='subtle' onClick={() => router.push(backPath)}>
              ← {t('back')}
            </Button>
          </Group>
          <Card withBorder>
            <Text>{t('org-management-no-orgs')}</Text>
          </Card>
        </Stack>
      </Container>
    )
  }

  return (
    <Container size={1000} py='xl'>
      <Stack gap='lg'>
        <Group justify='space-between'>
          <Button variant='subtle' onClick={() => router.push(backPath)}>
            ← {t('back')}
          </Button>
          <Select
            data={organizations.map((org) => ({ value: String(org.id), label: org.name }))}
            value={selectedOrganizationId}
            onChange={setSelectedOrganizationId}
            style={{ minWidth: 280 }}
            label={t('org-license-organization')}
          />
        </Group>

        <Card withBorder>
          <Stack gap='sm'>
            <Text size='xl'>{t('org-management-title')}</Text>
            <Text size='sm' c='dimmed'>
              {t('org-management-description')}
            </Text>
            <TextInput
              label={t('org-management-name-label')}
              value={renameValue}
              onChange={(event) => setRenameValue(event.currentTarget.value)}
              placeholder={selectedOrgName || ''}
            />
            <Group justify='flex-end'>
              <Button onClick={handleRename} loading={isSavingName}>
                {t('org-management-save-name')}
              </Button>
            </Group>
          </Stack>
        </Card>

        <Card withBorder>
          <Stack gap='sm'>
            <Text size='xl'>{t('org-management-admins-title')}</Text>
            <Text size='sm' c='dimmed'>
              {t('org-management-admins-description')}
            </Text>
            <Group align='flex-end'>
              <TextInput
                label={t('org-management-admin-email-label')}
                placeholder={t('org-management-admin-email-placeholder')}
                value={newAdminEmail}
                onChange={(event) => setNewAdminEmail(event.currentTarget.value)}
                style={{ flexGrow: 1 }}
              />
              <Button onClick={handleAddAdmin} loading={isAddingAdmin}>
                {t('org-management-admin-add')}
              </Button>
            </Group>
            {!canRemoveAdmins ? (
              <Alert color='orange' variant='light'>
                {t('org-management-last-admin-note')}
              </Alert>
            ) : null}
            <Table withTableBorder striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('email')}</Table.Th>
                  <Table.Th>{t('created_at')}</Table.Th>
                  <Table.Th>{t('Actions')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {(payload?.admins || []).map((admin) => (
                  <Table.Tr key={admin.user_id}>
                    <Table.Td>{admin.email || '-'}</Table.Td>
                    <Table.Td>{formatDate(admin.created_at, locale, '-')}</Table.Td>
                    <Table.Td>
                      <Button
                        variant='light'
                        color='red'
                        size='xs'
                        disabled={!canRemoveAdmins || admin.user_id === user.id}
                        loading={removingAdminUserId === admin.user_id}
                        onClick={() => handleRemoveAdmin(admin.user_id)}
                      >
                        {t('org-management-admin-remove')}
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Stack>
        </Card>

        <Card withBorder>
          <Stack gap='sm'>
            <Group justify='space-between' align='flex-start'>
              <div>
                <Text size='xl'>{t('org-management-billing-title')}</Text>
                <Text size='sm' c='dimmed'>
                  {t('org-management-billing-description')}
                </Text>
              </div>
              {payload?.billing ? (
                <Badge color={getOrgSubscriptionStatusColor(payload.billing.subscriptionStatus)} variant='light'>
                  {getOrgSubscriptionStatusLabel(payload.billing.subscriptionStatus)}
                </Badge>
              ) : null}
            </Group>

            {isLoading ? (
              <Text c='dimmed'>{t('license-management-loading')}</Text>
            ) : !payload?.billing ? (
              <Text c='dimmed'>{t('org-license-empty')}</Text>
            ) : (
              <Stack gap='xs'>
                <Text size='sm' c='dimmed'>
                  {t('license-management-current-period-end')}:{' '}
                  {formatDate(payload.billing.currentPeriodEnd, locale, t('license-unlimited'))}
                </Text>
                <Text size='sm' c='dimmed'>
                  {t('org-license-invoice-status')}: {getInvoiceStatusLabel(payload.billing.invoiceStatus || 'unknown')}
                </Text>
                {payload.billing.invoiceDueDate ? (
                  <Text size='sm' c='dimmed'>
                    {t('org-license-invoice-due-date')}: {formatDate(payload.billing.invoiceDueDate, locale, '-')}
                  </Text>
                ) : null}
                {payload.billing.responsibleEmail ? (
                  <Text size='sm' c='dimmed'>
                    {t('org-license-responsible-email')}: {payload.billing.responsibleEmail}
                  </Text>
                ) : null}

                {isOrgCanceled ? (
                  <Alert color='orange' variant='light'>
                    {t('org-management-cancel-pending-note')}
                  </Alert>
                ) : null}

                <Group>
                  <Button
                    color='red'
                    variant='light'
                    onClick={handleCancel}
                    loading={isCanceling}
                    disabled={isOrgCanceled}
                  >
                    {t('org-management-cancel-button')}
                  </Button>
                  <Button
                    variant='light'
                    onClick={handleReactivate}
                    loading={isReactivating}
                    disabled={!isOrgCanceled}
                  >
                    {t('org-management-reactivate-button')}
                  </Button>
                  <Button variant='filled' component='a' href={`/checkout?plan=org&qty=${payload.billing.seatCount || 3}`}>
                    {t('org-license-renew-button')}
                  </Button>
                </Group>

                <Text size='lg' fw={600} mt='sm'>
                  {t('license-management-history-title')}
                </Text>
                {payload.billing.invoices.length === 0 ? (
                  <Text c='dimmed'>{t('license-management-history-empty')}</Text>
                ) : (
                  <Paper withBorder radius='md' p='xs'>
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
                        {payload.billing.invoices.map((invoice) => (
                          <Table.Tr key={invoice.id}>
                            <Table.Td>{formatDate(invoice.paid_at || invoice.created_at, locale, '-')}</Table.Td>
                            <Table.Td>{formatAmount(invoice.amount_cents, invoice.currency, locale)}</Table.Td>
                            <Table.Td>{getInvoiceStatusLabel(invoice.status)}</Table.Td>
                            <Table.Td>{invoice.provider_invoice_id || '-'}</Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Paper>
                )}
              </Stack>
            )}
          </Stack>
        </Card>
      </Stack>
    </Container>
  )
}

export async function getServerSideProps({ locale }: GetServerSidePropsContext) {
  return {
    props: {
      messages: (await import(`../../../messages/${locale}.json`)).default,
    },
  }
}
