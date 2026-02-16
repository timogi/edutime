import React, { useState, useEffect } from 'react'
import { Button, Text } from '@mantine/core'
import { IconClock } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'
import { calculateStopWatchDuration } from '@/functions/helpers'
import { StopWatchSession } from '@/types/globals'
import { useStopWatchSession, useCreateStopwatchSession } from '@/utils/supabase/queries'
import { useMediaQuery } from '@mantine/hooks'
import classes from './StopWatchButton.module.css'

interface StopWatchButtonProps {
  openTimeTrackerModal: (stopWatchSession: StopWatchSession) => void
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

export const StopWatchButton = ({ openTimeTrackerModal, size = 'md' }: StopWatchButtonProps) => {
  const t = useTranslations('Index')
  const { data: activeSession, isLoading: loading, error } = useStopWatchSession()
  const createStopwatchSession = useCreateStopwatchSession()
  const [duration, setDuration] = useState('00:00:00')

  const isSmallScreen = useMediaQuery('(max-width: 768px)')

  useEffect(() => {
    if (!activeSession) return

    const interval = setInterval(() => {
      setDuration(calculateStopWatchDuration(activeSession))
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [activeSession])

  // Derive displayed duration: reset to 00:00:00 when no active session
  const displayDuration = activeSession ? duration : '00:00:00'

  const startStopwatch = async () => {
    try {
      await createStopwatchSession.mutateAsync()
    } catch (error) {
      console.error('Failed to start stopwatch:', error)
      // Error is already logged in the mutation onError handler
    }
  }

  const onButtonClick = () => {
    if (activeSession) {
      openTimeTrackerModal(activeSession)
    } else {
      startStopwatch()
    }
  }

  // Calculate icon size based on button size
  const getIconSize = () => {
    switch (size) {
      case 'xs':
        return '0.75rem'
      case 'sm':
        return '0.875rem'
      case 'md':
        return '1rem'
      case 'lg':
        return '1.125rem'
      case 'xl':
        return '1.25rem'
      default:
        return '1rem'
    }
  }

  return (
    <Button
      leftSection={<IconClock size={getIconSize()} stroke={2} />}
      variant='gradient'
      gradient={{ from: 'red', to: 'violet', deg: 90 }}
      onClick={onButtonClick}
      size={size}
    >
      {activeSession ? (
        <Text className={classes.timerText}>{displayDuration}</Text>
      ) : (
        <Text fw={600}>{t('startTimer')}</Text>
      )}
    </Button>
  )
}
