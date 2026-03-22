import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Anchor,
  Badge,
  Button,
  Card,
  Container,
  Divider,
  Group,
  Loader,
  Modal,
  NumberInput,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconAlertTriangle, IconCheck, IconExternalLink } from '@tabler/icons-react'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import { DOCUMENT_LABELS, DOCUMENT_ROUTES } from '@edutime/shared'
import { useUser } from '@/contexts/UserProvider'
import { supabase } from '@/utils/supabase/client'

type OrgAdmin = {
  user_id: string
  email: string | null
  created_at: string
}

type OrgSubscriptionStatus = 'active' | 'active_unpaid' | 'suspended'

type OrgBillingData = {
  subscriptionId: string
  subscriptionStatus: OrgSubscriptionStatus
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
  payrexxInvoicePaymentLink: string | null
  payrexxInvoicePaymentInfo: {
    iban: string | null
    bankName: string | null
    reference: string | null
  } | null
  checkoutReferenceId: string | null
  nextPeriodSeatCount: number | null
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

type SeatAdjustmentPreview = {
  currentSeatCount: number
  targetSeatCount: number
  isIncrease: boolean
  daysUntilPeriodEnd: number
  currentAnnualAmountCents: number
  nextAnnualAmountCents: number
  annualDeltaCents: number
  proratedAmountCents: number
  paymentRequired: boolean
  graceWindowApplied: boolean
  autoRenewEnabled: boolean
}

type MissingOrgDocument = {
  document_code: string
  document_version_id: number
  title: string
  version_label: string
  can_accept: boolean
}

const ORG_LEGAL_REQUIRED_ERROR_MESSAGE =
  'organization legal documents must be accepted before managing this organization.'

/** Postgres RPC `add_organization_admin_by_email` raises English text; map for i18n. */
const localizeOrgManagementApiError = (
  message: string,
  t: (key: string, values?: Record<string, string | number | Date>) => string,
  fallbackTranslationKey: string,
) => {
  const trimmed = message.trim()
  if (trimmed.toLowerCase() === 'missing admin email') {
    return t('org-management-admin-add-error-missing-email')
  }
  const noUserMatch = trimmed.match(/no user found for email\s+(\S+)/i)
  if (noUserMatch?.[1]) {
    return t('org-management-admin-add-error-no-user', { email: noUserMatch[1] })
  }
  const lower = trimmed.toLowerCase()
  if (lower.includes('cannot remove your own organization admin role')) {
    return t('org-management-admin-remove-error-cannot-remove-self')
  }
  if (lower.includes('cannot remove the last organization admin')) {
    return t('org-management-admin-remove-error-last-admin')
  }
  return trimmed || t(fallbackTranslationKey)
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

const PENDING_INVOICE_STATUSES = new Set(['open', 'draft', 'failed'])

/** Upcoming charge: latest pending invoice if any, else subscription renewal amount (unless canceled at period end). */
const getNextOrgPaymentAmount = (
  billing: OrgBillingData,
  canceledAtPeriodEnd: boolean,
): { amountCents: number; currency: string } | null => {
  const pending = billing.invoices.filter((inv) => {
    const st = inv.status.trim().toLowerCase()
    return PENDING_INVOICE_STATUSES.has(st) && inv.amount_cents > 0
  })
  if (pending.length > 0) {
    const latest = pending.reduce((a, b) =>
      new Date(a.created_at).getTime() >= new Date(b.created_at).getTime() ? a : b,
    )
    return { amountCents: latest.amount_cents, currency: latest.currency }
  }
  if (canceledAtPeriodEnd) {
    return null
  }
  if (billing.amountCents > 0) {
    return { amountCents: billing.amountCents, currency: billing.currency }
  }
  return null
}

const WarningNotice = ({ children }: { children: React.ReactNode }) => (
  <Alert color='yellow' variant='light' icon={<IconAlertTriangle size={16} />}>
    {children}
  </Alert>
)

export default function OrganizationManagementPage() {
  const t = useTranslations('Index')
  const tNoLicense = useTranslations('NoLicense')
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
  const [isDeactivatingOrg, setIsDeactivatingOrg] = useState(false)
  const [isDeactivateConfirmOpen, setIsDeactivateConfirmOpen] = useState(false)
  const [removingAdminUserId, setRemovingAdminUserId] = useState<string | null>(null)
  const [targetSeatCount, setTargetSeatCount] = useState<number>(3)
  const [isUpdatingSeatPlan, setIsUpdatingSeatPlan] = useState(false)
  const [isPreviewingSeatPlan, setIsPreviewingSeatPlan] = useState(false)
  const [seatAdjustmentPreview, setSeatAdjustmentPreview] = useState<SeatAdjustmentPreview | null>(null)
  const [isOrgLegalModalOpen, setIsOrgLegalModalOpen] = useState(false)
  const [missingOrgLegalDocs, setMissingOrgLegalDocs] = useState<MissingOrgDocument[]>([])
  const [isLoadingOrgLegalDocs, setIsLoadingOrgLegalDocs] = useState(false)
  const [orgLegalError, setOrgLegalError] = useState<string | null>(null)
  const [acceptingOrgDocumentId, setAcceptingOrgDocumentId] = useState<number | null>(null)

  const locale = router.locale || 'de-CH'
  const isOrgLegalMissingError = useCallback((message: string) => {
    return message.trim().toLowerCase().includes(ORG_LEGAL_REQUIRED_ERROR_MESSAGE)
  }, [])

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

  const loadMissingOrgLegalDocuments = useCallback(
    async (organizationId: number) => {
      setIsLoadingOrgLegalDocs(true)
      setOrgLegalError(null)
      try {
        const requestInit = await getAuthenticatedRequestInit({
          method: 'POST',
          body: JSON.stringify({
            context: 'checkout_org',
            organizationId,
          }),
        })
        const response = await fetch('/api/legal/missing', requestInit)
        const data = (await response.json()) as { missing?: MissingOrgDocument[]; error?: string }
        if (!response.ok) {
          throw new Error(data.error || t('org-management-load-error'))
        }
        const missing = data.missing || []
        setMissingOrgLegalDocs(missing)
        setIsOrgLegalModalOpen(missing.length > 0)
        return missing
      } catch (error) {
        setMissingOrgLegalDocs([])
        setOrgLegalError(
          error instanceof Error ? error.message : t('org-management-legal-modal-load-error'),
        )
        setIsOrgLegalModalOpen(true)
        return null
      } finally {
        setIsLoadingOrgLegalDocs(false)
      }
    },
    [getAuthenticatedRequestInit, t],
  )

  const openOrgLegalModal = useCallback(
    async (organizationId: number) => {
      await loadMissingOrgLegalDocuments(organizationId)
    },
    [loadMissingOrgLegalDocuments],
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
    (status: OrgSubscriptionStatus) => {
      switch (status) {
        case 'active':
          return t('org-license-status-active-paid')
        case 'active_unpaid':
          return t('org-license-status-active-unpaid')
        case 'suspended':
          return t('org-license-status-suspended')
      }
    },
    [t],
  )

  const getOrgSubscriptionStatusColor = useCallback((status: OrgSubscriptionStatus) => {
    switch (status) {
      case 'active':
        return 'green'
      case 'active_unpaid':
        return 'orange'
      case 'suspended':
        return 'red'
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
        setTargetSeatCount(data.billing?.nextPeriodSeatCount || data.billing?.seatCount || data.organization?.seats || 3)
        setSeatAdjustmentPreview(null)
      } catch (error) {
        const message = error instanceof Error ? error.message : ''
        if (isOrgLegalMissingError(message)) {
          await openOrgLegalModal(Number(organizationId))
          setPayload(null)
          return
        }
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
    [getAuthenticatedRequestInit, isOrgLegalMissingError, openOrgLegalModal, t],
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

  const handleOrgManagementError = useCallback(
    async (error: unknown, fallbackTranslationKey: string, organizationId?: number | null) => {
      const message = error instanceof Error ? error.message : ''
      if (organizationId && isOrgLegalMissingError(message)) {
        await openOrgLegalModal(organizationId)
        return
      }
      notifications.show({
        title: t('error'),
        message:
          error instanceof Error
            ? localizeOrgManagementApiError(error.message, t, fallbackTranslationKey)
            : t(fallbackTranslationKey),
        color: 'red',
      })
    },
    [isOrgLegalMissingError, openOrgLegalModal, t],
  )

  const handleAcceptOrgLegalDocument = useCallback(
    async (documentCode: string, documentVersionId: number) => {
      if (!selectedOrganizationId) return
      const organizationId = Number(selectedOrganizationId)
      if (!Number.isInteger(organizationId) || organizationId <= 0) return

      setAcceptingOrgDocumentId(documentVersionId)
      setOrgLegalError(null)
      try {
        const requestInit = await getAuthenticatedRequestInit({
          method: 'POST',
          body: JSON.stringify({
            documentCode,
            source: 'web',
            organizationId,
          }),
        })
        const response = await fetch('/api/legal/accept', requestInit)
        const data = (await response.json()) as { error?: string }
        if (!response.ok) {
          throw new Error(data.error || t('org-management-legal-modal-accept-error'))
        }
        const missing = await loadMissingOrgLegalDocuments(organizationId)
        if (missing && missing.length === 0) {
          setIsOrgLegalModalOpen(false)
          await loadManagementData(String(organizationId))
        }
      } catch (error) {
        setOrgLegalError(
          error instanceof Error ? error.message : t('org-management-legal-modal-accept-error'),
        )
      } finally {
        setAcceptingOrgDocumentId(null)
      }
    },
    [getAuthenticatedRequestInit, loadManagementData, loadMissingOrgLegalDocuments, selectedOrganizationId, t],
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
      await handleOrgManagementError(error, 'org-management-rename-error', Number(selectedOrganizationId))
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
      await handleOrgManagementError(error, 'org-management-admin-add-error', Number(selectedOrganizationId))
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
      await handleOrgManagementError(error, 'org-management-admin-remove-error', Number(selectedOrganizationId))
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
      await handleOrgManagementError(error, 'org-management-cancel-error', Number(selectedOrganizationId))
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
      await handleOrgManagementError(error, 'org-management-reactivate-error', Number(selectedOrganizationId))
    } finally {
      setIsReactivating(false)
    }
  }

  const handleConfirmDeactivateOrganization = async () => {
    if (!selectedOrganizationId) return

    setIsDeactivatingOrg(true)
    try {
      await postAction({
        action: 'deactivateOrg',
        organizationId: Number(selectedOrganizationId),
      })
      notifications.show({
        title: t('org-management-deactivate-success-title'),
        message: t('org-management-deactivate-success-message'),
        color: 'green',
      })
      await refreshUserData()
      void router.push('/app')
    } catch (error) {
      await handleOrgManagementError(error, 'org-management-deactivate-error', Number(selectedOrganizationId))
    } finally {
      setIsDeactivatingOrg(false)
      setIsDeactivateConfirmOpen(false)
    }
  }

  const handleDeactivateOrganization = () => {
    if (!selectedOrganizationId) return
    setIsDeactivateConfirmOpen(true)
  }

  const adminCount = payload?.admins?.length || 0
  const canRemoveAdmins = adminCount > 1
  const isOrgCanceled = Boolean(payload?.billing?.cancelAtPeriodEnd)
  const hasOrgSubscription = Boolean(payload?.billing)
  const currentSeatCount = payload?.billing?.seatCount || payload?.organization?.seats || 0

  const nextPaymentAmount = useMemo(() => {
    if (!payload?.billing) return null
    return getNextOrgPaymentAmount(payload.billing, isOrgCanceled)
  }, [payload?.billing, isOrgCanceled])

  const handleStartOrganizationCheckout = useCallback(() => {
    const orgId = payload?.organization?.id ?? Number(selectedOrganizationId)
    if (!Number.isInteger(orgId) || orgId <= 0) return
    const rawSeats =
      payload?.billing?.seatCount ?? payload?.organization?.seats ?? targetSeatCount
    const qty = Math.max(
      typeof rawSeats === 'number' && Number.isFinite(rawSeats) ? rawSeats : 3,
      3,
    )
    void router.push(`/checkout?plan=org&qty=${qty}&orgId=${orgId}`)
  }, [
    payload?.organization?.id,
    payload?.billing?.seatCount,
    payload?.organization?.seats,
    payload?.billing,
    selectedOrganizationId,
    targetSeatCount,
    router,
  ])

  const selectedOrgName = useMemo(() => {
    if (!selectedOrganizationId) return null
    return organizations.find((org) => String(org.id) === selectedOrganizationId)?.name || null
  }, [organizations, selectedOrganizationId])
  const backPath =
    hasActiveSubscription && selectedOrganizationId
      ? `/app/members?organizationId=${encodeURIComponent(selectedOrganizationId)}`
      : hasActiveSubscription
        ? '/app/members'
        : '/app/no-license'
  const showBackButton = !hasActiveSubscription || typeof router.query.organizationId === 'string'

  const requestSeatAdjustment = useCallback(
    async (confirm: boolean) => {
      if (!selectedOrganizationId) throw new Error('Missing organization')
      const requestInit = await getAuthenticatedRequestInit({
        method: 'POST',
        body: JSON.stringify({
          action: 'adjustSeats',
          organizationId: Number(selectedOrganizationId),
          targetSeatCount,
          confirm,
        }),
      })
      const response = await fetch('/api/billing/org-license/management', requestInit)
      const data = (await response.json()) as {
        error?: string
        paymentRequired?: boolean
        proratedAmountCents?: number
        graceWindowApplied?: boolean
        checkoutUrl?: string
        seatAdjustmentPreview?: SeatAdjustmentPreview
      }
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update organization seat plan')
      }
      return data
    },
    [getAuthenticatedRequestInit, selectedOrganizationId, targetSeatCount],
  )

  const handleSeatPlanUpdate = async () => {
    if (!selectedOrganizationId) return
    if (!seatAdjustmentPreview || seatAdjustmentPreview.targetSeatCount !== targetSeatCount) {
      return
    }
    setIsUpdatingSeatPlan(true)
    try {
      const data = await requestSeatAdjustment(true)

      notifications.show({
        title: t('org-management-seat-plan-success-title'),
        message: data.graceWindowApplied
          ? t('org-management-seat-plan-success-message-grace')
          : t('org-management-seat-plan-success-message'),
        color: 'green',
      })
      if (data.paymentRequired && data.checkoutUrl) {
        notifications.show({
          title: t('org-management-seat-plan-checkout-title'),
          message: t('org-management-seat-plan-checkout-message'),
          color: 'green',
        })
        window.location.href = data.checkoutUrl
        return
      }
      await loadManagementData(selectedOrganizationId)
    } catch (error) {
      await handleOrgManagementError(error, 'org-management-seat-plan-error', Number(selectedOrganizationId))
    } finally {
      setIsUpdatingSeatPlan(false)
    }
  }

  useEffect(() => {
    if (!hasOrgSubscription || !selectedOrganizationId) {
      setSeatAdjustmentPreview(null)
      return
    }
    if (!targetSeatCount || targetSeatCount < 3 || targetSeatCount > 100 || targetSeatCount === currentSeatCount) {
      setSeatAdjustmentPreview(null)
      return
    }

    let cancelled = false
    const timer = window.setTimeout(async () => {
      setIsPreviewingSeatPlan(true)
      try {
        const data = await requestSeatAdjustment(false)
        if (!cancelled) {
          setSeatAdjustmentPreview(data.seatAdjustmentPreview || null)
        }
      } catch {
        if (!cancelled) {
          setSeatAdjustmentPreview(null)
        }
      } finally {
        if (!cancelled) {
          setIsPreviewingSeatPlan(false)
        }
      }
    }, 300)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [
    hasOrgSubscription,
    selectedOrganizationId,
    targetSeatCount,
    currentSeatCount,
    requestSeatAdjustment,
  ])

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
          {showBackButton ? (
            <Button variant='subtle' onClick={() => router.push(backPath)}>
              ← {t('back')}
            </Button>
          ) : (
            <div />
          )}
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
          <Stack gap='md'>
            <Group justify='space-between' align='flex-start'>
              <Text size='xl'>{t('org-management-billing-title')}</Text>
              {payload?.billing ? (
                <Badge color={getOrgSubscriptionStatusColor(payload.billing.subscriptionStatus)} variant='light'>
                  {getOrgSubscriptionStatusLabel(payload.billing.subscriptionStatus)}
                </Badge>
              ) : null}
            </Group>

            {isLoading ? (
              <Text c='dimmed'>{t('license-management-loading')}</Text>
            ) : !payload?.billing ? (
              <Stack gap='sm'>
                <Text c='dimmed'>{t('org-license-empty')}</Text>
                {payload?.organization ? (
                  <>
                    <Text size='sm' c='dimmed'>
                      {t('checkout-org-seat-count-info', {
                        count: Math.max(payload.organization.seats ?? 3, 3),
                      })}
                    </Text>
                    <Button variant='filled' onClick={handleStartOrganizationCheckout}>
                      {tNoLicense('org-no-license-checkout')}
                    </Button>
                  </>
                ) : null}
              </Stack>
            ) : (
              <Stack gap='xs'>
                <Text size='sm' c='dimmed'>
                  {t('org-management-seat-plan-current')}: {currentSeatCount}
                </Text>
                <Text size='sm' c='dimmed'>
                  {isOrgCanceled
                    ? `${t('org-management-cancel-effective-date')}: ${formatDate(payload.billing.currentPeriodEnd, locale, t('license-unlimited'))}`
                    : payload.billing.subscriptionStatus === 'active_unpaid' &&
                        typeof payload.billing.invoiceDueDate === 'string' &&
                        payload.billing.invoiceDueDate.trim().length > 0
                      ? `${t('org-management-billing-payment-due')}: ${formatDate(payload.billing.invoiceDueDate, locale, t('license-unlimited'))}`
                      : `${t('org-management-billing-next-payment')}: ${formatDate(payload.billing.currentPeriodEnd, locale, t('license-unlimited'))}`}
                </Text>
                {nextPaymentAmount ? (
                  <Text size='sm' c='dimmed'>
                    {t('org-management-billing-next-payment-amount')}:{' '}
                    {formatAmount(nextPaymentAmount.amountCents, nextPaymentAmount.currency, locale)}
                  </Text>
                ) : isOrgCanceled ? (
                  <Text size='sm' c='dimmed'>
                    {t('org-management-billing-next-payment-none-after-cancel')}
                  </Text>
                ) : null}
                {isOrgCanceled ? <WarningNotice>{t('org-management-cancel-pending-note')}</WarningNotice> : null}

                <Group>
                  {isOrgCanceled ? (
                    <Button variant='light' onClick={handleReactivate} loading={isReactivating}>
                      {t('org-management-reactivate-button')}
                    </Button>
                  ) : (
                    <Button color='red' variant='light' onClick={handleCancel} loading={isCanceling}>
                      {t('org-management-cancel-button')}
                    </Button>
                  )}
                </Group>

                {payload.billing.subscriptionStatus === 'suspended' ? (
                  <Button variant='outline' onClick={handleStartOrganizationCheckout}>
                    {tNoLicense('org-no-license-checkout')}
                  </Button>
                ) : null}

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
                          <Table.Th>{t('org-management-payment-link-column')}</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {payload.billing.invoices.map((invoice) => (
                          <Table.Tr key={invoice.id}>
                            <Table.Td>{formatDate(invoice.paid_at || invoice.created_at, locale, '-')}</Table.Td>
                            <Table.Td>{formatAmount(invoice.amount_cents, invoice.currency, locale)}</Table.Td>
                            <Table.Td>{getInvoiceStatusLabel(invoice.status)}</Table.Td>
                            <Table.Td>{invoice.provider_invoice_id || '-'}</Table.Td>
                            <Table.Td>
                              {invoice.status === 'open' &&
                              (payload.billing?.payrexxInvoicePaymentLink || payload.billing?.payrexxGatewayLink) ? (
                                <Button
                                  component='a'
                                  href={
                                    payload.billing.payrexxInvoicePaymentLink || payload.billing.payrexxGatewayLink!
                                  }
                                  target='_blank'
                                  rel='noreferrer'
                                  variant='light'
                                  size='xs'
                                >
                                  {t('org-management-payment-link-button')}
                                </Button>
                              ) : (
                                '-'
                              )}
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Paper>
                )}
              </Stack>
            )}

            <Divider my='md' />

            <Stack gap='sm'>
              <Title order={4}>{t('org-management-seat-plan-title')}</Title>
              <Text size='sm' c='dimmed'>
                {t('org-management-seat-plan-grace-note')}
              </Text>
              <NumberInput
                label={t('org-management-seat-plan-target-label')}
                min={3}
                max={100}
                value={targetSeatCount}
                onChange={(value) => {
                  setTargetSeatCount(typeof value === 'number' ? value : currentSeatCount || 3)
                  setSeatAdjustmentPreview(null)
                }}
              />
              {seatAdjustmentPreview ? (
                <Paper withBorder radius='md' p='sm'>
                  <Stack gap='xs'>
                    <Text fw={600}>{t('org-management-seat-plan-invoice-title')}</Text>
                    <Table withTableBorder striped>
                      <Table.Tbody>
                        <Table.Tr>
                          <Table.Td>{t('org-management-seat-plan-invoice-current-seats')}</Table.Td>
                          <Table.Td>{seatAdjustmentPreview.currentSeatCount}</Table.Td>
                        </Table.Tr>
                        <Table.Tr>
                          <Table.Td>{t('org-management-seat-plan-invoice-target-seats')}</Table.Td>
                          <Table.Td>{seatAdjustmentPreview.targetSeatCount}</Table.Td>
                        </Table.Tr>
                        <Table.Tr>
                          <Table.Td>{t('org-management-seat-plan-invoice-current-annual')}</Table.Td>
                          <Table.Td>
                            {formatAmount(seatAdjustmentPreview.currentAnnualAmountCents, 'CHF', locale)}
                          </Table.Td>
                        </Table.Tr>
                        <Table.Tr>
                          <Table.Td>{t('org-management-seat-plan-invoice-next-annual')}</Table.Td>
                          <Table.Td>
                            {formatAmount(seatAdjustmentPreview.nextAnnualAmountCents, 'CHF', locale)}
                          </Table.Td>
                        </Table.Tr>
                        {seatAdjustmentPreview.isIncrease ? (
                          <Table.Tr>
                            <Table.Td>{t('org-management-seat-plan-invoice-upgrade-now')}</Table.Td>
                            <Table.Td>
                              <Stack gap={2}>
                                <Text size='sm'>
                                  {seatAdjustmentPreview.graceWindowApplied
                                    ? t('org-management-seat-plan-invoice-upgrade-free')
                                    : formatAmount(seatAdjustmentPreview.proratedAmountCents, 'CHF', locale)}
                                </Text>
                                <Text size='xs' c='dimmed'>
                                  {t('org-management-seat-plan-invoice-upgrade-detail', {
                                    count:
                                      seatAdjustmentPreview.targetSeatCount - seatAdjustmentPreview.currentSeatCount,
                                    days: Math.min(Math.max(seatAdjustmentPreview.daysUntilPeriodEnd, 0), 365),
                                  })}
                                </Text>
                              </Stack>
                            </Table.Td>
                          </Table.Tr>
                        ) : null}
                      </Table.Tbody>
                    </Table>
                    {!seatAdjustmentPreview.isIncrease ? (
                      <Alert color='orange' variant='light'>
                        {t('org-management-seat-plan-downgrade-note')}
                      </Alert>
                    ) : null}
                    <Text size='sm' c='dimmed'>
                      {t(
                        isOrgCanceled
                          ? 'org-management-seat-plan-auto-renew-note-canceled'
                          : 'org-management-seat-plan-auto-renew-note',
                      )}
                    </Text>
                  </Stack>
                </Paper>
              ) : null}
              <Group justify='flex-end'>
                <Button
                  onClick={handleSeatPlanUpdate}
                  loading={isUpdatingSeatPlan}
                  disabled={
                    !hasOrgSubscription ||
                    !seatAdjustmentPreview ||
                    seatAdjustmentPreview.targetSeatCount !== targetSeatCount
                  }
                >
                  {seatAdjustmentPreview?.paymentRequired
                    ? t('org-management-seat-plan-save-paid')
                    : t('org-management-seat-plan-save')}
                </Button>
              </Group>
            </Stack>
          </Stack>
        </Card>

        <Card withBorder>
          <Stack gap='sm'>
            <Text size='xl'>{t('org-management-deactivate-title')}</Text>
            <Text size='sm' c='dimmed'>
              {t('org-management-deactivate-support-note')}
            </Text>
            <Group justify='flex-end'>
              <Button
                color='red'
                variant='light'
                onClick={handleDeactivateOrganization}
                loading={isDeactivatingOrg}
              >
                {t('org-management-deactivate-button')}
              </Button>
            </Group>
          </Stack>
        </Card>
      </Stack>
      <Modal
        opened={isOrgLegalModalOpen}
        onClose={() => setIsOrgLegalModalOpen(false)}
        title={t('org-management-legal-modal-title')}
        centered
        size='lg'
      >
        <Stack gap='md'>
          <Text size='sm' c='dimmed'>
            {t('org-management-legal-modal-description')}
          </Text>
          {isLoadingOrgLegalDocs ? (
            <Group gap='sm'>
              <Loader size='sm' />
              <Text size='sm' c='dimmed'>
                {t('org-management-legal-modal-loading')}
              </Text>
            </Group>
          ) : null}
          {orgLegalError ? (
            <Alert color='red' variant='light'>
              <Stack gap='sm'>
                <Text size='sm'>{orgLegalError}</Text>
                {selectedOrganizationId ? (
                  <Button
                    variant='light'
                    onClick={() => loadMissingOrgLegalDocuments(Number(selectedOrganizationId))}
                  >
                    {t('org-management-legal-modal-retry')}
                  </Button>
                ) : null}
              </Stack>
            </Alert>
          ) : null}
          {!isLoadingOrgLegalDocs && !orgLegalError && missingOrgLegalDocs.length === 0 ? (
            <Text size='sm' c='dimmed'>
              {t('org-management-legal-modal-no-missing')}
            </Text>
          ) : null}
          {!isLoadingOrgLegalDocs && !orgLegalError && missingOrgLegalDocs.length > 0
            ? missingOrgLegalDocs.map((doc) => (
                <Group key={doc.document_version_id} justify='space-between' align='flex-start' wrap='nowrap'>
                  <Stack gap={4} style={{ flex: 1 }}>
                    <Group gap='xs'>
                      <Text fw={500}>{DOCUMENT_LABELS[doc.document_code] || doc.title}</Text>
                      {doc.version_label ? (
                        <Text size='sm' c='dimmed'>
                          ({doc.version_label})
                        </Text>
                      ) : null}
                    </Group>
                    {DOCUMENT_ROUTES[doc.document_code] ? (
                      <Anchor href={DOCUMENT_ROUTES[doc.document_code]} target='_blank' size='sm'>
                        <Group gap={4}>
                          <IconExternalLink size='0.875rem' />
                          <span>{t('org-management-legal-modal-open-doc')}</span>
                        </Group>
                      </Anchor>
                    ) : null}
                  </Stack>
                  {doc.can_accept ? (
                    <Button
                      size='xs'
                      leftSection={<IconCheck size='1rem' />}
                      loading={acceptingOrgDocumentId === doc.document_version_id}
                      onClick={() =>
                        handleAcceptOrgLegalDocument(doc.document_code, doc.document_version_id)
                      }
                    >
                      {t('org-management-legal-modal-accept')}
                    </Button>
                  ) : (
                    <Text size='sm' c='dimmed'>
                      {t('org-management-legal-modal-not-acceptable')}
                    </Text>
                  )}
                </Group>
              ))
            : null}
        </Stack>
      </Modal>
      <Modal
        opened={isDeactivateConfirmOpen}
        onClose={() => setIsDeactivateConfirmOpen(false)}
        title={t('org-management-deactivate-button')}
        centered
      >
        <Stack gap='md'>
          <Alert color='orange' variant='light'>
            {t('org-management-deactivate-confirm')}
          </Alert>
          <Group justify='flex-end'>
            <Button variant='subtle' onClick={() => setIsDeactivateConfirmOpen(false)}>
              {t('cancel')}
            </Button>
            <Button
              color='red'
              variant='light'
              onClick={handleConfirmDeactivateOrganization}
              loading={isDeactivatingOrg}
            >
              {t('org-management-deactivate-button')}
            </Button>
          </Group>
        </Stack>
      </Modal>
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
