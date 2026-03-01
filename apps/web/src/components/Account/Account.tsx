import React, { useState, useEffect, useCallback } from 'react'
import {
  TextInput,
  Button,
  Stack,
  Text,
  Card,
  Modal,
  Group,
  Badge,
  SimpleGrid,
  Paper,
} from '@mantine/core'
import { useTranslations } from 'next-intl'
import { updateUserData } from '@/utils/supabase/user'
import { useRouter } from 'next/router'
import { useDisclosure } from '@mantine/hooks'
import { DeleteAccount } from './DeleteAccount'
import { GetStaticPropsContext } from 'next/types'
import { IconDeviceFloppy } from '@tabler/icons-react'
import LocaleSwitcher from '../Settings/LocaleSwitcher'
import { getUserEntitlements } from '@edutime/shared'
import { UserData, Entitlement } from '@/types/globals'
import { supabase } from '@/utils/supabase/client'
import { getMemberships, getOrganizations } from '@/utils/supabase/organizations'
import classes from './Account.module.css'
import { notifications } from '@mantine/notifications'

interface AccountProps {
  userData: UserData
  reloadUserData: () => void
}

interface LicenseManagementSubscription {
  id: string
  cancel_at_period_end: boolean
  canceled_at: string | null
  current_period_end: string | null
}

interface LicenseManagementData {
  subscription: LicenseManagementSubscription | null
}

export const Account = ({ userData, reloadUserData }: AccountProps) => {
  const router = useRouter()
  const [firstName, setFirstName] = useState(userData.first_name)
  const [lastName, setLastName] = useState(userData.last_name)
  const [email, setEmail] = useState(userData.email)
  const [isUserDataUpdating, setIsUserDataUpdating] = useState(false)
  const [opened, { open, close }] = useDisclosure(false)
  const [entitlements, setEntitlements] = useState<Entitlement[]>([])
  const [organizationNamesById, setOrganizationNamesById] = useState<Record<number, string>>({})
  const [isLoadingEntitlements, setIsLoadingEntitlements] = useState(false)
  const [licenseManagementData, setLicenseManagementData] = useState<LicenseManagementData | null>(null)
  const [isLoadingLicenseManagement, setIsLoadingLicenseManagement] = useState(false)
  const t = useTranslations('Index')

  const getLicenseStatusColor = (status: Entitlement['status']) => {
    if (status === 'active') return 'green'
    if (status === 'pending') return 'yellow'
    if (status === 'expired') return 'gray'
    return 'red'
  }

  const formatDate = (value: string | null) => {
    if (!value) return t('license-unlimited')
    return new Date(value).toLocaleDateString(router.locale || 'de')
  }

  const getAuthenticatedRequestInit = async (
    init?: Omit<RequestInit, 'headers' | 'credentials'>,
  ): Promise<RequestInit> => {
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
  }

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
  }, [t])

  const handleUpdateUserData = async () => {
    setIsUserDataUpdating(true)
    if (!userData) {
      setIsUserDataUpdating(false)
      return
    }
    const updatedUserData: Partial<UserData> = {
      first_name: firstName,
      last_name: lastName,
    }
    await updateUserData(updatedUserData, userData.user_id)
    reloadUserData()
    setIsUserDataUpdating(false)
  }

  // Load entitlements
  useEffect(() => {
    const loadEntitlements = async () => {
      if (!userData?.user_id) return
      setIsLoadingEntitlements(true)
      try {
        const userEntitlements = await getUserEntitlements(supabase, userData.user_id)
        setEntitlements(userEntitlements)
        const orgEntitlementIds = Array.from(
          new Set(
            userEntitlements
              .filter((entitlement) => entitlement.kind === 'org_seat' && entitlement.organization_id != null)
              .map((entitlement) => entitlement.organization_id as number),
          ),
        )
        if (orgEntitlementIds.length > 0) {
          const [memberships, adminOrganizations] = await Promise.all([
            getMemberships(userData.email),
            getOrganizations(userData.user_id),
          ])
          const orgNames: Record<number, string> = {}
          memberships.forEach((membership) => {
            if (orgEntitlementIds.includes(membership.id)) {
              orgNames[membership.id] = membership.name
            }
          })
          adminOrganizations.forEach((organization) => {
            if (orgEntitlementIds.includes(organization.id)) {
              orgNames[organization.id] = organization.name
            }
          })
          setOrganizationNamesById(orgNames)
        } else {
          setOrganizationNamesById({})
        }
        await loadLicenseManagementData()
      } catch (error) {
        console.error('Error loading entitlements:', error)
      } finally {
        setIsLoadingEntitlements(false)
      }
    }
    loadEntitlements()
  }, [userData.user_id, loadLicenseManagementData])

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title={t('delete-account')}
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
        <DeleteAccount user_id={userData.user_id} />
      </Modal>
      <div className={classes.wrapper}>
        <Card radius='md' withBorder className={`${classes.card} ${classes.fullWidthCard}`}>
          <div className={classes.cardContent}>
            <Stack gap='sm' p='lg'>
              <Text size='xl'>{t('license')}</Text>
              {isLoadingEntitlements ? (
                <Text c='dimmed'>{t('loading')}</Text>
              ) : entitlements.length === 0 ? (
                <Text c='dimmed'>{t('no-licenses')}</Text>
              ) : (
                <Stack gap='sm'>
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing='sm'>
                    {entitlements.map((entitlement) => (
                      <Paper key={entitlement.id} withBorder radius='md' p='md'>
                        <Stack gap='xs'>
                          <Group justify='space-between' align='flex-start' gap='xs'>
                            <Text fw={600}>{t(`license-kind-${entitlement.kind}`)}</Text>
                            {entitlement.kind === 'personal' &&
                            licenseManagementData?.subscription?.cancel_at_period_end ? (
                              <Badge color='orange' variant='light'>
                                {t('license-management-status-cancel-at-period-end')}
                              </Badge>
                            ) : (
                              <Badge color={getLicenseStatusColor(entitlement.status)} variant='light'>
                                {t(`license-status-${entitlement.status}`)}
                              </Badge>
                            )}
                          </Group>
                          <Text size='sm' c='dimmed'>
                            {entitlement.kind === 'org_seat'
                              ? t('license-managed-by-organization')
                              : entitlement.kind === 'personal' &&
                                  !licenseManagementData?.subscription?.cancel_at_period_end &&
                                  licenseManagementData?.subscription?.current_period_end
                                ? `${t('license-renews-on')}: ${formatDate(
                                    licenseManagementData.subscription.current_period_end,
                                  )}`
                                : `${t('license-valid-until')}: ${formatDate(entitlement.valid_until)}`}
                          </Text>
                          {entitlement.kind === 'org_seat' ? (
                            <Text size='sm' c='dimmed'>
                              {t('license-organization')}:&nbsp;
                              {entitlement.organization_id != null
                                ? (organizationNamesById[entitlement.organization_id] ??
                                  `#${entitlement.organization_id}`)
                                : '-'}
                            </Text>
                          ) : null}
                        </Stack>
                      </Paper>
                    ))}
                  </SimpleGrid>
                  {entitlements.some((entitlement) => entitlement.kind === 'personal') ? (
                    <Group justify='flex-start'>
                      <Button variant='light' onClick={() => router.push('/app/settings/license-management')}>
                        {t('license-management-open-page')}
                      </Button>
                    </Group>
                  ) : null}
                </Stack>
              )}
            </Stack>
          </div>
        </Card>
        <Card radius='md' withBorder className={classes.card}>
          <div className={classes.cardContent}>
            <Stack gap='sm' p='lg'>
              <Text size='xl'>{t('language')}</Text>
              <LocaleSwitcher userData={userData} />
            </Stack>
          </div>
        </Card>
        <Card radius='md' withBorder className={classes.card}>
          <div className={classes.cardContent}>
            <Stack gap='sm' p='lg'>
              <Text size='xl'>{t('account')}</Text>
              <TextInput label='Email' placeholder='Email' value={email} disabled size='md' />
              <Group justify='space-between'>
                <Button onClick={() => router.push('/reset')}>{t('change_password')}</Button>
              </Group>
            </Stack>
          </div>
        </Card>
        <Card radius='md' withBorder className={classes.card}>
          <div className={classes.cardContent}>
            <Stack gap='sm' p='lg'>
              <Text size='xl'>{t('profile')}</Text>
              <TextInput
                label={t('firstName')}
                placeholder={t('firstName')}
                value={firstName}
                onChange={(event) => setFirstName(event.currentTarget.value)}
                size='md'
              />
              <TextInput
                label={t('lastName')}
                placeholder={t('lastName')}
                value={lastName}
                onChange={(event) => setLastName(event.currentTarget.value)}
                size='md'
              />
              <Group justify='space-between'>
                <Button
                  onClick={handleUpdateUserData}
                  loading={isUserDataUpdating}
                  leftSection={<IconDeviceFloppy />}
                >
                  {t('save')}
                </Button>
              </Group>
            </Stack>
          </div>
        </Card>
        <Card radius='md' withBorder className={classes.card}>
          <div className={classes.cardContent}>
            <Stack gap='sm' p='lg' align='center'>
              <Text size='xl' ta='center'>
                {t('delete-account')}
              </Text>
              <Text c='dimmed' ta='center'>
                {t('delete-account-info')}
              </Text>
              <Group justify='center'>
                <Button variant='filled' color='red' onClick={open}>
                  {t('delete-account')}
                </Button>
              </Group>
            </Stack>
          </div>
        </Card>
      </div>
    </>
  )
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../../messages/${locale}.json`)).default,
    },
  }
}
