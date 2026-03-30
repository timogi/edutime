import React from 'react'
import { Document, Font, Image as PdfImage, Page, StyleSheet, Text as PdfText, View, pdf } from '@react-pdf/renderer'
import { RobotoBold } from '@/assets/fonts/Roboto-Bold'
import { RobotoRegular } from '@/assets/fonts/Roboto-Regular'

export interface PaymentReceiptInvoice {
  id: string
  amount_cents: number
  currency: string
  provider_invoice_id: string | null
  paid_at: string | null
  created_at: string
}

export interface PaymentReceiptTranslations {
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
  /** Single line under customer heading, e.g. "E-Mail: …" or "Organisation: …" */
  customerLine: string
  issuer: string
  product: string
  productValue: string
  periodLabel: string
  periodYear: string
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
    borderRadius: 10,
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
    color: '#111827',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  statusChip: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    borderColor: '#a5d6a7',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    fontSize: 9,
    fontWeight: 'bold',
    lineHeight: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 14,
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
  issuerTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 5,
  },
  block: {
    marginBottom: 14,
  },
  line: {
    marginBottom: 2,
  },
  issuerLine: {
    marginBottom: 2,
    fontSize: 10,
    color: '#6b7280',
  },
  issuerBox: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fafafa',
    marginBottom: 14,
  },
  detailsBox: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
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

export interface PaymentReceiptDocumentProps {
  invoice: PaymentReceiptInvoice
  locale: string
  translations: PaymentReceiptTranslations
}

export function PaymentReceiptDocument({ invoice, locale, translations }: PaymentReceiptDocumentProps) {
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

          <View style={receiptStyles.issuerBox}>
            <PdfText style={receiptStyles.issuerTitle}>{translations.issuer}</PdfText>
            <PdfText style={receiptStyles.issuerLine}>{EDU_TIME_IMPRINT.company}</PdfText>
            <PdfText style={receiptStyles.issuerLine}>{EDU_TIME_IMPRINT.careOf}</PdfText>
            <PdfText style={receiptStyles.issuerLine}>{EDU_TIME_IMPRINT.street}</PdfText>
            <PdfText style={receiptStyles.issuerLine}>{EDU_TIME_IMPRINT.city}</PdfText>
            <PdfText style={receiptStyles.issuerLine}>UID: {EDU_TIME_IMPRINT.uid}</PdfText>
            <PdfText style={receiptStyles.issuerLine}>{EDU_TIME_IMPRINT.email}</PdfText>
            <PdfText style={receiptStyles.issuerLine}>{EDU_TIME_IMPRINT.website}</PdfText>
          </View>

          <View style={receiptStyles.block}>
            <PdfText style={receiptStyles.blockTitle}>{translations.customer}</PdfText>
            <PdfText style={receiptStyles.line}>{translations.customerLine}</PdfText>
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

export async function renderPaymentReceiptPdfBlob(element: React.ReactElement): Promise<Blob> {
  const asPdf = pdf()
  asPdf.updateContainer(element)
  return asPdf.toBlob()
}

export function triggerBrowserPdfDownload(blob: Blob, filename: string): void {
  const blobUrl = URL.createObjectURL(blob)
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
}
