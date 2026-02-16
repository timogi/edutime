import React, { useMemo } from 'react'
import { Button, Text, Stack, useMantineColorScheme, useMantineTheme } from '@mantine/core'
import { DailyDuration } from '@/types/globals'
import { getIsoDate } from '@/functions/helpers'
import { minutesToTimeString } from '@/functions/helpers'

interface DayButtonProps {
  date: Date
  onClick: () => void
  dailyDuration: DailyDuration
  classes: any
  getColor: (date: Date) => string
  colors?: string[] // Optional array of colors for future dot functionality
}

const DayButton: React.FC<DayButtonProps> = ({
  date,
  onClick,
  dailyDuration,
  classes,
  getColor,
  colors,
}) => {
  const theme = useMantineTheme()
  const { colorScheme } = useMantineColorScheme()
  const formattedDate = new Date(getIsoDate(date)).toISOString().split('T')[0]
  const duration = dailyDuration[formattedDate]

  // Note: Using theme colors directly for dynamic color selection based on colorScheme
  // This is a special case exception for components that need runtime theme color access
  const textColor = useMemo(() => {
    return colorScheme === 'dark' ? theme.colors.gray[0] : theme.colors.gray[9]
  }, [colorScheme, theme.colors.gray])

  const borderColor = useMemo(() => {
    return colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[3]
  }, [colorScheme, theme.colors.dark, theme.colors.gray])

  return (
    <Button
      size='xs'
      className={classes.dayItem}
      variant='filled'
      style={{
        backgroundColor: getColor(date),
        color: textColor,
        border: `1px solid ${borderColor}`,
        position: 'relative',
      }}
      styles={{
        root: {
          backgroundColor: getColor(date),
          color: textColor,
          '&:hover': {
            backgroundColor: getColor(date),
            opacity: 0.8,
          },
        },
        label: {
          color: textColor,
        },
      }}
      onClick={onClick}
    >
      {duration ? (
        <Stack gap={1} align='center' style={{ lineHeight: 1 }}>
          <Text
            className={classes.dayItemHours}
            style={{
              color: textColor,
            }}
          >
            {Math.floor(duration / 60)}
          </Text>
          <Text
            className={classes.dayItemMinutes}
            style={{
              color: textColor,
              opacity: 0.8,
            }}
          >
            {String(duration % 60).padStart(2, '0')}
          </Text>
        </Stack>
      ) : null}
      {/* Future dot functionality - not used yet but implemented */}
      {colors && colors.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            backgroundColor: colors[0], // Use first color for now
          }}
        />
      )}
    </Button>
  )
}

export default DayButton
