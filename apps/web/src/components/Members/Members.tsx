import React, { useState, useEffect, useMemo } from 'react'
import { Button, Container, Stack, Center, Loader } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import TableSelection from './TableSelection'
import { Organization, UserData } from '@/types/globals'
import { supabase } from '@/utils/supabase/client'
import { OrganizationPicker } from '@/components/Organization/OrganizationPicker'

interface MembersProps {
  organizations: Organization[]
  userData: UserData
  onMembersChanged: () => Promise<void>
  showBackToNoLicense?: boolean
}

export const Members = ({
  organizations,
  userData,
  onMembersChanged,
  showBackToNoLicense = false,
}: MembersProps) => {
  const router = useRouter()
  const t = useTranslations('Index')
  const tNoLicense = useTranslations('NoLicense')
  const [activePage, setActivePage] = useState(1)
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)
  const [isCheckingOrgLicense, setIsCheckingOrgLicense] = useState(false)

  const orgIdFromQuery = useMemo(() => {
    const raw = router.query.organizationId
    if (typeof raw === 'string') return raw
    if (Array.isArray(raw) && raw[0]) return raw[0]
    return undefined
  }, [router.query.organizationId])

  const orgFromQueryInList =
    !!orgIdFromQuery && organizations.some((o) => String(o.id) === orgIdFromQuery)

  useEffect(() => {
    if (!router.isReady) {
      return
    }

    if (!orgIdFromQuery || !orgFromQueryInList) {
      setIsCheckingOrgLicense(false)
      return
    }

    let cancelled = false
    setIsCheckingOrgLicense(true)

    const run = async () => {
      let clearLoading = true
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session?.access_token || cancelled) {
          return
        }

        const response = await fetch(
          `/api/billing/org-license?organizationId=${encodeURIComponent(orgIdFromQuery)}`,
          {
            credentials: 'include',
            headers: { Authorization: `Bearer ${session.access_token}` },
          },
        )

        if (!response.ok || cancelled) {
          return
        }

        const payload = (await response.json()) as {
          data?: { subscriptionStatus?: string } | null
        }

        const status = payload.data?.subscriptionStatus
        const allowsMemberManagement = status === 'active' || status === 'active_unpaid'

        if (cancelled || allowsMemberManagement) {
          return
        }

        clearLoading = false

        notifications.show({
          title: tNoLicense('org-no-license-title'),
          message: tNoLicense('org-no-license-description'),
          color: 'yellow',
        })

        await router.replace(
          `/app/organization-management?organizationId=${encodeURIComponent(orgIdFromQuery)}`,
        )
      } catch (error) {
        console.error('Failed to verify org license for members page:', error)
      } finally {
        if (!cancelled && clearLoading) {
          setIsCheckingOrgLicense(false)
        }
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [router.isReady, orgIdFromQuery, orgFromQueryInList, router, tNoLicense])

  useEffect(() => {
    if (organizations.length === 0) {
      setSelectedOrgId(null)
      return
    }

    if (!router.isReady) {
      setSelectedOrgId(String(organizations[0].id))
      return
    }

    const raw = router.query.organizationId
    const idStr = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : undefined
    if (idStr) {
      const match = organizations.find((o) => String(o.id) === idStr)
      if (match) {
        setSelectedOrgId(String(match.id))
        return
      }
    }

    setSelectedOrgId((prev) =>
      prev && organizations.some((o) => String(o.id) === prev) ? prev : String(organizations[0].id),
    )
  }, [router.isReady, router.query.organizationId, organizations])

  const showOrgLicenseGateLoader =
    Boolean(orgIdFromQuery && orgFromQueryInList) && (!router.isReady || isCheckingOrgLicense)

  if (showOrgLicenseGateLoader) {
    return (
      <Container fluid py='xl' px={{ base: 'xs', sm: 'md', lg: 'xl' }}>
        <Center py='xl'>
          <Loader size='md' />
        </Center>
      </Container>
    )
  }

  return (
    <Container fluid py='xl' px={{ base: 'xs', sm: 'md', lg: 'xl' }}>
      <Stack gap='lg' w='100%'>
        <Stack gap='xs' align='flex-start'>
          {showBackToNoLicense ? (
            <Button variant='subtle' w='fit-content' onClick={() => void router.push('/app/no-license')}>
              ← {t('back')}
            </Button>
          ) : null}
          <OrganizationPicker
            organizations={organizations}
            value={selectedOrgId}
            onChange={setSelectedOrgId}
            placeholder={t('Select organization')}
            minWidth={300}
          />
        </Stack>
        <TableSelection
          organizations={organizations}
          currentUserEmail={userData.email}
          onMembersChanged={onMembersChanged}
          activePage={activePage}
          setActivePage={setActivePage}
          selectedOrgId={selectedOrgId}
        />
      </Stack>
    </Container>
  )
}
