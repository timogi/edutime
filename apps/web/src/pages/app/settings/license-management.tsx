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
import { Document, Font, Image as PdfImage, Page, StyleSheet, Text as PdfText, View, pdf } from '@react-pdf/renderer'
import { RobotoBold } from '@/assets/fonts/Roboto-Bold'
import { RobotoRegular } from '@/assets/fonts/Roboto-Regular'
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

interface ReceiptTranslations {
  title: string
  subtitle: string
  issueDate: string
  paymentDate: string
  amount: string
  currency: string
  reference: string
  status: string
  statusPaid: string
  customer: string
  customerEmail: string
  issuer: string
  product: string
  productValue: string
  periodLabel: string
  periodYear: string
}

interface PersonalPaymentReceiptDocumentProps {
  invoice: LicenseManagementInvoice
  customerEmail: string | null
  locale: string
  translations: ReceiptTranslations
}

const EDU_TIME_IMPRINT = {
  company: 'EduTime GmbH',
  careOf: 'c/o Tim Ogi',
  street: 'Bienenstrasse 8',
  city: '3018 Bern',
  uid: 'CHE-459.271.466',
  email: 'info@edutime.ch',
  website: 'https://edutime.ch',
} as const

Font.register({
  family: 'Roboto',
  fonts: [
    { src: RobotoRegular, fontWeight: 'normal' },
    { src: RobotoBold, fontWeight: 'bold' },
  ],
})

const receiptStyles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 11,
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 36,
    lineHeight: 1.4,
    color: '#1f2937',
    backgroundColor: '#f8fafc',
  },
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 28,
    height: 28,
  },
  brand: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#845ef7',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  statusChip: {
    backgroundColor: '#ede9fe',
    color: '#6d28d9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 9,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  subtitle: {
    color: '#4b5563',
    marginBottom: 18,
  },
  blockTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 7,
  },
  block: {
    marginBottom: 14,
  },
  line: {
    marginBottom: 2,
  },
  detailsBox: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 10,
    backgroundColor: '#f8fafc',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 12,
  },
  rowLabel: {
    width: '42%',
    fontWeight: 'bold',
  },
  rowValue: {
    width: '58%',
  },
})

function PersonalPaymentReceiptDocument({
  invoice,
  customerEmail,
  locale,
  translations,
}: PersonalPaymentReceiptDocumentProps) {
  const paymentDateIso = invoice.paid_at || invoice.created_at
  const paymentDate = new Date(paymentDateIso).toLocaleString(locale)
  const issueDate = new Date().toLocaleDateString(locale)
  const amountFormatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: invoice.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(invoice.amount_cents / 100)
  const receiptReference = invoice.provider_invoice_id || invoice.id

  return (
    <Document>
      <Page size='A4' style={receiptStyles.page}>
        <View style={receiptStyles.card}>
          <View style={receiptStyles.header}>
            <View style={receiptStyles.headerLeft}>
              <PdfImage src='/logo.png' style={receiptStyles.logo} />
              <PdfText style={receiptStyles.brand}>EduTime</PdfText>
            </View>
            <View style={receiptStyles.headerRight}>
              <PdfText style={receiptStyles.statusChip}>{translations.statusPaid}</PdfText>
            </View>
          </View>

          <PdfText style={receiptStyles.title}>{translations.title}</PdfText>
          <PdfText style={receiptStyles.subtitle}>{translations.subtitle}</PdfText>

          <View style={receiptStyles.block}>
            <PdfText style={receiptStyles.blockTitle}>{translations.issuer}</PdfText>
            <PdfText style={receiptStyles.line}>{EDU_TIME_IMPRINT.company}</PdfText>
            <PdfText style={receiptStyles.line}>{EDU_TIME_IMPRINT.careOf}</PdfText>
            <PdfText style={receiptStyles.line}>{EDU_TIME_IMPRINT.street}</PdfText>
            <PdfText style={receiptStyles.line}>{EDU_TIME_IMPRINT.city}</PdfText>
            <PdfText style={receiptStyles.line}>UID: {EDU_TIME_IMPRINT.uid}</PdfText>
            <PdfText style={receiptStyles.line}>{EDU_TIME_IMPRINT.email}</PdfText>
            <PdfText style={receiptStyles.line}>{EDU_TIME_IMPRINT.website}</PdfText>
          </View>

          <View style={receiptStyles.block}>
            <PdfText style={receiptStyles.blockTitle}>{translations.customer}</PdfText>
            <PdfText style={receiptStyles.line}>
              {translations.customerEmail}: {customerEmail || '-'}
            </PdfText>
          </View>

          <View style={[receiptStyles.block, receiptStyles.detailsBox]}>
            <View style={receiptStyles.row}>
              <PdfText style={receiptStyles.rowLabel}>{translations.issueDate}</PdfText>
              <PdfText style={receiptStyles.rowValue}>{issueDate}</PdfText>
            </View>
            <View style={receiptStyles.row}>
              <PdfText style={receiptStyles.rowLabel}>{translations.paymentDate}</PdfText>
              <PdfText style={receiptStyles.rowValue}>{paymentDate}</PdfText>
            </View>
            <View style={receiptStyles.row}>
              <PdfText style={receiptStyles.rowLabel}>{translations.product}</PdfText>
              <PdfText style={receiptStyles.rowValue}>{translations.productValue}</PdfText>
            </View>
            <View style={receiptStyles.row}>
              <PdfText style={receiptStyles.rowLabel}>{translations.periodLabel}</PdfText>
              <PdfText style={receiptStyles.rowValue}>1 {translations.periodYear}</PdfText>
            </View>
            <View style={receiptStyles.row}>
              <PdfText style={receiptStyles.rowLabel}>{translations.amount}</PdfText>
              <PdfText style={receiptStyles.rowValue}>{amountFormatted}</PdfText>
            </View>
            <View style={receiptStyles.row}>
              <PdfText style={receiptStyles.rowLabel}>{translations.currency}</PdfText>
              <PdfText style={receiptStyles.rowValue}>{invoice.currency}</PdfText>
            </View>
            <View style={receiptStyles.row}>
              <PdfText style={receiptStyles.rowLabel}>{translations.reference}</PdfText>
              <PdfText style={receiptStyles.rowValue}>{receiptReference}</PdfText>
            </View>
            <View style={receiptStyles.row}>
              <PdfText style={receiptStyles.rowLabel}>{translations.status}</PdfText>
              <PdfText style={receiptStyles.rowValue}>{translations.statusPaid}</PdfText>
            </View>
          </View>

        </View>
      </Page>
    </Document>
  )
}

export default function LicenseManagementPage() {
  const t = useTranslations('Index')
  const tPricing = useTranslations('Pricing')
  const tNoLicense = useTranslations('NoLicense')
  const router = useRouter()
  const { user, organizations, userEmail, hasActiveSubscription } = useUser()
  const backPath = hasActiveSubscription ? '/app/settings' : '/app/no-license'

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
      const receiptTranslations: ReceiptTranslations = {
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
        customerEmail: t('license-management-receipt-customer-email'),
        issuer: t('license-management-receipt-issuer'),
        product: t('license-management-receipt-product'),
        productValue: t('license-management-receipt-product-value'),
        periodLabel: t('license-management-receipt-period-label'),
        periodYear: t('license-management-receipt-period-year'),
      }

      const receiptDocument = (
        <PersonalPaymentReceiptDocument
          invoice={invoice}
          customerEmail={userEmail}
          locale={locale}
          translations={receiptTranslations}
        />
      )

      const asPdf = pdf()
      asPdf.updateContainer(receiptDocument)
      const blob = await asPdf.toBlob()
      const blobUrl = URL.createObjectURL(blob)
      const safeReference = (invoice.provider_invoice_id || invoice.id).replace(/[^a-zA-Z0-9_-]/g, '_')
      const datePart = new Date().toISOString().split('T')[0]
      const filename = `EduTime_Zahlungsbestaetigung_${safeReference}_${datePart}.pdf`

      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      if (link.parentNode === document.body) {
        document.body.removeChild(link)
      }
      URL.revokeObjectURL(blobUrl)
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
          <Button variant='subtle' onClick={() => router.push(backPath)}>
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
