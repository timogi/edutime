import React, { useEffect, useMemo } from 'react'
import { Text, Box } from '@mantine/core'
import { startOfWeek, addDays, format } from 'date-fns'
import { de } from 'date-fns/locale'
import { minutesToTimeString } from '@/functions/helpers'
import { GetStaticPropsContext } from 'next'
import { useTranslations } from 'next-intl'
import { useMediaQuery } from '@mantine/hooks'
import classes from './DayPicker.module.css'

interface DayPickerProps {
  date: Date
  setDate: (date: Date) => void
  user_id: string
  dailyDurations: { [date: string]: number }
  loading: boolean
  error: Error | null
}

export function DayPicker({
  date,
  setDate,
  user_id,
  dailyDurations,
  loading,
  error,
}: DayPickerProps) {
  const t = useTranslations('Index')

  const startOfCurrentWeek = useMemo(() => startOfWeek(date, { weekStartsOn: 1 }), [date])
  const endOfCurrentWeek = useMemo(() => addDays(startOfCurrentWeek, 6), [startOfCurrentWeek])

  // Remove useDailyDuration hook since data is now passed as props
  // const { dailyDurations, loading, error } = useDailyDuration(
  //   startOfCurrentWeek,
  //   endOfCurrentWeek,
  //   user_id,
  // )

  const days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => addDays(startOfCurrentWeek, i))
  }, [startOfCurrentWeek])

  const handleDayClick = (day: Date) => () => {
    setDate(day)
  }

  const isSmallScreen = useMediaQuery('(max-width: 768px)')

  return (
    <div className={classes.dayPickerContainer}>
      <div className={classes.dayPickerGrid}>
        <Box className={classes.headerCard} visibleFrom='md'>
          <div className={classes.headerSpacer}></div>
          <div className={classes.headerTimeSection}>
            <Text className={isSmallScreen ? classes.smallText : classes.normalText} fw={500}>
              {t('recorded-time')}
            </Text>
          </div>
        </Box>

        {(days || []).map((day, index) => (
          <div
            key={day.toString()}
            className={`${classes.dayButton} ${date.toDateString() === day.toDateString() ? classes.dayButtonActive : ''}`}
            onClick={handleDayClick(day)}
          >
            <div className={classes.dayHeader}>
              <Text className={isSmallScreen ? classes.smallText : classes.normalText} fw={600}>
                {format(day, 'EE', { locale: de })}
              </Text>
              <Text className={isSmallScreen ? classes.smallText : classes.normalText}>
                {format(day, 'd.M.', { locale: de })}
              </Text>
            </div>
            <div className={classes.dayTime}>
              <Text className={isSmallScreen ? classes.smallText : classes.normalText} fw={500}>
                {minutesToTimeString(dailyDurations[format(day, 'yyyy-MM-dd')])}
              </Text>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../../messages/${locale}.json`)).default,
    },
  }
}
