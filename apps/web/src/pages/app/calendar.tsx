import React from 'react'
import { GetStaticPropsContext } from 'next/types'
import { Calendar } from '@/components/Calendar/Calendar'
import { useUser } from '@/contexts/UserProvider'

export default function CalendarPage() {
  const { user } = useUser()

  const openTimeTrackerDate = (date: Date) => {
    // Navigate to time-tracking page with the selected date
    // Use local date format to avoid timezone issues
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    window.location.href = `/app/time-tracking?date=${year}-${month}-${day}`
  }

  if (!user) return null

  return <Calendar openTimeTrackerDate={openTimeTrackerDate} user_id={user.user_id} />
}

export async function getServerSideProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../../messages/${locale}.json`)).default,
    },
  }
}
