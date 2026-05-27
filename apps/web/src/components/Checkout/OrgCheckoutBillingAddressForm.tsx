import { useEffect, useState } from 'react'
import { Button, Paper, Select, Stack, Text, TextInput, Title } from '@mantine/core'
import { useTranslations } from 'next-intl'
import type { OrgBillingAddress } from '@/utils/payments/orgBillingAddress'
import { normalizeOrgBillingAddress } from '@/utils/payments/orgBillingAddress'

const COUNTRY_OPTIONS = [
  { value: 'CH', labelKey: 'checkout-org-billing-country-ch' as const },
  { value: 'DE', labelKey: 'checkout-org-billing-country-de' as const },
  { value: 'FR', labelKey: 'checkout-org-billing-country-fr' as const },
  { value: 'AT', labelKey: 'checkout-org-billing-country-at' as const },
  { value: 'LI', labelKey: 'checkout-org-billing-country-li' as const },
] as const

export interface OrgCheckoutBillingAddressFormProps {
  defaultCompanyName?: string
  onSubmit: (address: OrgBillingAddress) => void
}

export function OrgCheckoutBillingAddressForm({
  defaultCompanyName,
  onSubmit,
}: OrgCheckoutBillingAddressFormProps) {
  const t = useTranslations('Index')
  const [company, setCompany] = useState(defaultCompanyName ?? '')
  const [street, setStreet] = useState('')
  const [postcode, setPostcode] = useState('')
  const [place, setPlace] = useState('')
  const [country, setCountry] = useState<string>('CH')
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (defaultCompanyName && !company) {
      setCompany(defaultCompanyName)
    }
  }, [defaultCompanyName, company])

  const handleSubmit = () => {
    const normalized = normalizeOrgBillingAddress({
      company,
      street,
      postcode,
      place,
      country,
    })

    if (!normalized) {
      setFormError(t('checkout-org-billing-invalid'))
      return
    }

    setFormError(null)
    onSubmit(normalized)
  }

  const countrySelectData = COUNTRY_OPTIONS.map((option) => ({
    value: option.value,
    label: t(option.labelKey),
  }))

  return (
    <Paper withBorder p={30} radius='md'>
      <Stack gap='md'>
        <Title order={3}>{t('checkout-org-billing-title')}</Title>
        <Text c='dimmed' size='sm'>
          {t('checkout-org-billing-description')}
        </Text>
        <TextInput
          label={t('checkout-org-billing-company-label')}
          placeholder={t('checkout-org-billing-company-placeholder')}
          required
          value={company}
          onChange={(event) => {
            setCompany(event.currentTarget.value)
            if (formError) setFormError(null)
          }}
        />
        <TextInput
          label={t('checkout-org-billing-street-label')}
          placeholder={t('checkout-org-billing-street-placeholder')}
          required
          value={street}
          onChange={(event) => {
            setStreet(event.currentTarget.value)
            if (formError) setFormError(null)
          }}
        />
        <TextInput
          label={t('checkout-org-billing-postcode-label')}
          placeholder={t('checkout-org-billing-postcode-placeholder')}
          required
          value={postcode}
          onChange={(event) => {
            setPostcode(event.currentTarget.value)
            if (formError) setFormError(null)
          }}
        />
        <TextInput
          label={t('checkout-org-billing-place-label')}
          placeholder={t('checkout-org-billing-place-placeholder')}
          required
          value={place}
          onChange={(event) => {
            setPlace(event.currentTarget.value)
            if (formError) setFormError(null)
          }}
        />
        <Select
          label={t('checkout-org-billing-country-label')}
          required
          data={countrySelectData}
          value={country}
          onChange={(value) => {
            setCountry(value ?? 'CH')
            if (formError) setFormError(null)
          }}
        />
        {formError ? (
          <Text c='red' size='sm'>
            {formError}
          </Text>
        ) : null}
        <Button onClick={handleSubmit}>{t('checkout-org-billing-continue')}</Button>
      </Stack>
    </Paper>
  )
}
