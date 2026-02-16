import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Button, Stack, Textarea, Group, Switch, Select, Skeleton, Text } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { DateInput } from '@mantine/dates'
import {
  calculateStopWatchDuration,
  minutesToTimeString,
  timeStringToMinutes,
  normalizeTimeString,
} from '@/functions/helpers'
import { notifications } from '@mantine/notifications'
import { Category, TimeRecord, StopWatchSession, CantonData, UserData } from '@/types/globals'
import { GetStaticPropsContext } from 'next/types'
import { IntervalForm } from './IntervalForm'
import { DurationInput } from './DurationInput'
import { SplitButton } from './SplitButton'
import {
  useCreateStopwatchSession,
  useDeleteStopwatchSession,
  useUpdateStopwatchSession,
} from '@/utils/supabase/queries'
import {
  useInsertRecord,
  useInsertRecords,
  useUpdateRecord,
  useDeleteRecord,
} from '@/utils/supabase/queries'
import { getIsoDate } from '@/functions/helpers'
import { findCategory } from '@/utils/supabase/categories'
import { useMediaQuery } from '@mantine/hooks'
import { useCantonData } from '@/utils/supabase/queries'

interface RecordFormProps {
  date: Date
  setDate: (date: Date) => void
  setOpened: (opened: boolean) => void
  stopWatchSession: StopWatchSession | null
  setModalSize: (size: 'sm' | 'md' | 'lg' | 'xl' | 'full') => void
  editTimeRecord: TimeRecord | null
  setEditTimeRecord: (record: TimeRecord | null) => void
  categories: Category[]
  userData: UserData
  onFormStateChange: (hasChanges: boolean) => void
}

export const RecordForm = ({
  date,
  setDate,
  setOpened,
  stopWatchSession,
  setModalSize,
  editTimeRecord,
  setEditTimeRecord,
  categories,
  userData,
  onFormStateChange,
}: RecordFormProps) => {
  const t = useTranslations('Index')
  const t_cat = useTranslations('Categories')

  // TanStack Query hooks
  const insertRecordMutation = useInsertRecord()
  const insertRecordsMutation = useInsertRecords()
  const updateRecordMutation = useUpdateRecord()
  const deleteRecordMutation = useDeleteRecord()
  const createStopwatchSessionMutation = useCreateStopwatchSession()
  const deleteStopwatchSessionMutation = useDeleteStopwatchSession()
  const updateStopwatchSessionMutation = useUpdateStopwatchSession()
  const { data: cantonData, isLoading: cantonDataLoading } = useCantonData(
    userData.canton_code,
    userData.user_id,
  )

  const [duration, setDuration] = useState('')
  const [category, setCategory] = useState<Category | null>(null)
  const [description, setDescription] = useState('')
  const [timeError, setTimeError] = useState<string | null>(null)
  const [isRepeating, setIsRepeating] = useState(false)
  const [dates, setDates] = useState<Date[]>([])
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [isUserCategory, setIsUserCategory] = useState(false)
  const [initialFormState, setInitialFormState] = useState<{
    duration: string
    category: Category | null
    description: string
    startTime: string
    endTime: string
    isRepeating: boolean
    dates: Date[]
  } | null>(null)

  const isSmallScreen = useMediaQuery(`(max-width: 768px)`)

  const descriptionRef = useRef(null)

  useEffect(() => {
    if (stopWatchSession) {
      const start_time = new Date(stopWatchSession.start_time)
      const startTimeInMinutes = start_time.getHours() * 60 + start_time.getMinutes()
      const endTimeInMinutes = new Date().getHours() * 60 + new Date().getMinutes()
      setIsUserCategory(stopWatchSession.is_user_category)
      setCategory(findCategory(stopWatchSession, categories) || null)
      setDescription(stopWatchSession.description || '')
      setStartTime(minutesToTimeString(startTimeInMinutes))
      setEndTime(minutesToTimeString(endTimeInMinutes))
      setDuration(calculateStopWatchDuration(stopWatchSession, false))
    }
  }, [stopWatchSession, categories])

  useEffect(() => {
    if (editTimeRecord) {
      setDuration(minutesToTimeString(editTimeRecord.duration))
      setCategory(findCategory(editTimeRecord, categories) || null)
      setDescription(editTimeRecord.description || '')
      setIsUserCategory(editTimeRecord.is_user_category)
      // Normalize time strings to ensure HH:mm format
      setStartTime(normalizeTimeString(editTimeRecord.start_time))
      setEndTime(normalizeTimeString(editTimeRecord.end_time))
    }
  }, [editTimeRecord, categories])

  // Function to check if form has changes
  const checkFormChanges = useCallback(() => {
    if (!initialFormState) return false

    const currentState = {
      duration,
      category,
      description,
      startTime,
      endTime,
      isRepeating,
      dates,
    }

    return (
      currentState.duration !== initialFormState.duration ||
      currentState.category?.id !== initialFormState.category?.id ||
      currentState.description !== initialFormState.description ||
      currentState.startTime !== initialFormState.startTime ||
      currentState.endTime !== initialFormState.endTime ||
      currentState.isRepeating !== initialFormState.isRepeating ||
      JSON.stringify(currentState.dates) !== JSON.stringify(initialFormState.dates)
    )
  }, [duration, category, description, startTime, endTime, isRepeating, dates, initialFormState])

  // Track form changes and notify parent
  useEffect(() => {
    if (initialFormState) {
      const hasChanges = checkFormChanges()
      onFormStateChange(hasChanges)
    }
  }, [checkFormChanges, onFormStateChange, initialFormState])

  // Set initial form state when form opens
  useEffect(() => {
    if (!initialFormState) {
      setInitialFormState({
        duration,
        category,
        description,
        startTime,
        endTime,
        isRepeating,
        dates,
      })
    }
  }, [duration, category, description, startTime, endTime, isRepeating, dates, initialFormState])

  const reset = useCallback(() => {
    setOpened(false)
    setInitialFormState(null)
  }, [setOpened])

  const handleUpdate = useCallback(async () => {
    if (!duration) {
      setTimeError(t('durationCannotBeEmpty'))
      return
    }
    if (!editTimeRecord?.id) return
    const record: TimeRecord = {
      id: editTimeRecord.id,
      duration: timeStringToMinutes(duration),
      date: getIsoDate(date),
      description,
      start_time: startTime !== '' ? startTime : null,
      end_time: endTime !== '' ? endTime : null,
      category_id: !isUserCategory ? category?.id || null : null,
      is_user_category: isUserCategory,
      user_category_id: isUserCategory ? category?.id || null : null,
      user_id: userData.user_id,
    }
    try {
      await updateRecordMutation.mutateAsync(record)
      reset()
    } catch (error) {
      notifications.show({
        title: t('failedToUpdateEntry'),
        message: t('failedToUpdateEntryMessage'),
        color: 'red',
      })
      console.error('Failed to update entry:', error)
    }
  }, [
    duration,
    editTimeRecord,
    date,
    startTime,
    endTime,
    category,
    description,
    reset,
    isUserCategory,
    t,
    updateRecordMutation,
    userData.user_id,
  ])

  const handleCreate = useCallback(async () => {
    if (!duration) {
      setTimeError(t('durationCannotBeEmpty'))
      return
    }
    const record: TimeRecord = {
      duration: timeStringToMinutes(duration),
      date: getIsoDate(date),
      description,
      start_time: startTime === '' ? null : startTime,
      end_time: endTime === '' ? null : endTime,
      category_id: !isUserCategory ? category?.id || null : null,
      is_user_category: isUserCategory,
      user_category_id: isUserCategory ? category?.id || null : null,
      user_id: userData.user_id,
    }
    try {
      setLoading(true)
      if (!isRepeating) {
        await insertRecordMutation.mutateAsync(record)
        if (stopWatchSession) {
          await deleteStopwatchSessionMutation.mutateAsync()
        }
      } else {
        const records = dates.map((date) => ({
          ...record,
          date: getIsoDate(date),
        }))
        await insertRecordsMutation.mutateAsync(records)
        notifications.show({
          message: dates.length + ' ' + t('entriesCreated'),
          color: 'green',
        })
      }
      reset()
    } catch (error) {
      notifications.show({
        title: t('failedToAddEntry'),
        message: t('failedToAddEntryMessage'),
        color: 'red',
      })
      console.error('Failed to add entry:', error)
    } finally {
      setLoading(false)
    }
  }, [
    duration,
    date,
    description,
    startTime,
    endTime,
    category,
    isRepeating,
    dates,
    stopWatchSession,
    isUserCategory,
    reset,
    t,
    insertRecordMutation,
    insertRecordsMutation,
    deleteStopwatchSessionMutation,
    userData.user_id,
  ])

  const onSaveAndNewTimer = async () => {
    try {
      await handleCreate()
      await createStopwatchSessionMutation.mutateAsync()
    } catch (error) {
      console.error('Failed to save and start new timer:', error)
    }
  }

  const onSaveStopwatch = async () => {
    if (stopWatchSession) {
      try {
        const stopWatchSessionUpdate = {
          id: stopWatchSession.id,
          category_id: !isUserCategory ? category?.id || null : null,
          is_user_category: isUserCategory,
          user_category_id: isUserCategory ? category?.id || null : null,
          description,
          start_time: stopWatchSession.start_time,
        } as StopWatchSession
        await updateStopwatchSessionMutation.mutateAsync(stopWatchSessionUpdate)
        reset()
      } catch (error) {
        console.error('Failed to update stopwatch session:', error)
        // Don't reset on error - let user try again
      }
    } else {
      reset()
    }
  }

  const onChangeIsRepeatingSwitch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsRepeating(event.currentTarget.checked)
    setModalSize(event.currentTarget.checked ? 'lg' : 'sm')
  }

  const onDelete = async () => {
    if (editTimeRecord?.id) {
      try {
        await deleteRecordMutation.mutateAsync({
          id: editTimeRecord.id,
          date: editTimeRecord.date,
          user_id: userData.user_id,
        })
        reset()
      } catch (error) {
        notifications.show({
          title: t('failedToDeleteEntry'),
          message: t('failedToDeleteEntryMessage'),
          color: 'red',
        })
        console.error('Failed to delete entry:', error)
      }
    }
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && document.activeElement !== descriptionRef.current) {
        if (editTimeRecord) {
          handleUpdate()
        } else {
          handleCreate()
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleCreate, handleUpdate, editTimeRecord])

  // Function to process categories data for Select component
  const getCategorySelectData = useCallback(() => {
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return []
    }

    // Group categories by category_set_title for Mantine Select format
    const groupedCategories = categories.reduce(
      (acc, category) => {
        const groupTitle = category.category_set_title
        if (!acc[groupTitle]) {
          acc[groupTitle] = []
        }

        // Translate category title unless it's a user category (furtherEmployment)
        const label =
          category.category_set_title === 'furtherEmployment'
            ? category.title
            : t_cat(category.title)

        acc[groupTitle].push({
          value: category.id.toString(),
          label: label,
        })
        return acc
      },
      {} as Record<string, Array<{ value: string; label: string }>>,
    )

    // Convert to Mantine Select group format: [{ group: string, items: Array }]
    return Object.entries(groupedCategories).map(([groupTitle, items]) => ({
      group:
        groupTitle === 'furtherEmployment'
          ? t('additionalCategories') // Use existing translation for user categories
          : t_cat(groupTitle), // Translate group title
      items: items,
    }))
  }, [categories, t_cat, t])

  return (
    <Stack>
      {isSmallScreen ? (
        <>
          <Stack>
            {/* Category picker with skeleton loading */}
            {cantonDataLoading ? (
              <Skeleton h={56} radius='md' />
            ) : (
              <Select
                data={getCategorySelectData()}
                value={category?.id?.toString() || ''}
                onChange={(value) => {
                  const selectedCategory =
                    categories?.find((cat) => cat.id?.toString() === value) || null
                  setCategory(selectedCategory)
                  setIsUserCategory(
                    selectedCategory?.category_set_title === 'furtherEmployment' ? true : false,
                  )
                }}
                placeholder={t('category')}
                label={t('category')}
                clearable
                searchable
                size='md'
                disabled={!categories || categories.length === 0}
                styles={{
                  label: {
                    color: 'var(--mantine-color-text)',
                  },
                }}
              />
            )}
            <DateInput
              value={date}
              popoverProps={{ withinPortal: true }}
              onChange={(value) =>
                setDate(value ? (typeof value === 'string' ? new Date(value) : value) : new Date())
              }
              label={isRepeating ? t('startDate') : t('date')}
              placeholder={isRepeating ? t('startDate') : t('date')}
              valueFormat='DD.MM.YYYY'
              size='md'
              styles={{
                label: {
                  color: 'var(--mantine-color-text)',
                },
              }}
            />
            <DurationInput
              startTime={startTime}
              setStartTime={setStartTime}
              endTime={endTime}
              setEndTime={setEndTime}
              duration={duration}
              setDuration={setDuration}
              timeError={timeError}
            />
            <Textarea
              label={t('description')}
              ref={descriptionRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              autosize
              minRows={2}
              maxRows={4}
              size='md'
              styles={{
                label: {
                  color: 'var(--mantine-color-text)',
                },
              }}
            />
            {!stopWatchSession && !editTimeRecord && (
              <Switch
                checked={isRepeating}
                onChange={onChangeIsRepeatingSwitch}
                label={t('repeatingEntry')}
                size='md'
                styles={{
                  label: {
                    color: 'var(--mantine-color-text)',
                  },
                }}
              />
            )}
          </Stack>
          {isRepeating && (
            <Stack>
              <IntervalForm date={date} dates={dates} setDates={setDates} />
            </Stack>
          )}
        </>
      ) : (
        <Group grow gap='xl' align='flex-start'>
          <Stack>
            {/* Category picker with skeleton loading */}
            {cantonDataLoading ? (
              <Skeleton h={56} radius='md' />
            ) : (
              <Select
                data={getCategorySelectData()}
                value={category?.id?.toString() || ''}
                onChange={(value) => {
                  const selectedCategory =
                    categories?.find((cat) => cat.id?.toString() === value) || null
                  setCategory(selectedCategory)
                  setIsUserCategory(
                    selectedCategory?.category_set_title === 'furtherEmployment' ? true : false,
                  )
                }}
                placeholder={t('category')}
                label={t('category')}
                clearable
                searchable
                size='md'
                disabled={!categories || categories.length === 0}
                styles={{
                  label: {
                    color: 'var(--mantine-color-text)',
                  },
                }}
              />
            )}
            <DateInput
              value={date}
              popoverProps={{ withinPortal: true }}
              onChange={(value) =>
                setDate(value ? (typeof value === 'string' ? new Date(value) : value) : new Date())
              }
              label={isRepeating ? t('startDate') : t('date')}
              placeholder={isRepeating ? t('startDate') : t('date')}
              valueFormat='DD.MM.YYYY'
              size='md'
              styles={{
                label: {
                  color: 'var(--mantine-color-text)',
                },
              }}
            />
            <DurationInput
              startTime={startTime}
              setStartTime={setStartTime}
              endTime={endTime}
              setEndTime={setEndTime}
              duration={duration}
              setDuration={setDuration}
              timeError={timeError}
            />
            <Textarea
              label={t('description')}
              ref={descriptionRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              autosize
              minRows={2}
              maxRows={4}
              size='md'
              styles={{
                label: {
                  color: 'var(--mantine-color-text)',
                },
              }}
            />
            {!stopWatchSession && !editTimeRecord && (
              <Switch
                checked={isRepeating}
                onChange={onChangeIsRepeatingSwitch}
                label={t('repeatingEntry')}
                size='md'
                styles={{
                  label: {
                    color: 'var(--mantine-color-text)',
                  },
                }}
              />
            )}
          </Stack>
          {isRepeating && (
            <Stack>
              <IntervalForm date={date} dates={dates} setDates={setDates} />
            </Stack>
          )}
        </Group>
      )}

      <Group justify='space-between'>
        {stopWatchSession && (
          <Button
            variant='filled'
            color='red'
            onClick={async () => {
              try {
                await deleteStopwatchSessionMutation.mutateAsync()
                reset()
              } catch (error) {
                console.error('Failed to delete stopwatch session:', error)
              }
            }}
          >
            {t('deleteTimer')}
          </Button>
        )}
        {editTimeRecord && (
          <Button variant='filled' color='red' onClick={onDelete}>
            {t('deleteEntry')}
          </Button>
        )}
        {!editTimeRecord && !stopWatchSession && <span></span>}
        <Group gap='sm'>
          <Button variant='filled' color='gray' onClick={reset}>
            {t('cancel')}
          </Button>
          {stopWatchSession && (
            <SplitButton
              onCreate={handleCreate}
              onSaveAndContinue={onSaveStopwatch}
              onSaveAndNewTimer={onSaveAndNewTimer}
            />
          )}
          {editTimeRecord && <Button onClick={handleUpdate}>{t('updateEntry')}</Button>}
          {!editTimeRecord && !stopWatchSession && (
            <Button
              onClick={handleCreate}
              disabled={isRepeating && dates.length === 0}
              loading={loading}
              loaderProps={{ type: 'dots' }}
            >
              {isRepeating ? dates.length + ' ' + t('createEntries') : t('create')}
            </Button>
          )}
        </Group>
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
