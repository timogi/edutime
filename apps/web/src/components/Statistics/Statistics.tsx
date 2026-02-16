import React, { useEffect, useState } from 'react'
import { Stack, Card, Skeleton, Title, Alert, Text, Group, Table } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { GetStaticPropsContext } from 'next/types'
import { Category, CantonData, UserData } from '@/types/globals'
import {
  getCategoryStatisticsData,
  getRemainingCategoryStatisticsData,
} from '@/utils/supabase/categoryStatisticsService'
import { DateRangePickerPill } from './DateRangePickerPill'
import { useStyles } from './styles'
import CategoryStatsTable, {
  CategoryStatistics,
  RemainingCategoryStatistics,
} from './CategoryStatsTable'
import { getCantonData } from '@/utils/supabase/canton'
import { updateUserStatDates } from '@/utils/supabase/user'
import { ReportingComponent } from './ReportingComponent'

interface StatisticsProps {
  userData: UserData
  categories: Category[]
  reloadUserData: () => void
}

const Statistics: React.FC<StatisticsProps> = ({ userData, categories, reloadUserData }) => {
  const { classes } = useStyles()
  const t_cat = useTranslations('Categories')
  const t_stats = useTranslations('Statistics')
  const [categoryStatistics, setCategoryStatistics] = useState<CategoryStatistics | null>(null)
  const [remainingCategoryStatistics, setRemainingCategoryStatistics] =
    useState<RemainingCategoryStatistics | null>(null)
  const [cantonData, setCantonData] = useState<CantonData | null>(null)

  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()
  const startYear = currentMonth >= 7 ? currentYear : currentYear - 1

  // Initialize dates from user data or use defaults
  const getInitialStartDate = () => {
    if (userData.stat_start_date) {
      return new Date(userData.stat_start_date)
    }
    return new Date(startYear, 7, 1)
  }

  const getInitialEndDate = () => {
    if (userData.stat_end_date) {
      return new Date(userData.stat_end_date)
    }
    return new Date(startYear + 1, 6, 31)
  }

  const [startDate, setStartDate] = useState(getInitialStartDate())
  const [endDate, setEndDate] = useState(getInitialEndDate())

  // Save dates to database when they change
  const saveDatesToDatabase = async (newStartDate: Date, newEndDate: Date) => {
    try {
      // Format dates in local timezone to avoid timezone conversion issues
      const startDateString = `${newStartDate.getFullYear()}-${String(newStartDate.getMonth() + 1).padStart(2, '0')}-${String(newStartDate.getDate()).padStart(2, '0')}`
      const endDateString = `${newEndDate.getFullYear()}-${String(newEndDate.getMonth() + 1).padStart(2, '0')}-${String(newEndDate.getDate()).padStart(2, '0')}`

      await updateUserStatDates(userData.user_id, startDateString, endDateString)

      // Reload user data to update the main component's userData state
      await reloadUserData()
    } catch (error) {
      console.error('Error saving stat dates:', error)
    }
  }

  // Custom setters that also save to database
  const handleStartDateChange = (newDate: Date) => {
    setStartDate(newDate)
    saveDatesToDatabase(newDate, endDate)
  }

  const handleEndDateChange = (newDate: Date) => {
    setEndDate(newDate)
    saveDatesToDatabase(startDate, newDate)
  }

  useEffect(() => {
    const loadCantonData = async () => {
      try {
        const data = await getCantonData(userData.canton_code, userData.user_id)
        setCantonData(data || null)
      } catch (error) {
        console.error('Error fetching canton data:', error)
      }
    }

    loadCantonData()
  }, [userData])

  useEffect(() => {
    const loadCategoryStatistics = async () => {
      if (!cantonData || !categories || categories.length === 0) return
      try {
        const stats = await getCategoryStatisticsData(
          startDate,
          endDate,
          userData.user_id,
          categories,
          cantonData,
          userData,
          t_cat,
        )
        setCategoryStatistics(stats)
      } catch (error) {
        console.error('Error fetching category statistics:', error)
      }
      try {
        const stats = await getRemainingCategoryStatisticsData(
          startDate,
          endDate,
          userData.user_id,
          categories,
          cantonData,
          userData,
          t_cat,
        )
        setRemainingCategoryStatistics(stats)
      } catch (error) {
        console.error('Error fetching remaining category statistics:', error)
      }
    }

    loadCategoryStatistics()
  }, [cantonData, startDate, endDate, userData, categories, t_cat])

  // Check if canton has working hours disabled (no annual work time)
  const hasNoAnnualWorkTime = cantonData?.is_working_hours_disabled === true

  return (
    <Stack className={classes.wrapper}>
      <Group mx='auto' mt={'lg'} justify='center'>
        <DateRangePickerPill
          startDate={startDate}
          endDate={endDate}
          setStartDate={handleStartDateChange}
          setEndDate={handleEndDateChange}
        />
      </Group>

      {/* Alert for no annual work time */}
      {hasNoAnnualWorkTime && (
        <Alert c='violet' variant='light' mx='lg' mt='md'>
          <Text size='sm'>{t_stats('tgNoAnnualWorkTime')}</Text>
        </Alert>
      )}

      {/* Card for Category Statistics with conditional skeleton */}
      <Card radius='md' m='lg' p={0} withBorder style={{ overflow: 'hidden' }}>
        {categoryStatistics ? (
          <CategoryStatsTable data={categoryStatistics} hideTargetColumn={hasNoAnnualWorkTime} />
        ) : (
          <Table.ScrollContainer minWidth={600}>
            <Table withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>
                    <Skeleton height={20} />
                  </Table.Th>
                  <Table.Th>
                    <Skeleton height={20} />
                  </Table.Th>
                  {!hasNoAnnualWorkTime && (
                    <Table.Th>
                      <Skeleton height={20} />
                    </Table.Th>
                  )}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Table.Tr key={i}>
                    <Table.Td>
                      <Skeleton height={16} />
                    </Table.Td>
                    <Table.Td>
                      <Skeleton height={16} />
                    </Table.Td>
                    {!hasNoAnnualWorkTime && (
                      <Table.Td>
                        <Skeleton height={16} />
                      </Table.Td>
                    )}
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Card>

      <Title
        order={3}
        mx='lg'
        c='light-dark(var(--mantine-color-dark-7), var(--mantine-color-gray-0))'
      >
        {t_cat('additionalCategories')}:
      </Title>

      <Card radius='md' mx='lg' mb={'lg'} p={0} withBorder style={{ overflow: 'hidden' }}>
        {remainingCategoryStatistics ? (
          <CategoryStatsTable
            data={remainingCategoryStatistics}
            hideTargetColumn={hasNoAnnualWorkTime}
          />
        ) : (
          <Table.ScrollContainer minWidth={600}>
            <Table withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>
                    <Skeleton height={20} />
                  </Table.Th>
                  <Table.Th>
                    <Skeleton height={20} />
                  </Table.Th>
                  {!hasNoAnnualWorkTime && (
                    <Table.Th>
                      <Skeleton height={20} />
                    </Table.Th>
                  )}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Table.Tr key={i}>
                    <Table.Td>
                      <Skeleton height={16} />
                    </Table.Td>
                    <Table.Td>
                      <Skeleton height={16} />
                    </Table.Td>
                    {!hasNoAnnualWorkTime && (
                      <Table.Td>
                        <Skeleton height={16} />
                      </Table.Td>
                    )}
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Card>
      {remainingCategoryStatistics && categoryStatistics ? (
        <ReportingComponent
          startDate={startDate}
          endDate={endDate}
          userData={userData}
          categoryStatistics={categoryStatistics}
          remainingCategoryStatistics={remainingCategoryStatistics}
          categories={categories}
          hideTargetColumn={hasNoAnnualWorkTime}
          cantonData={cantonData}
        />
      ) : (
        <Card radius='md' mx='lg' mb={'lg'} p='lg' withBorder>
          <Stack gap='md'>
            <Skeleton height={40} radius='md' />
            <Skeleton height={20} radius='sm' />
            <Skeleton height={20} radius='sm' />
            <Skeleton height={20} radius='sm' />
          </Stack>
        </Card>
      )}
    </Stack>
  )
}

export default Statistics

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../../messages/${locale}.json`)).default,
    },
  }
}
