import React, { useEffect, useState, useCallback } from 'react'
import { Stack, Group, Modal, Button, Text, Card } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { GetStaticPropsContext } from 'next/types'
import { StopWatchButton } from './StopWatchButton'
import { RecordTable } from './RecordTable'
import { RecordForm } from './RecordForm'
import { Category, StopWatchSession, TimeRecord, UserData } from '@/types/globals'
import { DayPicker } from './DayPicker'
import { DatePickerInput } from '@mantine/dates'
import { IconArrowLeft, IconArrowRight, IconCalendar, IconPlus } from '@tabler/icons-react'
import { addDays, startOfWeek } from 'date-fns'
import { HEADER_HEIGHT } from '@/components/AppLayout'
import { useMediaQuery } from '@mantine/hooks'
import { useRecords, useDailyDurations } from '@/utils/supabase/queries'
import { getIsoDate } from '@/functions/helpers'
import classes from './TimeRecording.module.css'

interface TimeRecordingProps {
  initDate: Date | null
  openTimeTrackerDate: (date: Date) => void
  userData: UserData
  categories: Category[]
  reloadUserData: () => void
}

export function TimeRecording({
  initDate,
  openTimeTrackerDate,
  userData,
  categories,
  reloadUserData,
}: TimeRecordingProps) {
  const t = useTranslations('Index')
  const [date, setDate] = useState(initDate ? initDate : new Date())
  const [opened, setOpened] = useState(false)
  const [modalTitle, setModalTitle] = useState(t('createEntry'))
  const [stopWatchSession, setStopWatchSession] = useState<null | StopWatchSession>(null)
  const [editTimeRecord, setEditTimeRecord] = useState<TimeRecord | null>(null)
  const [modalSize, setModalSize] = useState<'sm' | 'md' | 'lg' | 'xl' | 'full'>('md')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const isSmallScreen = useMediaQuery('(max-width: 768px)')

  // Use TanStack Query hooks - mutations will automatically invalidate and refetch
  const {
    data: records = [],
    isLoading: loading,
    error,
  } = useRecords(getIsoDate(date), userData.user_id)

  // Add useDailyDurations to parent component
  const startOfCurrentWeek = startOfWeek(date, { weekStartsOn: 1 })
  const endOfCurrentWeek = addDays(startOfCurrentWeek, 6)
  const {
    data: dailyDurations = {},
    isLoading: dailyLoading,
    error: dailyError,
  } = useDailyDurations(startOfCurrentWeek, endOfCurrentWeek, userData.user_id)

  const openTimeTrackerModal = (stopWatchSession: StopWatchSession) => {
    setStopWatchSession(stopWatchSession)
    setEditTimeRecord(null)
    setModalTitle('Timer')
    setOpened(true)
  }

  const openTimeEntryModal = () => {
    setModalTitle(t('createEntry'))
    setEditTimeRecord(null)
    setStopWatchSession(null)
    setOpened(true)
  }

  const openEditTimeEntryModal = (timeRecord: TimeRecord) => {
    setEditTimeRecord(timeRecord)
    setStopWatchSession(null)
    setModalTitle(t('editEntry'))
    setOpened(true)
  }

  // Handle beforeunload event to warn user about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && opened) {
        event.preventDefault()
        event.returnValue =
          t('unsavedChangesWarning') ||
          'Sie haben ungespeicherte Änderungen. Möchten Sie die Seite wirklich verlassen?'
        return event.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges, opened, t])

  // Callback to handle form state changes
  const handleFormStateChange = useCallback((hasChanges: boolean) => {
    setHasUnsavedChanges(hasChanges)
  }, [])

  const handleCloseModal = useCallback(() => {
    setOpened(false)
    setModalSize('md')
    setHasUnsavedChanges(false)
  }, [])

  return (
    <>
      <Modal
        opened={opened}
        onClose={handleCloseModal}
        title={modalTitle}
        size={modalSize}
        styles={{
          title: {
            color: 'var(--mantine-color-text)',
            fontWeight: 600,
          },
          content: {
            backgroundColor: 'var(--mantine-color-body)',
          },
          header: {
            backgroundColor: 'var(--mantine-color-body)',
          },
        }}
      >
        <RecordForm
          date={date}
          setDate={setDate}
          setOpened={setOpened}
          stopWatchSession={stopWatchSession}
          setModalSize={setModalSize}
          editTimeRecord={editTimeRecord}
          setEditTimeRecord={setEditTimeRecord}
          categories={categories}
          userData={userData}
          onFormStateChange={handleFormStateChange}
        />
      </Modal>
      <div className={classes.wrapper}>
        <div className={classes.content}>
          <div className={classes.mainCard}>
            <div className={classes.cardContent}>
              <Card className={classes.datePickerCard} padding={0} withBorder radius='xl'>
                <Group className={classes.datePickerGroup} gap={0}>
                  <Button
                    onClick={() => setDate(addDays(date, -7))}
                    variant='subtle'
                    c='gray'
                    size='md'
                    className={classes.datePickerArrow}
                  >
                    <IconArrowLeft size='1.25rem' />
                  </Button>
                  <DatePickerInput
                    placeholder='Pick date'
                    value={date}
                    valueFormat='DD.MM.YYYY'
                    onChange={(value) =>
                      setDate(
                        value ? (typeof value === 'string' ? new Date(value) : value) : new Date(),
                      )
                    }
                    variant='default'
                    size='md'
                    className={classes.datePickerInput}
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
                    onClick={() => setDate(addDays(date, 7))}
                    variant='subtle'
                    c='gray'
                    size='md'
                    className={classes.datePickerArrow}
                  >
                    <IconArrowRight size='1.25rem' />
                  </Button>
                </Group>
              </Card>

              <DayPicker
                date={date}
                setDate={setDate}
                user_id={userData.user_id}
                dailyDurations={dailyDurations}
                loading={dailyLoading}
                error={dailyError}
              />

              <div className={classes.tableContainer}>
                <RecordTable
                  date={date}
                  openEditTimeEntryModal={openEditTimeEntryModal}
                  user_id={userData.user_id}
                  categories={categories}
                  records={records}
                  loading={loading}
                  error={error}
                />
              </div>

              <div className={classes.actionButtons}>
                <StopWatchButton
                  openTimeTrackerModal={openTimeTrackerModal}
                  size={isSmallScreen ? 'sm' : 'md'}
                />
                <Button
                  onClick={openTimeEntryModal}
                  leftSection={<IconPlus size={isSmallScreen ? '0.875rem' : '1rem'} stroke={2} />}
                  variant='filled'
                  color='violet'
                  size={isSmallScreen ? 'sm' : 'md'}
                >
                  <Text fw={600}>{t('createEntry')}</Text>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
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
