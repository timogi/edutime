import React, { useState, useEffect } from 'react'
import { TextInput, Button, Stack, Text, Card, Modal, Group, Badge, Table } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { updateUserData } from '@/utils/supabase/user'
import { useRouter } from 'next/router'
import { useDisclosure } from '@mantine/hooks'
import { DeleteAccount } from './DeleteAccount'
import { GetStaticPropsContext } from 'next/types'
import { IconDeviceFloppy } from '@tabler/icons-react'
import LocaleSwitcher from '../Settings/LocaleSwitcher'
import { UserData, Entitlement } from '@/types/globals'
import { getUserEntitlements } from '@/utils/supabase/entitlements'
import classes from './Account.module.css'

interface AccountProps {
  userData: UserData
  reloadUserData: () => void
}

export const Account = ({ userData, reloadUserData }: AccountProps) => {
  const router = useRouter()
  const [firstName, setFirstName] = useState(userData.first_name)
  const [lastName, setLastName] = useState(userData.last_name)
  const [email, setEmail] = useState(userData.email)
  const [isUserDataUpdating, setIsUserDataUpdating] = useState(false)
  const [opened, { open, close }] = useDisclosure(false)
  const [entitlements, setEntitlements] = useState<Entitlement[]>([])
  const [isLoadingEntitlements, setIsLoadingEntitlements] = useState(false)
  const t = useTranslations('Index')

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
        const userEntitlements = await getUserEntitlements(userData.user_id)
        setEntitlements(userEntitlements)
      } catch (error) {
        console.error('Error loading entitlements:', error)
      } finally {
        setIsLoadingEntitlements(false)
      }
    }
    loadEntitlements()
  }, [userData.user_id])

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
                <Table.ScrollContainer minWidth={500}>
                  <Table
                    striped
                    highlightOnHover
                    withColumnBorders
                    withTableBorder
                    horizontalSpacing='md'
                    verticalSpacing='sm'
                  >
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>{t('license-kind')}</Table.Th>
                        <Table.Th>{t('license-source')}</Table.Th>
                        <Table.Th>{t('license-status')}</Table.Th>
                        <Table.Th>{t('license-valid-from')}</Table.Th>
                        <Table.Th>{t('license-valid-until')}</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {entitlements.map((entitlement) => (
                        <Table.Tr key={entitlement.id}>
                          <Table.Td>{t(`license-kind-${entitlement.kind}`)}</Table.Td>
                          <Table.Td>{t(`license-source-${entitlement.source}`)}</Table.Td>
                          <Table.Td>
                            <Badge
                              color={
                                entitlement.status === 'active'
                                  ? 'green'
                                  : entitlement.status === 'pending'
                                    ? 'yellow'
                                    : entitlement.status === 'expired'
                                      ? 'gray'
                                      : 'red'
                              }
                            >
                              {t(`license-status-${entitlement.status}`)}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            {new Date(entitlement.valid_from).toLocaleDateString()}
                          </Table.Td>
                          <Table.Td>
                            {entitlement.valid_until
                              ? new Date(entitlement.valid_until).toLocaleDateString()
                              : t('license-unlimited')}
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
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
