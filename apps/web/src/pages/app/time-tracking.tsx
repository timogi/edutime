import React, { useState, useMemo } from 'react'
import { GetStaticPropsContext } from 'next/types'
import { useRouter } from 'next/router'
import { TimeRecording } from '@/components/TimeRecording/TimeRecording'
import { useUser } from '@/contexts/UserProvider'

export default function TimeTrackingPage() {
  const { user, categories, refreshUserData } = useUser()
  const router = useRouter()

  // Derive initial date from URL query parameter
  const dateFromQuery = useMemo(() => {
    if (router.isReady && router.query.date) {
      const dateParam = router.query.date as string
      const [year, month, day] = dateParam.split('-').map(Number)
      if (year && month && day) {
        const parsedDate = new Date(year, month - 1, day)
        if (!isNaN(parsedDate.getTime())) return parsedDate
      }
    }
    return null
  }, [router.isReady, router.query.date])

  const [date, setDate] = useState<Date | null>(null)
  const effectiveDate = date ?? dateFromQuery

  const openTimeTrackerDate = (date: Date) => {
    setDate(date)
  }

  if (!user || !categories) return null

  return (
    <TimeRecording
      initDate={effectiveDate}
      openTimeTrackerDate={openTimeTrackerDate}
      userData={user}
      categories={categories}
      reloadUserData={refreshUserData}
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
