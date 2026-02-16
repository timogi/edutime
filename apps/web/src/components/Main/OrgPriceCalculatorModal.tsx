import React, { useState, useEffect } from 'react'
import { Text, NumberInput, Stack, Group, Table, Button, Alert, Modal } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import { supabase } from '@/utils/supabase/client'
import {
  Page,
  Text as PdfText,
  Document,
  StyleSheet,
  View,
  Image as PdfImage,
  pdf,
  Font,
} from '@react-pdf/renderer'
import { RobotoRegular } from '../../assets/fonts/Roboto-Regular'
import { RobotoBold } from '../../assets/fonts/Roboto-Bold'
import { IconFileTypePdf } from '@tabler/icons-react'
import {
  calculateOrgPrice,
  MIN_ORG_LICENSES,
  MAX_AUTO_PRICING_LICENSES,
} from '@/utils/payments/pricing'

Font.register({
  family: 'Roboto',
  fonts: [
    { src: RobotoRegular, fontWeight: 'normal' },
    { src: RobotoBold, fontWeight: 'bold' },
  ],
})

interface OrgPriceCalculatorModalProps {
  opened: boolean
  onClose: () => void
}

export function OrgPriceCalculatorModal({ opened, onClose }: OrgPriceCalculatorModalProps) {
  const t = useTranslations('PriceCalculator')
  const tPricing = useTranslations('Pricing')
  const router = useRouter()
  const [licenseCount, setLicenseCount] = useState(MIN_ORG_LICENSES)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
    }
    checkAuth()
  }, [])

  const orgPrice = calculateOrgPrice(licenseCount)
  const total = orgPrice.totalChf
  const breakdown = orgPrice.breakdown.map((item) => ({
    tier: item.pricePerLicense > 0 ? `${item.tierLabel} ${t('licenses')}` : t('moreThan100'),
    count: item.count,
    price: item.pricePerLicense,
    subtotal: item.subtotal,
  }))
  const canBuyDirectly = licenseCount <= MAX_AUTO_PRICING_LICENSES

  const handlePrimaryAction = () => {
    if (canBuyDirectly) {
      if (isLoggedIn) {
        router.push(`/checkout?plan=org&qty=${licenseCount}`)
      } else {
        router.push(`/register?intent=org&qty=${licenseCount}`)
      }
      onClose()
    } else {
      const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contact@edutime.ch'
      const subject = encodeURIComponent(t('emailSubject', { count: licenseCount }))
      const body = encodeURIComponent(t('emailBody', { count: licenseCount }))
      window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`
    }
  }

  const handleDownloadQuote = async () => {
    setIsGeneratingPdf(true)
    try {
      const quoteTranslations = {
        title: t('quoteTitle'),
        subtitle: t('quoteSubtitle'),
        date: t('quoteDate'),
        quoteNumber: t('quoteNumber'),
        disclaimer: t('quoteDisclaimer'),
        numberOfLicenses: t('quoteNumberOfLicenses'),
        duration: t('quoteDuration'),
        oneYear: t('quoteOneYear'),
        contact: t('quoteContact'),
        footer: t('quoteFooter'),
        nonBinding: t('quoteNonBinding'),
        contactForCustom: t('quoteContactForCustom'),
        tier: t('tier'),
        count: t('count'),
        pricePerLicense: t('pricePerLicense'),
        subtotal: t('subtotal'),
        total: t('total'),
        year: t('year'),
        onRequest: t('onRequest'),
      }

      const quoteDocument = (
        <QuoteDocument
          licenseCount={licenseCount}
          breakdown={breakdown}
          total={total}
          translations={quoteTranslations}
        />
      )

      const asPdf = pdf()
      asPdf.updateContainer(quoteDocument)
      const blob = await asPdf.toBlob()
      const blobUrl = URL.createObjectURL(blob)

      const dateStr = new Date().toISOString().split('T')[0]
      const filename = `EduTime_Quote_${licenseCount}_Licenses_${dateStr}.pdf`

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
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={tPricing('calculatorTitle')}
      size='xl'
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
      <Stack gap='lg' ta='center'>
        <Group justify='center' align='flex-end' gap='md'>
          <div style={{ flex: 1, maxWidth: 200 }}>
            <Text size='sm' fw={500} mb='xs'>
              {t('numberOfLicenses')}
            </Text>
            <NumberInput
              value={licenseCount}
              onChange={(value) =>
                setLicenseCount(
                  typeof value === 'number' ? Math.max(MIN_ORG_LICENSES, value) : MIN_ORG_LICENSES,
                )
              }
              min={MIN_ORG_LICENSES}
              step={1}
              size='md'
            />
          </div>
        </Group>

        {licenseCount < MIN_ORG_LICENSES && (
          <Alert color='yellow' variant='light'>
            {t('minimumLicenses')}
          </Alert>
        )}

        {licenseCount >= MIN_ORG_LICENSES && (
          <>
            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('tier')}</Table.Th>
                  <Table.Th ta='center'>{t('count')}</Table.Th>
                  <Table.Th ta='center'>{t('pricePerLicense')}</Table.Th>
                  <Table.Th ta='right'>{t('subtotal')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {breakdown.map((item, index) => (
                  <Table.Tr key={index}>
                    <Table.Td>{item.tier}</Table.Td>
                    <Table.Td ta='center'>{item.count}</Table.Td>
                    <Table.Td ta='center'>
                      {item.price > 0 ? (
                        <>
                          {item.price} CHF
                          <Text size='xs' c='dimmed'>
                            {' '}
                            / {t('year')}
                          </Text>
                        </>
                      ) : (
                        <Text c='dimmed'>{t('onRequest')}</Text>
                      )}
                    </Table.Td>
                    <Table.Td ta='right'>
                      {item.subtotal > 0 ? (
                        <>
                          <strong>{item.subtotal} CHF</strong>
                          <Text size='xs' c='dimmed'>
                            {' '}
                            / {t('year')}
                          </Text>
                        </>
                      ) : (
                        <Text c='dimmed'>{t('onRequest')}</Text>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
              <Table.Tfoot>
                <Table.Tr>
                  <Table.Td colSpan={3}>
                    <Text fw={700} size='lg'>
                      {t('total')}
                    </Text>
                  </Table.Td>
                  <Table.Td ta='right'>
                    {total > 0 ? (
                      <>
                        <Text fw={700} size='lg' c='violet'>
                          {total} CHF
                        </Text>
                        <Text size='xs' c='dimmed'>
                          {' '}
                          / {t('year')}
                        </Text>
                      </>
                    ) : (
                      <Text fw={700} size='lg' c='dimmed'>
                        {t('onRequest')}
                      </Text>
                    )}
                  </Table.Td>
                </Table.Tr>
              </Table.Tfoot>
            </Table>

            {licenseCount > MAX_AUTO_PRICING_LICENSES && (
              <Alert color='violet' variant='light'>
                {t('contactForPricing')}
              </Alert>
            )}

            <Group justify='space-between' mt='md'>
              <Button variant='subtle' onClick={onClose}>
                {tPricing('close')}
              </Button>
              <Group gap='sm'>
                {canBuyDirectly && (
                  <Button
                    variant='light'
                    leftSection={<IconFileTypePdf size={18} />}
                    onClick={handleDownloadQuote}
                    disabled={isGeneratingPdf}
                  >
                    {t('downloadQuote')}
                  </Button>
                )}
                <Button onClick={handlePrimaryAction} variant='filled'>
                  {canBuyDirectly ? tPricing('buyLicenses') : tPricing('contactUs')}
                </Button>
              </Group>
            </Group>
          </>
        )}
      </Stack>
    </Modal>
  )
}

/* ── PDF Quote Document ── */

const VIOLET = '#7c3aed'
const VIOLET_LIGHT = '#f5f3ff'
const GRAY_TEXT = '#6b7280'
const DARK_TEXT = '#111827'

const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Roboto',
    color: DARK_TEXT,
    fontSize: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 36,
    height: 36,
  },
  appName: {
    fontSize: 22,
    fontWeight: 'normal',
    color: DARK_TEXT,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  contactLine: {
    fontSize: 9,
    color: GRAY_TEXT,
    marginBottom: 2,
  },
  titleSection: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: VIOLET,
    borderBottomStyle: 'solid',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: DARK_TEXT,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: GRAY_TEXT,
  },
  nonBinding: {
    fontSize: 9,
    color: VIOLET,
    marginTop: 4,
  },
  infoSection: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 40,
  },
  infoBlock: {
    flexDirection: 'column',
  },
  infoLabel: {
    fontSize: 9,
    color: GRAY_TEXT,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: DARK_TEXT,
  },
  table: {
    marginBottom: 20,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: VIOLET,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid',
  },
  tableRowAlt: {
    backgroundColor: '#f9fafb',
  },
  tableCell: {
    fontSize: 10,
    color: DARK_TEXT,
  },
  colTier: { width: '35%' },
  colCount: { width: '15%', textAlign: 'center' },
  colPrice: { width: '25%', textAlign: 'center' },
  colSubtotal: { width: '25%', textAlign: 'right' },
  totalRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: VIOLET_LIGHT,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: DARK_TEXT,
    width: '75%',
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: VIOLET,
    width: '25%',
    textAlign: 'right',
  },
  disclaimer: {
    fontSize: 9,
    color: GRAY_TEXT,
    marginTop: 12,
  },
  contactForCustom: {
    fontSize: 10,
    color: VIOLET,
    marginTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: GRAY_TEXT,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    borderTopStyle: 'solid',
    paddingTop: 10,
  },
})

interface QuoteDocumentProps {
  licenseCount: number
  breakdown: Array<{ tier: string; count: number; price: number; subtotal: number }>
  total: number
  translations: Record<string, string>
}

const generateQuoteNumber = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const seq = String(
    now.getMonth() * 100000 +
      now.getDate() * 1000 +
      now.getHours() * 10 +
      Math.floor(now.getMinutes() / 6),
  ).padStart(6, '0')
  return `ET-${year}-${seq}`
}

const QuoteDocument = ({ licenseCount, breakdown, total, translations }: QuoteDocumentProps) => {
  const now = new Date()
  const dateStr = now.toLocaleDateString('de-CH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const quoteNumber = generateQuoteNumber()

  return (
    <Document title={translations.title} creator='EduTime' producer='EduTime'>
      <Page size='A4' style={pdfStyles.page}>
        {/* Header with logo and contact */}
        <View style={pdfStyles.header}>
          <View style={pdfStyles.logoRow}>
            <PdfImage src='/logo.png' style={pdfStyles.logo} />
            <PdfText style={pdfStyles.appName}>EduTime</PdfText>
          </View>
          <View style={pdfStyles.headerRight}>
            <PdfText style={pdfStyles.contactLine}>EduTime GmbH</PdfText>
            <PdfText style={pdfStyles.contactLine}>c/o Tim Ogi</PdfText>
            <PdfText style={pdfStyles.contactLine}>Bienenstrasse 8</PdfText>
            <PdfText style={pdfStyles.contactLine}>3018 Bern</PdfText>
            <PdfText style={[pdfStyles.contactLine, { marginTop: 4 }]}>info@edutime.ch</PdfText>
          </View>
        </View>

        {/* Title */}
        <View style={pdfStyles.titleSection}>
          <PdfText style={pdfStyles.title}>{translations.nonBinding}</PdfText>
          <PdfText style={pdfStyles.subtitle}>{translations.subtitle}</PdfText>
        </View>

        {/* Info row: Quote Nr, Stand, Licenses, Duration */}
        <View style={pdfStyles.infoSection}>
          <View style={pdfStyles.infoBlock}>
            <PdfText style={pdfStyles.infoLabel}>{translations.quoteNumber}</PdfText>
            <PdfText style={pdfStyles.infoValue}>{quoteNumber}</PdfText>
          </View>
          <View style={pdfStyles.infoBlock}>
            <PdfText style={pdfStyles.infoLabel}>{translations.date}</PdfText>
            <PdfText style={pdfStyles.infoValue}>{dateStr}</PdfText>
          </View>
          <View style={pdfStyles.infoBlock}>
            <PdfText style={pdfStyles.infoLabel}>{translations.numberOfLicenses}</PdfText>
            <PdfText style={pdfStyles.infoValue}>{licenseCount}</PdfText>
          </View>
          <View style={pdfStyles.infoBlock}>
            <PdfText style={pdfStyles.infoLabel}>{translations.duration}</PdfText>
            <PdfText style={pdfStyles.infoValue}>{translations.oneYear}</PdfText>
          </View>
        </View>

        {/* Price breakdown table */}
        <View style={pdfStyles.table}>
          {/* Table header */}
          <View style={pdfStyles.tableHeaderRow}>
            <PdfText style={[pdfStyles.tableHeaderCell, pdfStyles.colTier]}>
              {translations.tier}
            </PdfText>
            <PdfText style={[pdfStyles.tableHeaderCell, pdfStyles.colCount]}>
              {translations.count}
            </PdfText>
            <PdfText style={[pdfStyles.tableHeaderCell, pdfStyles.colPrice]}>
              {translations.pricePerLicense}
            </PdfText>
            <PdfText style={[pdfStyles.tableHeaderCell, pdfStyles.colSubtotal]}>
              {translations.subtotal}
            </PdfText>
          </View>

          {/* Table rows */}
          {breakdown.map((item, index) => (
            <View
              key={index}
              style={[pdfStyles.tableRow, index % 2 === 1 ? pdfStyles.tableRowAlt : {}]}
            >
              <PdfText style={[pdfStyles.tableCell, pdfStyles.colTier]}>{item.tier}</PdfText>
              <PdfText style={[pdfStyles.tableCell, pdfStyles.colCount]}>{item.count}</PdfText>
              <PdfText style={[pdfStyles.tableCell, pdfStyles.colPrice]}>
                {item.price > 0
                  ? `${item.price} CHF / ${translations.year}`
                  : translations.onRequest}
              </PdfText>
              <PdfText style={[pdfStyles.tableCell, pdfStyles.colSubtotal]}>
                {item.subtotal > 0
                  ? `${item.subtotal} CHF / ${translations.year}`
                  : translations.onRequest}
              </PdfText>
            </View>
          ))}

          {/* Total row */}
          <View style={pdfStyles.totalRow}>
            <PdfText style={pdfStyles.totalLabel}>{translations.total}</PdfText>
            <PdfText style={pdfStyles.totalValue}>
              {total > 0 ? `${total} CHF / ${translations.year}` : translations.onRequest}
            </PdfText>
          </View>
        </View>

        {/* Disclaimer */}
        <PdfText style={pdfStyles.disclaimer}>{translations.disclaimer}</PdfText>

        {/* Custom pricing note for >100 */}
        {licenseCount > MAX_AUTO_PRICING_LICENSES && (
          <PdfText style={pdfStyles.contactForCustom}>{translations.contactForCustom}</PdfText>
        )}

        {/* Footer */}
        <PdfText style={pdfStyles.footer}>{translations.footer}</PdfText>
      </Page>
    </Document>
  )
}
