import React from 'react'
import { GetStaticPropsContext } from 'next/types'
import Statistics from '@/components/Statistics/Statistics'
import { useUser } from '@/contexts/UserProvider'

export default function StatisticsPage() {
  const { user, categories, refreshUserData } = useUser()

  if (!user || !categories) return null

  return <Statistics userData={user} categories={categories} reloadUserData={refreshUserData} />
}

export async function getServerSideProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../../messages/${locale}.json`)).default,
    },
  }
}
