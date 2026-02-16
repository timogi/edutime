import React from 'react'
import { Card, Group, Button } from '@mantine/core'
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react'
import { DatePickerInput } from '@mantine/dates'
import { addDays, subDays } from 'date-fns'
import classes from './DateRangePickerPill.module.css'

interface DateRangePickerPillProps {
  startDate: Date
  endDate: Date
  setStartDate: (date: Date) => void
  setEndDate: (date: Date) => void
}

export function DateRangePickerPill({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}: DateRangePickerPillProps) {
  const handleStartDateChange = (value: Date | string | null) => {
    if (value) {
      const newDate = typeof value === 'string' ? new Date(value) : value
      setStartDate(newDate)
    }
  }

  const handleEndDateChange = (value: Date | string | null) => {
    if (value) {
      const newDate = typeof value === 'string' ? new Date(value) : value
      setEndDate(newDate)
    }
  }

  const moveRangeBack = () => {
    const rangeDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    setStartDate(subDays(startDate, rangeDays + 1))
    setEndDate(subDays(endDate, rangeDays + 1))
  }

  const moveRangeForward = () => {
    const rangeDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    setStartDate(addDays(startDate, rangeDays + 1))
    setEndDate(addDays(endDate, rangeDays + 1))
  }

  return (
    <Card className={classes.dateRangePickerCard} padding={0} withBorder radius='xl'>
      <Group className={classes.dateRangePickerGroup} gap={0}>
        <Button
          onClick={moveRangeBack}
          variant='subtle'
          c='gray'
          size='md'
          className={classes.dateRangePickerArrow}
        >
          <IconArrowLeft size='1.25rem' />
        </Button>
        <DatePickerInput
          value={startDate}
          valueFormat='DD.MM.YYYY'
          onChange={handleStartDateChange}
          size='md'
          variant='default'
          className={classes.dateRangePickerInput}
          styles={{
            input: {
              border: 'none',
              borderRadius: 0,
              textAlign: 'center',
              paddingLeft: 0,
              paddingRight: 0,
              boxShadow: 'none',
            },
          }}
        />
        <span className={classes.dateSeparator}>-</span>
        <DatePickerInput
          value={endDate}
          valueFormat='DD.MM.YYYY'
          onChange={handleEndDateChange}
          size='md'
          variant='default'
          className={classes.dateRangePickerInput}
          styles={{
            input: {
              border: 'none',
              borderRadius: 0,
              textAlign: 'center',
              paddingLeft: 0,
              paddingRight: 0,
              boxShadow: 'none',
            },
          }}
        />
        <Button
          onClick={moveRangeForward}
          variant='subtle'
          c='gray'
          size='md'
          className={classes.dateRangePickerArrow}
        >
          <IconArrowRight size='1.25rem' />
        </Button>
      </Group>
    </Card>
  )
}
