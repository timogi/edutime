import React, { useState, useEffect } from 'react'
import { Stack, Group, Text, Checkbox, SegmentedControl } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { DateInput, DatePicker } from '@mantine/dates'
import { eachDayOfInterval, format } from 'date-fns'
import { Vacation } from '@/types/globals'
import { GetStaticPropsContext } from 'next/types'

interface IntervalFormProps {
  date: Date
  dates: Date[]
  setDates: (dates: Date[]) => void
}

export const IntervalForm = ({ date, dates, setDates }: IntervalFormProps) => {
  const t = useTranslations('Index')
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
  const [intervalEnd, setIntervalEnd] = useState<Date>(new Date())
  const [type, setType] = useState<'interval' | 'pickDays'>('interval')
  const [excludeVacationDays, setExcludeVacationDays] = useState(true)

  // Select the current day of the week when date or deselectedDays change
  const [prevDate, setPrevDate] = useState(date)
  const [prevDeselected, setPrevDeselected] = useState(deselectedDays)
  if (prevDate !== date || prevDeselected !== deselectedDays) {
    setPrevDate(date)
    setPrevDeselected(deselectedDays)
    const day = format(date, 'eeee')
    if (!deselectedDays.includes(day)) {
      setSelectedDays((prevSelectedDays) => ({ ...prevSelectedDays, [day]: true }))
    }
  }

  useEffect(() => {
    const days = Object.keys(selectedDays).filter(
      (key) => selectedDays[key as keyof typeof selectedDays],
    )
    const start = date
    const end = intervalEnd
    let newDates = eachDayOfInterval({ start, end }).filter((d) => days.includes(format(d, 'eeee')))
    setDates(newDates)
  }, [selectedDays, intervalEnd, type, excludeVacationDays, date, setDates])

  const handleCheckboxChange = (key: string, checked: boolean) => {
    if (!checked) {
      setDeselectedDays((prevDeselectedDays) => [...prevDeselectedDays, key])
    } else {
      setDeselectedDays((prevDeselectedDays) => prevDeselectedDays.filter((day) => day !== key))
    }
    setSelectedDays((prevSelectedDays) => ({ ...prevSelectedDays, [key]: checked }))
  }

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
      {type === 'interval' ? (
        <Stack>
          <Group justify='center' gap='sm'>
            {Checkboxes}
          </Group>
          <DateInput
            value={intervalEnd || new Date()}
            popoverProps={{ withinPortal: true }}
            onChange={(value) =>
              setIntervalEnd(
                value ? (typeof value === 'string' ? new Date(value) : value) : new Date(),
              )
            }
            label={t('until')}
            placeholder={t('until')}
            valueFormat='DD.MM.YYYY'
            size='md'
          />
        </Stack>
      ) : (
        <Group justify='center' gap='sm'>
          <DatePicker
            value={dates}
            type='multiple'
            onChange={(value) => {
              setDates((value || []).map((dateStr) => new Date(dateStr)))
            }}
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
