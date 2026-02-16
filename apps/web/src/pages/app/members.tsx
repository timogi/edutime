import React from 'react'
import { GetStaticPropsContext } from 'next/types'
import { Members } from '@/components/Members/Members'
import { useUser } from '@/contexts/UserProvider'

export default function MembersPage() {
  const { user, organizations, refreshUserData } = useUser()

  if (!user) return null

  return (
    <Members userData={user} organizations={organizations} onMembersChanged={refreshUserData} />
  )
}

export async function getServerSideProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../../messages/${locale}.json`)).default,
    },
  }
}
