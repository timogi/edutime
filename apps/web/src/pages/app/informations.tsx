import React from 'react'
import { GetStaticPropsContext } from 'next/types'
import { Informations } from '@/components/Informations/informations'
import { useUser } from '@/contexts/UserProvider'

export default function InformationsPage() {
  const { user } = useUser()

  if (!user) return null

  return <Informations userData={user} />
}

export async function getServerSideProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../../messages/${locale}.json`)).default,
    },
  }
}
