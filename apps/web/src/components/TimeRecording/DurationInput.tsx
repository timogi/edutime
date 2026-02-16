import React from 'react'
import { Group } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { TimeInput } from '@mantine/dates'
import { minutesToTimeString, timeStringToMinutes } from '@/functions/helpers'
import { GetStaticPropsContext } from 'next/types'

interface TimeTrackerProps {
  startTime: string
  setStartTime: (startTime: string) => void
  endTime: string
  setEndTime: (endTime: string) => void
  duration: string
  setDuration: (time: string) => void
  timeError: string | null
}

export const DurationInput = ({
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  duration,
  setDuration,
  timeError,
}: TimeTrackerProps) => {
  const t = useTranslations('Index')

  const onStartTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const time = event.target.value
    setStartTime(time)
    const startTimeMinutes = timeStringToMinutes(time)
    if (endTime) {
      const endTimeMinutes = timeStringToMinutes(endTime)
      const difference = endTimeMinutes - startTimeMinutes
      let duration = ''
      if (difference < 0) {
        duration = minutesToTimeString(1440 + difference)
      } else {
        duration = minutesToTimeString(difference)
      }
      setDuration(duration)
    } else if (duration) {
      const durationMinutes = timeStringToMinutes(duration)
      const totalTime = startTimeMinutes + durationMinutes
      let endTime = ''
      if (totalTime >= 1440) {
        endTime = minutesToTimeString(totalTime - 1440)
      } else {
        endTime = minutesToTimeString(totalTime)
      }
      setEndTime(endTime)
    }
  }

  const onEndTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const time = event.target.value
    setEndTime(time)
    const endTimeMinutes = timeStringToMinutes(time)
    if (startTime) {
      const startTimeMinutes = timeStringToMinutes(startTime)
      const difference = endTimeMinutes - startTimeMinutes
      let duration = ''
      if (difference < 0) {
        duration = minutesToTimeString(1440 + difference)
      } else {
        duration = minutesToTimeString(difference)
      }
      setDuration(duration)
    } else if (duration) {
      const durationMinutes = timeStringToMinutes(duration)
      const totalTime = endTimeMinutes - durationMinutes
      let startTime = ''
      if (totalTime < 0) {
        startTime = minutesToTimeString(1440 + totalTime)
      } else {
        startTime = minutesToTimeString(totalTime)
      }
      setStartTime(startTime)
    }
  }

  const onDurationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const time = event.target.value
    setDuration(time)
    const durationMinutes = timeStringToMinutes(time)
    if (startTime) {
      const startTimeMinutes = timeStringToMinutes(startTime)
      const totalTime = startTimeMinutes + durationMinutes
      let endTime = ''
      if (totalTime >= 1440) {
        endTime = minutesToTimeString(totalTime - 1440)
      } else {
        endTime = minutesToTimeString(totalTime)
      }
      setEndTime(endTime)
    } else if (endTime) {
      const endTimeMinutes = timeStringToMinutes(endTime)
      const totalTime = endTimeMinutes - durationMinutes
      let startTime = ''
      if (totalTime < 0) {
        startTime = minutesToTimeString(1440 + totalTime)
      } else {
        startTime = minutesToTimeString(totalTime)
      }
      setStartTime(startTime)
    }
  }

  return (
    <Group justify='space-between'>
      <Group justify='flex-start'>
        <TimeInput
          label={t('startTime')}
          value={startTime}
          onChange={onStartTimeChange}
          placeholder={t('startTime')}
          size='md'
          styles={{
            label: {
              color: 'var(--mantine-color-text)',
            },
          }}
        />

        <TimeInput
          label={t('endTime')}
          value={endTime}
          onChange={onEndTimeChange}
          placeholder={t('endTime')}
          size='md'
          styles={{
            label: {
              color: 'var(--mantine-color-text)',
            },
          }}
        />
      </Group>
      <TimeInput
        value={duration}
        label={t('duration')}
        withAsterisk
        onChange={onDurationChange}
        placeholder={t('duration')}
        error={timeError}
        size='md'
        styles={{
          label: {
            color: 'var(--mantine-color-text)',
          },
        }}
      />
    </Group>
  )
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../../messages/${locale}.json`)).default,
    },
  }
}
