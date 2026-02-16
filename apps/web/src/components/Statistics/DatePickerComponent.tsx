import React from 'react'
import { Group, Text } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { IconCalendar } from '@tabler/icons-react'

export interface DatePickerComponentProps {
  startDate: Date
  endDate: Date
  setStartDate: (date: Date) => void
  setEndDate: (date: Date) => void
}

export const DatePickerComponent: React.FC<DatePickerComponentProps> = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}) => {
  return (
    <Group mx='auto' mt={'lg'}>
      <DatePickerInput
        placeholder='Pick start date'
        value={startDate}
        valueFormat='DD.MM.YYYY'
        onChange={(value) => setStartDate(value ? new Date(value) : new Date())}
        variant='default'
        leftSection={<IconCalendar />}
        size={'md'}
      />
      <Text c='dimmed'>-</Text>
      <DatePickerInput
        placeholder='Pick end date'
        value={endDate}
        valueFormat='DD.MM.YYYY'
        onChange={(value) => setEndDate(value ? new Date(value) : new Date())}
        variant='default'
        leftSection={<IconCalendar />}
        size={'md'}
      />
    </Group>
  )
}
