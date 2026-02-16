import React, { useEffect, useState, useMemo } from 'react'
import {
  Stack,
  Group,
  Text,
  Card,
  SegmentedControl,
  Skeleton,
  useMantineTheme,
  useMantineColorScheme,
} from '@mantine/core'
import { useTranslations } from 'next-intl'
import { GetStaticPropsContext } from 'next/types'
import { DailyDuration } from '@/types/globals'
import { getDaysInMonth, eachMonthOfInterval } from 'date-fns'
import { getDailyDurations } from '@/utils/supabase/records'
import { useMediaQuery } from '@mantine/hooks'
import DayButton from './DayButton'
import { YearPickerPill } from './YearPickerPill'
import classes from './Calendar.module.css'

interface CalendarProps {
  openTimeTrackerDate: (date: Date) => void
  user_id: string
}

type Semester = 'firstSemester' | 'secondSemester' | 'all'

// Helper: Get school year start year based on current date
const getInitialStartYear = (): number => {
  const now = new Date()
  return now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1
}

// Helper: Get initial semester based on current date
const getInitialSemester = (): Semester => {
  const month = new Date().getMonth()
  if (month >= 7 || month === 0) return 'firstSemester'
  return 'secondSemester'
}

// Helper: Create date for a specific day in school year
const createSchoolYearDate = (startYear: number, monthIndex: number, day: number): Date => {
  // monthIndex: 1-12 for Aug-Jul (1=Aug, 6=Jan, 7=Feb, 12=Jul)
  // monthIndex 1-5: Aug-Dec (month 7-11, year = startYear)
  // monthIndex 6: Jan (month 0, year = startYear + 1)
  // monthIndex 7-12: Feb-Jul (month 1-6, year = startYear + 1)
  let actualMonth: number
  let actualYear: number

  if (monthIndex <= 5) {
    // Aug-Dec: monthIndex 1-5 -> month 7-11
    actualMonth = monthIndex + 6
    actualYear = startYear
  } else if (monthIndex === 6) {
    // Jan: monthIndex 6 -> month 0
    actualMonth = 0
    actualYear = startYear + 1
  } else {
    // Feb-Jul: monthIndex 7-12 -> month 1-6
    actualMonth = monthIndex - 6
    actualYear = startYear + 1
  }

  return new Date(actualYear, actualMonth, day)
}

// Helper: Get all months in school year with their days
const getSchoolYearMonths = (
  startYear: number,
): Array<{ monthIndex: number; month: Date; days: number[] }> => {
  const start = new Date(startYear, 7, 1) // August 1st
  const end = new Date(startYear + 1, 6, 31) // July 31st of next year
  const months = eachMonthOfInterval({ start, end })

  return months.map((month, index) => ({
    monthIndex: index + 1, // 1-12 for Aug-Jul
    month,
    days: Array.from({ length: getDaysInMonth(month) }, (_, i) => i + 1),
  }))
}

// Helper: Get semester months
const getSemesterMonths = (semester: Semester): number[] => {
  switch (semester) {
    case 'firstSemester':
      return [1, 2, 3, 4, 5, 6] // Aug-Jan (monthIndex 1-6)
    case 'secondSemester':
      return [7, 8, 9, 10, 11, 12] // Feb-Jul (monthIndex 7-12)
    default:
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] // All months
  }
}

// Helper: Get cell background color based on weekday/weekend
const getCellColor = (date: Date, colorScheme: 'light' | 'dark', theme: any): string => {
  const isWeekend = date.getDay() === 0 || date.getDay() === 6
  return isWeekend
    ? colorScheme === 'dark'
      ? theme.colors.dark[3]
      : theme.colors.gray[3]
    : colorScheme === 'dark'
      ? theme.colors.dark[6]
      : theme.colors.gray[0]
}

// Helper: Get month abbreviation
const getMonthAbbr = (month: Date): string => {
  return month.toLocaleString('default', { month: 'short' }).charAt(0).toUpperCase()
}

export function Calendar({ openTimeTrackerDate, user_id }: CalendarProps) {
  const t = useTranslations('Index')
  const theme = useMantineTheme()
  const { colorScheme } = useMantineColorScheme()

  const [startYear, setStartYear] = useState(getInitialStartYear())
  const [dailyDuration, setDailyDuration] = useState<DailyDuration>({})
  const [isLoading, setIsLoading] = useState(true)
  const [semester, setSemester] = useState<Semester>(getInitialSemester())
  const [prevLoadKey, setPrevLoadKey] = useState<string>('')

  const isDesktop = useMediaQuery('(min-width: 1200px)')
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1199px)')
  const isMobile = useMediaQuery('(max-width: 767px)')
  const isSmallMobile = useMediaQuery('(max-width: 475px)')

  // Reset loading state when dependencies change (render-time pattern)
  const loadKey = `${startYear}-${user_id}`
  if (loadKey !== prevLoadKey) {
    setPrevLoadKey(loadKey)
    setIsLoading(true)
  }

  // Load daily durations
  useEffect(() => {
    const start = new Date(startYear, 7, 1)
    const end = new Date(startYear + 1, 6, 31)

    getDailyDurations(start, end, user_id)
      .then((data) => {
        if (data) {
          setDailyDuration(data)
        }
        setIsLoading(false)
      })
      .catch(() => {
        setIsLoading(false)
      })
  }, [startYear, user_id])

  // Get all months in school year
  const schoolYearMonths = useMemo(() => getSchoolYearMonths(startYear), [startYear])

  // Filter months based on semester (mobile only)
  const visibleMonths = useMemo(() => {
    if (!isMobile) return schoolYearMonths
    const semesterMonthIndices = getSemesterMonths(semester)
    return schoolYearMonths.filter((m) => semesterMonthIndices.includes(m.monthIndex))
  }, [schoolYearMonths, semester, isMobile])

  // Get color function
  const getColor = (date: Date) => {
    const scheme = colorScheme === 'auto' ? 'light' : colorScheme
    return getCellColor(date, scheme as 'light' | 'dark', theme)
  }

  // Render desktop view: months as rows, days as columns
  const renderDesktopView = () => {
    if (isLoading) {
      return Array.from({ length: 12 }, (_, i) => (
        <Group key={i} gap={2} wrap='nowrap' className={classes.monthRow}>
          <Skeleton height={20} width={90} radius='sm' />
          {Array.from({ length: 31 }, (_, j) => (
            <Skeleton key={j} height={30} width={30} radius='sm' />
          ))}
        </Group>
      ))
    }

    return visibleMonths.map(({ monthIndex, month, days }) => (
      <Group key={monthIndex} gap={2} wrap='nowrap' className={classes.monthRow}>
        <Text className={classes.monthText} c='dimmed'>
          {month.toLocaleString('default', { month: 'long' })}
        </Text>
        {days.map((day) => {
          const date = createSchoolYearDate(startYear, monthIndex, day)
          return (
            <DayButton
              key={day}
              date={date}
              onClick={() => openTimeTrackerDate(date)}
              dailyDuration={dailyDuration}
              classes={classes}
              getColor={getColor}
            />
          )
        })}
      </Group>
    ))
  }

  // Render mobile view: days as rows, months as columns
  const renderMobileView = () => {
    if (isLoading) {
      return Array.from({ length: 31 }, (_, i) => (
        <Group key={i} gap={2} wrap='nowrap' className={classes.monthRow}>
          <Skeleton height={20} width={30} radius='sm' />
          {Array.from({ length: visibleMonths.length }, (_, j) => (
            <Skeleton key={j} height={30} width={30} radius='sm' />
          ))}
        </Group>
      ))
    }

    return Array.from({ length: 31 }, (_, dayIndex) => {
      const day = dayIndex + 1
      return (
        <Group key={day} gap={2} wrap='nowrap' className={classes.monthRow}>
          <Text className={classes.dayText} c='dimmed'>
            {day}
          </Text>
          {visibleMonths.map(({ monthIndex, days }) => {
            if (!days.includes(day)) {
              return <div key={monthIndex} className={classes.dayItem} />
            }
            const date = createSchoolYearDate(startYear, monthIndex, day)
            return (
              <DayButton
                key={monthIndex}
                date={date}
                onClick={() => openTimeTrackerDate(date)}
                dailyDuration={dailyDuration}
                classes={classes}
                getColor={getColor}
              />
            )
          })}
        </Group>
      )
    })
  }

  return (
    <Stack className={classes.wrapper}>
      <Group mx='auto' mt='lg' justify='center'>
        <YearPickerPill startYear={startYear} setStartYear={setStartYear} />
      </Group>

      <Group justify='center' className={classes.cardWrapper}>
        <Card radius='md' withBorder className={classes.flexContainer}>
          <Stack gap={2} className={classes.scrollable}>
            {isMobile && (
              <Group justify='center' mb='lg' className={classes.semesterControl}>
                <SegmentedControl
                  data={[
                    { label: t('firstSemester'), value: 'firstSemester' },
                    { label: t('secondSemester'), value: 'secondSemester' },
                  ]}
                  value={semester}
                  onChange={(value) => setSemester(value as Semester)}
                />
              </Group>
            )}

            {/* Header row */}
            <Group gap={2} wrap='nowrap' className={classes.daysRow}>
              <Text className={isDesktop ? classes.monthText : classes.dayText} />
              {isDesktop
                ? Array.from({ length: 31 }, (_, i) => (
                    <Text key={i + 1} className={classes.dayHeader} c='dimmed'>
                      {i + 1}
                    </Text>
                  ))
                : visibleMonths.map(({ monthIndex, month }) => (
                    <Text key={monthIndex} className={classes.dayHeader} c='dimmed'>
                      {getMonthAbbr(month)}
                    </Text>
                  ))}
            </Group>

            {/* Calendar grid */}
            {isDesktop ? renderDesktopView() : renderMobileView()}
          </Stack>
        </Card>
      </Group>
    </Stack>
  )
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../../messages/${locale}.json`)).default,
    },
  }
}
