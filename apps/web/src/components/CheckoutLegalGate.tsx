import { useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import {
  Stack,
  Text,
  Button,
  Group,
  Anchor,
  Title,
  Alert,
  Loader,
  Paper,
  Container,
  Checkbox,
  Divider,
} from '@mantine/core'
import { IconAlertCircle, IconExternalLink } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'
import { DOCUMENT_ROUTES, DOCUMENT_LABELS } from '@edutime/shared'
import { calculateOrgPrice, INDIVIDUAL_ANNUAL_PRICE_CHF } from '@/utils/payments/pricing'

const DAILY_TEST_PRICE_CHF = 1

interface MissingDocumentResponse {
  document_code: string
  document_version_id: number
  title: string
  version_label: string
  can_accept: boolean
}

type CheckoutPlan = 'annual' | 'org'
type BillingCycle = 'annual' | 'daily_test'

interface CheckoutLegalGateProps {
  accessToken?: string
  legalContext?: 'checkout_individual' | 'checkout_org'
  plan: CheckoutPlan
  qty?: number
  billingCycle?: BillingCycle
  onAllAccepted: () => void
  onAuthError?: () => void
}

export function CheckoutLegalGate({
  accessToken,
  legalContext = 'checkout_individual',
  plan,
  qty = 1,
  billingCycle = 'annual',
  onAllAccepted,
  onAuthError,
}: CheckoutLegalGateProps) {
  const t = useTranslations('CheckoutLegal')
  const [missingDocs, setMissingDocs] = useState<MissingDocumentResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [acceptedDocs, setAcceptedDocs] = useState<Set<string>>(new Set())

  const isDailyTest = plan === 'annual' && billingCycle === 'daily_test'

  const priceSummary = useMemo(() => {
    if (isDailyTest) {
      return {
        productLabel: t('productIndividualDailyTest'),
        amountChf: DAILY_TEST_PRICE_CHF,
        periodLabel: t('pricePerDay'),
      }
    }
    if (plan === 'org') {
      const orgPrice = calculateOrgPrice(qty)
      return {
        productLabel: t('productOrg'),
        amountChf: orgPrice.totalChf,
        periodLabel: t('pricePerYear'),
        seats: qty,
      }
    }
    return {
      productLabel: t('productIndividualAnnual'),
      amountChf: INDIVIDUAL_ANNUAL_PRICE_CHF,
      periodLabel: t('pricePerYear'),
    }
  }, [isDailyTest, plan, qty, t])

  const checkMissingDocuments = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`
      }

      const response = await fetch('/api/legal/missing', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ context: legalContext }),
      })

      if (!response.ok) {
        if (response.status === 401 && onAuthError) {
          onAuthError()
          return
        }
        const errorData = await response.json()
        setError(errorData.error || t('errorGeneric'))
        setIsLoading(false)
        return
      }

      const data = await response.json()
      const missing = data.missing || []
      setMissingDocs(missing)

      if (missing.length === 0) {
        onAllAccepted()
      }
    } catch (checkError) {
      console.error('Error checking missing documents:', checkError)
      setError(t('errorGeneric'))
    } finally {
      setIsLoading(false)
    }
  }, [accessToken, legalContext, onAllAccepted, onAuthError, t])

  useEffect(() => {
    checkMissingDocuments()
  }, [checkMissingDocuments])

  const handleCheckboxChange = (code: string, checked: boolean) => {
    const next = new Set(acceptedDocs)
    if (checked) {
      next.add(code)
    } else {
      next.delete(code)
    }
    setAcceptedDocs(next)
  }

  const handleContinue = async () => {
    const toAccept = missingDocs.filter((doc) => acceptedDocs.has(doc.document_code) && doc.can_accept)
    if (toAccept.length === 0) return

    setAccepting(true)
    setError(null)
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`
      }

      for (const doc of toAccept) {
        const response = await fetch('/api/legal/accept', {
          method: 'POST',
          headers,
          credentials: 'include',
          body: JSON.stringify({
            documentCode: doc.document_code,
            source: 'checkout',
          }),
        })

        if (!response.ok) {
          if (response.status === 401 && onAuthError) {
            onAuthError()
            return
          }
          const errorData = await response.json()
          setError(errorData.error || t('errorAcceptFailed'))
          return
        }
      }

      await checkMissingDocuments()
    } catch (acceptError) {
      console.error('Error accepting documents:', acceptError)
      setError(t('errorGeneric'))
    } finally {
      setAccepting(false)
    }
  }

  const allDocsAccepted = missingDocs.every(
    (doc) => acceptedDocs.has(doc.document_code) || !doc.can_accept,
  )
  const canContinue = allDocsAccepted && !accepting

  if (isLoading) {
    return (
      <Container size={600} my={40}>
        <Paper withBorder p={30} radius='md'>
          <Stack gap='md' align='center'>
            <Loader size='lg' />
            <Text c='dimmed' ta='center'>
              {t('loading')}
            </Text>
          </Stack>
        </Paper>
      </Container>
    )
  }

  if (error && missingDocs.length === 0) {
    return (
      <Container size={600} my={40}>
        <Paper withBorder p={30} radius='md'>
          <Stack gap='lg'>
            <Title order={2}>{t('errorTitle')}</Title>
            <Alert icon={<IconAlertCircle size='1rem' />} color='red' title={t('errorTitle')}>
              {error}
            </Alert>
            <Button onClick={checkMissingDocuments} variant='filled'>
              {t('retry')}
            </Button>
          </Stack>
        </Paper>
      </Container>
    )
  }

  if (missingDocs.length === 0) {
    return null
  }

  return (
    <Container size={600} my={40}>
      <Paper withBorder p={30} radius='md'>
        <Stack gap='lg'>
          <Title order={2}>{t('title')}</Title>
          <Text c='dimmed'>{t('description')}</Text>

          <Paper
            withBorder
            p='md'
            radius='md'
            bg='light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))'
          >
            <Stack gap='xs'>
              <Text fw={600} size='sm'>
                {t('summaryTitle')}
              </Text>
              <Text size='sm'>{priceSummary.productLabel}</Text>
              {priceSummary.seats != null ? (
                <Text size='sm' c='dimmed'>
                  {t('orgSeats', { count: priceSummary.seats })}
                </Text>
              ) : null}
              <Group justify='space-between' mt='xs'>
                <Text size='sm' fw={500}>
                  {t('totalLabel')}
                </Text>
                <Text size='sm' fw={600}>
                  {priceSummary.amountChf} CHF {priceSummary.periodLabel}
                </Text>
              </Group>
              <Text size='xs' c='dimmed'>
                {t('noVatNote')}
              </Text>
            </Stack>
          </Paper>

          <Alert variant='light' color='blue' title={t('autoRenewTitle')}>
            <Text size='sm'>
              {plan === 'org' ? t('autoRenewOrg') : t('autoRenewIndividual')}
            </Text>
          </Alert>

          <Divider />

          <Stack gap='md'>
            <Text fw={600}>{t('documentsTitle')}</Text>
            {missingDocs.map((doc) => (
              <Stack key={doc.document_version_id} gap='xs'>
                <Group gap='xs' wrap='wrap'>
                  <Text fw={500} size='sm'>
                    {DOCUMENT_LABELS[doc.document_code] || doc.title}
                  </Text>
                  {doc.version_label ? (
                    <Text size='sm' c='dimmed'>
                      ({doc.version_label})
                    </Text>
                  ) : null}
                </Group>
                {DOCUMENT_ROUTES[doc.document_code] ? (
                  <Anchor
                    href={DOCUMENT_ROUTES[doc.document_code]}
                    target='_blank'
                    size='sm'
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    <IconExternalLink size='0.875rem' />
                    {t('openDocument')}
                  </Anchor>
                ) : null}
                {doc.can_accept ? (
                  <Checkbox
                    label={t('acceptDocument', {
                      title: DOCUMENT_LABELS[doc.document_code] || doc.title,
                    })}
                    checked={acceptedDocs.has(doc.document_code)}
                    onChange={(event) =>
                      handleCheckboxChange(doc.document_code, event.currentTarget.checked)
                    }
                    disabled={accepting}
                  />
                ) : (
                  <Text size='sm' c='dimmed'>
                    {t('cannotAccept')}
                  </Text>
                )}
              </Stack>
            ))}
          </Stack>

          {plan === 'org' ? (
            <Text size='sm' c='dimmed'>
              {t('avvHintPrefix')}{' '}
              <Anchor component={Link} href='/docs/avv' target='_blank' size='sm' underline='always'>
                {t('avvHintLink')}
              </Anchor>
              {t('avvHintSuffix')}
            </Text>
          ) : null}

          {missingDocs.some((doc) => !doc.can_accept) ? (
            <Alert icon={<IconAlertCircle size='1rem' />} color='yellow' title={t('cannotAcceptNoteTitle')}>
              {t('cannotAcceptNote')}
            </Alert>
          ) : null}

          {error ? (
            <Alert icon={<IconAlertCircle size='1rem' />} color='red'>
              {error}
            </Alert>
          ) : null}

          <Button onClick={handleContinue} loading={accepting} disabled={!canContinue} fullWidth>
            {t('continueButton')}
          </Button>
        </Stack>
      </Paper>
    </Container>
  )
}
