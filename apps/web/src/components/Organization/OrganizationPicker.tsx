import React from 'react'
import { Select } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { Organization } from '@/types/globals'

interface OrganizationPickerProps {
  organizations: Organization[]
  value: string | null
  onChange: (value: string | null) => void
  minWidth?: number
  label?: string
  placeholder?: string
}

export function OrganizationPicker({
  organizations,
  value,
  onChange,
  minWidth = 280,
  label,
  placeholder,
}: OrganizationPickerProps) {
  const t = useTranslations('Index')

  return (
    <Select
      data={organizations.map((org) => ({
        value: String(org.id),
        label: org.is_active ? org.name : `${org.name} (${t('org-management-select-inactive-suffix')})`,
      }))}
      value={value}
      onChange={onChange}
      style={{ minWidth }}
      label={label ?? t('org-license-organization')}
      placeholder={placeholder}
    />
  )
}

