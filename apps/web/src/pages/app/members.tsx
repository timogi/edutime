import React from 'react'
import { GetStaticPropsContext } from 'next/types'
import { Members } from '@/components/Members/Members'
import { useUser } from '@/contexts/UserProvider'

export default function MembersPage() {
  const { user, organizations, refreshUserData, hasActiveSubscription } = useUser()

  if (!user) return null

  const showBackToNoLicense = !hasActiveSubscription && organizations.length > 0

  return (
    <Members
      userData={user}
      organizations={organizations}
      onMembersChanged={refreshUserData}
      showBackToNoLicense={showBackToNoLicense}
    />
  )
}

export async function getServerSideProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../../messages/${locale}.json`)).default,
    },
  }
}
