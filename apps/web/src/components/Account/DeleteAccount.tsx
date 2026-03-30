import React, { useCallback, useEffect, useState } from 'react'
import { Button, Stack, Text, Group, Modal, Alert } from '@mantine/core'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import { GetStaticPropsContext } from 'next/types'
import { supabase } from '@/utils/supabase/client'

interface DeleteAccountProps {
  user_id: string
}

type DeleteAccountApiResponse = {
  message?: string
  error?: string
  code?: 'SOLE_ADMIN_BLOCKER' | 'PERSONAL_SUBSCRIPTION_CANCEL_REQUIRED'
  blockers?: Array<{ organizationId: number; organizationName: string }>
}

type PersonalSubscriptionResponse = {
  subscription: {
    id: string
    cancel_at_period_end: boolean
  } | null
  error?: string
}

const clearSupabaseAuthStorage = () => {
  if (typeof window === 'undefined') return

  const removeMatchingKeys = (storage: Storage) => {
    const keysToRemove: string[] = []
    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i)
      if (!key) continue
      if (key.startsWith('sb-') && key.includes('-auth-token')) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((key) => storage.removeItem(key))
  }

  try {
    removeMatchingKeys(window.localStorage)
  } catch (error) {
    console.error('Failed to clear localStorage auth keys:', error)
  }

  try {
    removeMatchingKeys(window.sessionStorage)
  } catch (error) {
    console.error('Failed to clear sessionStorage auth keys:', error)
  }

  try {
    const cookies = document.cookie ? document.cookie.split(';') : []
    cookies.forEach((cookie) => {
      const trimmed = cookie.trim()
      const equalIndex = trimmed.indexOf('=')
      const name = equalIndex > 0 ? trimmed.slice(0, equalIndex) : trimmed
      if (name.startsWith('sb-')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
      }
    })
  } catch (error) {
    console.error('Failed to clear auth cookies:', error)
  }
}

export const DeleteAccount: React.FC<DeleteAccountProps> = ({ user_id }) => {
  const t = useTranslations('Index')
  const [error, setError] = useState('')
  const [blockedOrganizations, setBlockedOrganizations] = useState<
    Array<{ organizationId: number; organizationName: string }>
  >([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(true)
  const [showPersonalLicenseConfirm, setShowPersonalLicenseConfirm] = useState(false)
  const router = useRouter()

  const checkDeletionEligibility = useCallback(async () => {
    setIsCheckingEligibility(true)
    setError('')
    setBlockedOrganizations([])

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session || !session.access_token) {
        setError('Unauthorized')
        return false
      }

      const response = await fetch('/api/users/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ user_id, checkOnly: true }),
      })

      const result = (await response.json()) as DeleteAccountApiResponse

      if (!response.ok) {
        setError(result.error || 'Failed to validate account deletion constraints')
        return false
      }

      if (result.code === 'SOLE_ADMIN_BLOCKER' && Array.isArray(result.blockers)) {
        setBlockedOrganizations(result.blockers)
        setError(t('delete-account-blocked-admin-title'))
        return false
      }

      return true
    } catch (checkError: unknown) {
      console.error('Deletion eligibility check error:', checkError)
      setError(checkError instanceof Error ? checkError.message : 'An unexpected error occurred')
      return false
    } finally {
      setIsCheckingEligibility(false)
    }
  }, [user_id])

  useEffect(() => {
    void checkDeletionEligibility()
  }, [checkDeletionEligibility])

  const handleDelete = async (skipPersonalLicenseConfirm = false) => {
    if (isDeleting || isCheckingEligibility) {
      return
    }

    setIsDeleting(true)
    setError('')
    setBlockedOrganizations([])

    try {
      const isEligible = await checkDeletionEligibility()
      if (!isEligible) {
        setIsDeleting(false)
        return
      }

      // Get the current session to use for authentication
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session || !session.access_token) {
        setError('Unauthorized')
        setIsDeleting(false)
        return
      }

      const subscriptionResponse = await fetch('/api/billing/personal-subscription', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        credentials: 'include',
      })

      if (subscriptionResponse.ok) {
        const subscriptionPayload = (await subscriptionResponse.json()) as PersonalSubscriptionResponse
        if (
          subscriptionPayload.subscription &&
          subscriptionPayload.subscription.cancel_at_period_end === false &&
          !skipPersonalLicenseConfirm
        ) {
          setShowPersonalLicenseConfirm(true)
          setIsDeleting(false)
          return
        }
      }

      // Call the API route to delete the account
      // Send the access token in the Authorization header for reliable authentication
      const response = await fetch('/api/users/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`, // Send access token directly
        },
        credentials: 'include', // Also send cookies as fallback
        body: JSON.stringify({ user_id }),
      })

      const result = (await response.json()) as DeleteAccountApiResponse

      if (!response.ok) {
        if (result.code === 'SOLE_ADMIN_BLOCKER' && Array.isArray(result.blockers)) {
          setBlockedOrganizations(result.blockers)
          setError(t('delete-account-blocked-admin-title'))
          setIsDeleting(false)
          return
        }
        throw new Error(result.error || 'Failed to delete account')
      }

      // User no longer exists server-side; make sure we fully clear all local auth state.
      try {
        await supabase.auth.signOut()
      } catch (signOutError: unknown) {
        console.error('Global sign-out after account deletion:', signOutError)
      }

      try {
        await supabase.auth.signOut({ scope: 'local' })
      } catch (signOutError: unknown) {
        console.error('Local sign-out after account deletion:', signOutError)
      }

      clearSupabaseAuthStorage()

      const defaultLocale = router.defaultLocale ?? 'de'
      const locale = router.locale ?? defaultLocale
      const homeUrl =
        locale === defaultLocale ? '/?accountDeleted=1' : `/${locale}?accountDeleted=1`
      window.location.assign(homeUrl)
    } catch (error: unknown) {
      console.error('Deletion error:', error)
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('An unexpected error occurred')
      }
      setIsDeleting(false)
    }
  }

  return (
    <Stack>
      <Text c='dimmed'>{t('delete-account-info')}</Text>
      {error && (
        <Stack gap={4}>
          <Text c='red' size='sm'>
            {error}
          </Text>
          {blockedOrganizations.length > 0 ? (
            <>
              <Text size='sm'>{t('delete-account-blocked-admin-instruction')}</Text>
              {blockedOrganizations.map((org) => (
                <Text key={org.organizationId} size='sm' c='dimmed'>
                  - {org.organizationName}
                </Text>
              ))}
            </>
          ) : null}
        </Stack>
      )}
      <Group justify='flex-end' mt='md'>
        {blockedOrganizations.length > 0 ? (
          <Button
            variant='light'
            onClick={() => router.push(`/app/organization-management?organizationId=${blockedOrganizations[0].organizationId}`)}
          >
            {t('delete-account-open-org-settings')}
          </Button>
        ) : null}
        <Button
          variant='filled'
          color='red'
          onClick={handleDelete}
          loading={isDeleting || isCheckingEligibility}
          disabled={blockedOrganizations.length > 0 || isCheckingEligibility}
        >
          {t('delete-account')}
        </Button>
      </Group>
      <Modal
        opened={showPersonalLicenseConfirm}
        onClose={() => setShowPersonalLicenseConfirm(false)}
        title={t('delete-account')}
        centered
      >
        <Stack gap='md'>
          <Alert color='orange' variant='light'>
            {t('delete-account-personal-license-confirm')}
          </Alert>
          <Group justify='flex-end'>
            <Button variant='subtle' onClick={() => setShowPersonalLicenseConfirm(false)}>
              {t('cancel')}
            </Button>
            <Button
              color='red'
              variant='light'
              loading={isDeleting || isCheckingEligibility}
              disabled={isDeleting || isCheckingEligibility}
              onClick={async () => {
                setShowPersonalLicenseConfirm(false)
                await handleDelete(true)
              }}
            >
              {t('delete-account')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}
export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../../messages/${locale}.json`)).default,
    },
  }
}
