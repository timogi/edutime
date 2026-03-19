import React from 'react'
import { Button, Group } from '@mantine/core'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'

interface LicenseManagementEntryProps {
  showPersonalButton?: boolean
  showOrganizationButton?: boolean
  organizationId?: number | null
}

export function LicenseManagementEntry({
  showPersonalButton = true,
  showOrganizationButton = false,
  organizationId = null,
}: LicenseManagementEntryProps) {
  const router = useRouter()
  const t = useTranslations('Index')

  const handleOpenPersonal = () => {
    void router.push('/app/settings/license-management')
  }

  const handleOpenOrganization = () => {
    const query = organizationId ? `?organizationId=${organizationId}` : ''
    void router.push(`/app/organization-management${query}`)
  }

  return (
    <Group justify='flex-start'>
      {showPersonalButton ? (
        <Button variant='light' onClick={handleOpenPersonal}>
          {t('license-management-open-page')}
        </Button>
      ) : null}
      {showOrganizationButton ? (
        <Button variant='light' onClick={handleOpenOrganization}>
          {t('org-license-management-title')}
        </Button>
      ) : null}
    </Group>
  )
}
