import React, { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Group,
  Modal,
  Paper,
  Stack,
  Table,
  Text,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { IconFileTypePdf } from '@tabler/icons-react'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import {
  PaymentReceiptDocument,
  renderPaymentReceiptPdfBlob,
  triggerBrowserPdfDownload,
  type PaymentReceiptTranslations,
} from '@/components/billing/PaymentReceiptDocument'
import { useUser } from '@/contexts/UserProvider'
import { supabase } from '@/utils/supabase/client'
import { INDIVIDUAL_ANNUAL_PRICE_CHF } from '@/utils/payments/pricing'

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

export default function LicenseManagementPage() {
  const t = useTranslations('Index')
  const tPricing = useTranslations('Pricing')
  const tNoLicense = useTranslations('NoLicense')
  const router = useRouter()
  const { user, organizations, userEmail } = useUser()
  const backPath = '/app/settings'

  const [licenseManagementData, setLicenseManagementData] = useState<LicenseManagementData | null>(null)
  const [isLoadingLicenseManagement, setIsLoadingLicenseManagement] = useState(false)
  const [isCancelingSubscription, setIsCancelingSubscription] = useState(false)
  const [isRetryingSubscription, setIsRetryingSubscription] = useState(false)
  const [generatingReceiptInvoiceId, setGeneratingReceiptInvoiceId] = useState<string | null>(null)
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

  const handleRetryPersonalCheckout = async () => {
    setIsRetryingSubscription(true)
    try {
      const requestInit = await getAuthenticatedRequestInit({
        method: 'POST',
      })
      const response = await fetch('/api/billing/personal-subscription/retry', requestInit)
      const payload = (await response.json()) as { checkoutUrl?: string; error?: string }

      if (!response.ok || !payload.checkoutUrl) {
        throw new Error(payload.error || 'Failed to create retry checkout')
      }

      notifications.show({
        title: t('license-management-title'),
        message: t('license-management-retry-created'),
        color: 'green',
      })

      window.location.href = payload.checkoutUrl
    } catch (error) {
      console.error('Error creating personal retry checkout:', error)
      notifications.show({
        title: t('error'),
        message: t('license-management-retry-error'),
        color: 'red',
      })
    } finally {
      setIsRetryingSubscription(false)
    }
  }

  const handlePurchasePersonalLicense = () => {
    void router.push('/checkout?plan=annual')
  }

  const handleDownloadReceipt = async (invoice: LicenseManagementInvoice) => {
    if (invoice.status !== 'paid') {
      return
    }

    setGeneratingReceiptInvoiceId(invoice.id)
    try {
      const locale = router.locale || 'de-CH'
      const receiptTranslations: PaymentReceiptTranslations = {
        title: t('license-management-receipt-title'),
        subtitle: t('license-management-receipt-subtitle'),
        issueDate: t('license-management-receipt-issue-date'),
        paymentDate: t('license-management-receipt-payment-date'),
        amount: t('license-management-receipt-amount'),
        currency: t('license-management-receipt-currency'),
        reference: t('license-management-receipt-reference'),
        status: t('license-management-receipt-status'),
        statusPaid: t('license-management-history-status-paid'),
        customer: t('license-management-receipt-customer'),
        customerLine: `${t('license-management-receipt-customer-email')}: ${userEmail || '-'}`,
        issuer: t('license-management-receipt-issuer'),
        product: t('license-management-receipt-product'),
        productValue: t('license-management-receipt-product-value'),
        periodLabel: t('license-management-receipt-period-label'),
        periodYear: t('license-management-receipt-period-year'),
      }

      const receiptDocument = (
        <PaymentReceiptDocument invoice={invoice} locale={locale} translations={receiptTranslations} />
      )

      const blob = await renderPaymentReceiptPdfBlob(receiptDocument)
      const safeReference = (invoice.provider_invoice_id || invoice.id).replace(/[^a-zA-Z0-9_-]/g, '_')
      const datePart = new Date().toISOString().split('T')[0]
      const filename = `EduTime_Zahlungsbestaetigung_${safeReference}_${datePart}.pdf`
      triggerBrowserPdfDownload(blob, filename)
    } catch (error) {
      console.error('Error creating personal receipt PDF:', error)
      notifications.show({
        title: t('error'),
        message: t('license-management-receipt-error'),
        color: 'red',
      })
    } finally {
      setGeneratingReceiptInvoiceId(null)
    }
  }

  useEffect(() => {
    if (!user?.user_id) return
    void loadLicenseManagementData()
  }, [user?.user_id, loadLicenseManagementData])

  if (!user) return null

  return (
    <Container size={1200} py='xl'>
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
          <Button variant='subtle' onClick={() => router.push(backPath)}>
            ← {t('back')}
          </Button>
        </Group>

        <Card radius='md' withBorder>
          <Stack gap='sm' p='lg'>
            <Text size='xl'>{t('license-management-title')}</Text>

            {isLoadingLicenseManagement ? (
              <Text c='dimmed'>{t('license-management-loading')}</Text>
            ) : !licenseManagementData?.subscription ? (
              <Stack gap='sm'>
                <Text c='dimmed'>{t('license-management-empty')}</Text>
                <Paper withBorder radius='md' p='md'>
                  <Stack gap='md'>
                    <Badge variant='light' w='fit-content'>
                      {tPricing('mostPopular')}
                    </Badge>
                    <Text fw={600}>{tPricing('planName')}</Text>
                    <Group gap='xs' align='baseline'>
                      <Text size='2rem' fw={700}>
                        {INDIVIDUAL_ANNUAL_PRICE_CHF}
                      </Text>
                      <Text c='dimmed'>CHF</Text>
                      <Text c='dimmed'>{tPricing('perYear')}</Text>
                    </Group>
                    <Button onClick={handlePurchasePersonalLicense}>
                      {tNoLicense('purchase-now')}
                    </Button>
                  </Stack>
                </Paper>
              </Stack>
            ) : (() => {
              const currentPeriodEnd = licenseManagementData.subscription.current_period_end
              const currentPeriodEndMs = currentPeriodEnd ? Date.parse(currentPeriodEnd) : NaN
              const isExpired = Number.isFinite(currentPeriodEndMs) && currentPeriodEndMs <= Date.now()
              const statusLabel = isExpired
                ? t('license-management-status-expired')
                : licenseManagementData.subscription.cancel_at_period_end
                  ? t('license-management-status-cancel-at-period-end')
                  : t('license-management-status-active')
              const statusColor = isExpired
                ? 'red'
                : licenseManagementData.subscription.cancel_at_period_end
                  ? 'orange'
                  : 'green'
              const personalPeriodLabel =
                licenseManagementData.subscription.cancel_at_period_end || isExpired
                  ? t('license-management-current-period-end')
                  : t('license-renews-on')

              return (
              <Stack gap='md'>
                <Paper withBorder radius='md' p='md'>
                  <Stack gap='xs'>
                    <Group justify='space-between' align='flex-start'>
                      <Text fw={600}>{t('license-kind-personal')}</Text>
                      <Badge color={statusColor} variant='light'>
                        {statusLabel}
                      </Badge>
                    </Group>
                    <Text size='sm' c='dimmed'>
                      {personalPeriodLabel}:{' '}
                      {formatDate(licenseManagementData.subscription.current_period_end)}
                    </Text>
                    {licenseManagementData.subscription.canceled_at ? (
                      <Text size='sm' c='dimmed'>
                        {t('license-management-canceled-at')}:{' '}
                        {formatDate(licenseManagementData.subscription.canceled_at)}
                      </Text>
                    ) : null}
                    {!licenseManagementData.subscription.cancel_at_period_end && !isExpired ? (
                      <Group justify='flex-start' mt='xs'>
                        <Button color='red' variant='light' onClick={openCancelModal}>
                          {t('license-management-cancel-button')}
                        </Button>
                      </Group>
                    ) : null}
                    {isExpired ? (
                      <Alert color='red' variant='light' mt='xs'>
                        <Group justify='space-between' align='center'>
                          <Text size='sm'>{t('license-management-retry-info')}</Text>
                          <Button
                            variant='filled'
                            onClick={handleRetryPersonalCheckout}
                            loading={isRetryingSubscription}
                          >
                            {t('license-management-retry-button')}
                          </Button>
                        </Group>
                      </Alert>
                    ) : null}
                  </Stack>
                </Paper>

                <Text size='lg' fw={600}>
                  {t('license-management-history-title')}
                </Text>

                {licenseManagementData.invoices.length === 0 ? (
                  <Text c='dimmed'>{t('license-management-history-empty')}</Text>
                ) : (
                  <Table.ScrollContainer minWidth={820}>
                    <Table striped highlightOnHover withTableBorder>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>{t('license-management-history-date')}</Table.Th>
                          <Table.Th>{t('license-management-history-amount')}</Table.Th>
                          <Table.Th>{t('license-management-history-status')}</Table.Th>
                          <Table.Th>{t('license-management-history-reference')}</Table.Th>
                          <Table.Th>{t('license-management-history-receipt')}</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {licenseManagementData.invoices.map((invoice) => (
                          <Table.Tr key={invoice.id}>
                            <Table.Td>{formatDate(invoice.paid_at || invoice.created_at)}</Table.Td>
                            <Table.Td>{formatAmount(invoice.amount_cents, invoice.currency)}</Table.Td>
                            <Table.Td>{getInvoiceStatusLabel(invoice.status)}</Table.Td>
                            <Table.Td>{invoice.provider_invoice_id || '-'}</Table.Td>
                            <Table.Td>
                              {invoice.status === 'paid' ? (
                                <Button
                                  size='xs'
                                  variant='light'
                                  leftSection={<IconFileTypePdf size='0.875rem' />}
                                  onClick={() => void handleDownloadReceipt(invoice)}
                                  loading={generatingReceiptInvoiceId === invoice.id}
                                >
                                  {t('license-management-history-receipt-download')}
                                </Button>
                              ) : (
                                <Text size='sm' c='dimmed'>
                                  -
                                </Text>
                              )}
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Table.ScrollContainer>
                )}
              </Stack>
              )
            })()}
          </Stack>
        </Card>

        {organizations.length > 0 ? (
          <Button
            variant='light'
            onClick={() =>
              void router.push(
                `/app/organization-management?organizationId=${organizations[0].id}`,
              )
            }
          >
            {t('license-management-organization-management-link')}
          </Button>
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
