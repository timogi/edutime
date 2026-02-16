import React from 'react'
import { Card, Group, Button } from '@mantine/core'
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react'
import { YearPickerInput } from '@mantine/dates'
import classes from './YearPickerPill.module.css'

interface YearPickerPillProps {
  startYear: number
  setStartYear: (year: number) => void
}

export function YearPickerPill({ startYear, setStartYear }: YearPickerPillProps) {
  // Create date objects locally to avoid timezone issues
  const getDateValue = (year: number) => {
    return new Date(year, 0, 1)
  }

  return (
    <Card className={classes.yearPickerCard} padding={0} withBorder radius='xl'>
      <Group className={classes.yearPickerGroup} gap={0}>
        <Button
          onClick={() => setStartYear(startYear - 1)}
          variant='subtle'
          c='gray'
          size='md'
          className={classes.yearPickerArrow}
        >
          <IconArrowLeft size='1.25rem' />
        </Button>
        <YearPickerInput
          value={getDateValue(startYear)}
          onChange={(value: string | Date | null) => {
            if (value) {
              // Handle both string and Date types
              let selectedYear: number
              if (typeof value === 'string') {
                // Extract year directly from string to avoid timezone issues
                const yearStr = value.split('-')[0]
                selectedYear = parseInt(yearStr, 10)
              } else {
                // Date object - try to get year from ISO string first to avoid timezone issues
                const isoString = value.toISOString()
                const yearStr = isoString.split('-')[0]
                selectedYear = parseInt(yearStr, 10)
                // Fallback to getFullYear if parsing fails
                if (isNaN(selectedYear)) {
                  selectedYear = value.getFullYear()
                }
              }
              if (!isNaN(selectedYear)) {
                setStartYear(selectedYear)
              }
            }
          }}
          size='md'
          variant='default'
          className={classes.yearPickerInput}
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
        <span className={classes.yearSeparator}>/</span>
        <YearPickerInput
          value={getDateValue(startYear + 1)}
          onChange={(value: string | Date | null) => {
            if (value) {
              // Handle both string and Date types
              let selectedYear: number
              if (typeof value === 'string') {
                // Extract year directly from string to avoid timezone issues
                const yearStr = value.split('-')[0]
                selectedYear = parseInt(yearStr, 10)
              } else {
                // Date object - try to get year from ISO string first to avoid timezone issues
                const isoString = value.toISOString()
                const yearStr = isoString.split('-')[0]
                selectedYear = parseInt(yearStr, 10)
                // Fallback to getFullYear if parsing fails
                if (isNaN(selectedYear)) {
                  selectedYear = value.getFullYear()
                }
              }
              if (!isNaN(selectedYear)) {
                setStartYear(selectedYear - 1)
              }
            }
          }}
          size='md'
          variant='default'
          className={classes.yearPickerInput}
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
          onClick={() => setStartYear(startYear + 1)}
          variant='subtle'
          c='gray'
          size='md'
          className={classes.yearPickerArrow}
        >
          <IconArrowRight size='1.25rem' />
        </Button>
      </Group>
    </Card>
  )
}
