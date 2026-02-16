import React from 'react'
import { GetStaticPropsContext } from 'next/types'
import { Settings } from '@/components/Settings/Settings'
import { Account } from '@/components/Account/Account'
import { useUser } from '@/contexts/UserProvider'
import { Stack, Divider } from '@mantine/core'

export default function SettingsPage() {
  const { user, categories, refreshUserData } = useUser()

  if (!user || !categories) return null

  return (
    <Stack gap='xl'>
      <Settings userData={user} reloadUserData={refreshUserData} categories={categories} />
      <Divider />
      <Account userData={user} reloadUserData={refreshUserData} />
    </Stack>
  )
}

export async function getServerSideProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../../messages/${locale}.json`)).default,
    },
  }
}
