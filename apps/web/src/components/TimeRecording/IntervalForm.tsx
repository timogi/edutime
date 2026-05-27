import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Stack, Group, Text, Checkbox, SegmentedControl, Alert } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { DateInput, DatePicker } from '@mantine/dates'
import { format, isBefore, startOfDay } from 'date-fns'
import { IconAlertTriangle } from '@tabler/icons-react'
import {
  buildRepeatDates,
  capRepeatDatesPicker,
  clampRepeatEndDate,
  getDefaultBernSemesterApproxEnd,
  getRepeatMaxEndDate,
  MAX_REPEAT_CALENDAR_DAYS,
  MAX_REPEAT_ENTRY_COUNT,
} from '@/functions/repeatDates'
import { GetStaticPropsContext } from 'next/types'

interface IntervalFormProps {
  dates: Date[]
  setDates: (dates: Date[]) => void
}

export const IntervalForm = ({ dates, setDates }: IntervalFormProps) => {
  const t = useTranslations('Index')

  const seedToday = () => startOfDay(new Date())

  const [intervalStart, setIntervalStart] = useState<Date>(() => seedToday())
  const [intervalEnd, setIntervalEnd] = useState<Date>(() => {
    const from = seedToday()
    return clampRepeatEndDate(from, getDefaultBernSemesterApproxEnd(from))
  })

  const [selectedDays, setSelectedDays] = useState({
    Monday: false,
    Tuesday: false,
    Wednesday: false,
    Thursday: false,
    Friday: false,
    Saturday: false,
    Sunday: false,
  })

  const [deselectedDays, setDeselectedDays] = useState<string[]>([])
  const [type, setType] = useState<'interval' | 'pickDays'>('interval')
  const [repeatWarning, setRepeatWarning] = useState<'interval' | 'truncated' | 'pickDays' | null>(
    null,
  )

  const maxEndDate = useMemo(() => getRepeatMaxEndDate(intervalStart), [intervalStart])

  const deselectedDaysRef = useRef(deselectedDays)
  deselectedDaysRef.current = deselectedDays

  // When "von" changes: enable that weekday, clamp "bis" if needed, default semester if bis was before von.
  useEffect(() => {
    const day = format(intervalStart, 'eeee') as keyof typeof selectedDays
    setIntervalEnd((prev) => {
      const nextEnd = isBefore(prev, intervalStart)
        ? getDefaultBernSemesterApproxEnd(intervalStart)
        : prev
      return clampRepeatEndDate(intervalStart, nextEnd)
    })
    if (!deselectedDaysRef.current.includes(day)) {
      setSelectedDays((prevSelectedDays) => ({ ...prevSelectedDays, [day]: true }))
    }
  }, [intervalStart])

  useEffect(() => {
    if (type !== 'interval') {
      setRepeatWarning(null)
      return
    }

    const weekdays = Object.keys(selectedDays).filter(
      (key) => selectedDays[key as keyof typeof selectedDays],
    )

    if (weekdays.length === 0) {
      setDates([])
      setRepeatWarning(null)
      return
    }

    const { dates: newDates, truncated, intervalTooLarge } = buildRepeatDates(
      intervalStart,
      intervalEnd,
      weekdays,
    )
    setDates(newDates)

    if (intervalTooLarge && truncated) {
      setRepeatWarning('truncated')
    } else if (intervalTooLarge) {
      setRepeatWarning('interval')
    } else if (truncated) {
      setRepeatWarning('truncated')
    } else {
      setRepeatWarning(null)
    }
  }, [selectedDays, intervalEnd, type, intervalStart, setDates])

  const handleCheckboxChange = (key: string, checked: boolean) => {
    if (!checked) {
      setDeselectedDays((prevDeselectedDays) => [...prevDeselectedDays, key])
    } else {
      setDeselectedDays((prevDeselectedDays) => prevDeselectedDays.filter((day) => day !== key))
    }
    setSelectedDays((prevSelectedDays) => ({ ...prevSelectedDays, [key]: checked }))
  }

  const handleIntervalStartChange = (value: Date | string | null) => {
    const parsed = value ? (typeof value === 'string' ? new Date(value) : value) : seedToday()
    setIntervalStart(startOfDay(parsed))
  }

  const handleIntervalEndChange = (value: Date | string | null) => {
    const parsed = value ? (typeof value === 'string' ? new Date(value) : value) : intervalStart
    setIntervalEnd(clampRepeatEndDate(intervalStart, startOfDay(parsed)))
  }

  const handlePickDaysChange = (value: string[] | null) => {
    const parsed = (value || []).map((dateStr) => new Date(dateStr))
    const { dates: capped, truncated } = capRepeatDatesPicker(parsed)
    setDates(capped)
    setRepeatWarning(truncated ? 'pickDays' : null)
  }

  const warningMessage = (() => {
    if (!repeatWarning) return null
    if (repeatWarning === 'interval') {
      return t('repeatIntervalTooLarge', {
        maxDays: MAX_REPEAT_CALENDAR_DAYS,
      })
    }
    if (repeatWarning === 'truncated') {
      return t('repeatEntriesTruncated', {
        maxEntries: MAX_REPEAT_ENTRY_COUNT,
      })
    }
    return t('repeatPickDaysTruncated', {
      maxEntries: MAX_REPEAT_ENTRY_COUNT,
    })
  })()

  const Checkboxes = Object.keys(selectedDays || {}).map((key) => {
    return (
      <Stack key={key} gap='sm'>
        <Text size={'sm'} fw={'bold'}>
          {t(key)}
        </Text>
        <Checkbox
          checked={selectedDays[key as keyof typeof selectedDays]}
          onChange={(event) => handleCheckboxChange(key, event.currentTarget.checked)}
        />
      </Stack>
    )
  })

  return (
    <>
      <SegmentedControl
        value={type}
        onChange={(value) => setType(value as 'interval' | 'pickDays')}
        size='md'
        data={[
          {
            value: 'interval',
            label: t('interval'),
          },
          {
            value: 'pickDays',
            label: t('pickDays'),
          },
        ]}
      />
      {warningMessage ? (
        <Alert
          variant='light'
          color='yellow'
          icon={<IconAlertTriangle size={16} />}
          title={t('repeatIntervalWarningTitle')}
        >
          {warningMessage}
        </Alert>
      ) : null}
      {type === 'interval' ? (
        <Stack gap='md'>
          <Group grow align='flex-start'>
            <DateInput
              value={intervalStart}
              popoverProps={{ withinPortal: true }}
              onChange={handleIntervalStartChange}
              label={t('repeatFrom')}
              placeholder={t('repeatFrom')}
              valueFormat='DD.MM.YYYY'
              size='md'
            />
            <DateInput
              value={intervalEnd}
              minDate={intervalStart}
              maxDate={maxEndDate}
              popoverProps={{ withinPortal: true }}
              onChange={handleIntervalEndChange}
              label={t('until')}
              placeholder={t('until')}
              valueFormat='DD.MM.YYYY'
              size='md'
            />
          </Group>
          <Group justify='center' gap='sm'>
            {Checkboxes}
          </Group>
        </Stack>
      ) : (
        <Group justify='center' gap='sm'>
          <DatePicker
            value={dates}
            type='multiple'
            onChange={handlePickDaysChange}
            size='md'
          />
        </Group>
      )}
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
