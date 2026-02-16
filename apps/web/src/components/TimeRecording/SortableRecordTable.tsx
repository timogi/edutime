import React, { useState, useMemo } from 'react'
import {
  ScrollArea,
  Table,
  Text,
  Group,
  Center,
  UnstyledButton,
  Loader,
  Card,
  Badge,
  Tooltip,
} from '@mantine/core'
import { IconChevronDown, IconChevronUp, IconSelector } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'
import { minutesToTimeString, removeSeconds } from '@/functions/helpers'
import { Category, TimeRecord } from '@/types/globals'
import { findCategory } from '@/utils/supabase/categories'
import { useMediaQuery } from '@mantine/hooks'
import classes from './TableSort.module.css'

interface SortableRecordTableProps {
  date: Date
  openEditTimeEntryModal: (timeRecord: TimeRecord) => void
  user_id: string
  categories: Category[]
  records: TimeRecord[]
  loading: boolean
  error: Error | null
}

interface ThProps {
  children: React.ReactNode
  reversed: boolean
  sorted: boolean
  onSort: () => void
}

function Th({ children, reversed, sorted, onSort }: ThProps) {
  const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector
  return (
    <Table.Th className={classes.th}>
      <UnstyledButton onClick={onSort} className={classes.control}>
        <Group justify='space-between'>
          <Text fw={500} fz='sm'>
            {children}
          </Text>
          <Center className={classes.icon}>
            <Icon size={16} stroke={1.5} />
          </Center>
        </Group>
      </UnstyledButton>
    </Table.Th>
  )
}

function sortData(
  data: TimeRecord[],
  payload: { sortBy: keyof TimeRecord | null; reversed: boolean },
  categories: Category[],
) {
  const { sortBy } = payload

  if (!sortBy) {
    return data
  }

  return [...data].sort((a, b) => {
    let aValue: string | number
    let bValue: string | number

    switch (sortBy) {
      case 'duration':
        aValue = a.duration
        bValue = b.duration
        break
      case 'start_time':
        aValue = a.start_time || ''
        bValue = b.start_time || ''
        break
      case 'end_time':
        aValue = a.end_time || ''
        bValue = b.end_time || ''
        break
      case 'description':
        aValue = a.description || ''
        bValue = b.description || ''
        break
      case 'category_id':
        const categoryA = findCategory(a, categories)
        const categoryB = findCategory(b, categories)
        aValue = categoryA
          ? categoryA.category_set_title === 'furtherEmployment'
            ? categoryA.title
            : categoryA.title
          : a.category_id
            ? 'otherCanton'
            : 'noCategory'
        bValue = categoryB
          ? categoryB.category_set_title === 'furtherEmployment'
            ? categoryB.title
            : categoryB.title
          : b.category_id
            ? 'otherCanton'
            : 'noCategory'
        break
      default:
        return 0
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return payload.reversed ? bValue - aValue : aValue - bValue
    }

    const aStr = String(aValue).toLowerCase()
    const bStr = String(bValue).toLowerCase()

    if (payload.reversed) {
      return bStr.localeCompare(aStr)
    }

    return aStr.localeCompare(bStr)
  })
}

export function SortableRecordTable({
  date,
  openEditTimeEntryModal,
  user_id,
  categories,
  records,
  loading,
  error,
}: SortableRecordTableProps) {
  const t = useTranslations('Index')
  const t_cat = useTranslations('Categories')
  const [scrolled, setScrolled] = useState(false)
  const [sortBy, setSortBy] = useState<keyof TimeRecord | null>(null)
  const [reverseSortDirection, setReverseSortDirection] = useState(false)

  const isSmallScreen = useMediaQuery('(max-width: 768px)')

  const sortedData = useMemo(
    () => sortData(records, { sortBy, reversed: reverseSortDirection }, categories),
    [records, sortBy, reverseSortDirection, categories],
  )

  const setSorting = (field: keyof TimeRecord) => {
    const reversed = field === sortBy ? !reverseSortDirection : false
    setReverseSortDirection(reversed)
    setSortBy(field)
  }

  const editEntry = (id: number | undefined) => {
    if (!id) return
    const timeRecord = records.find((record) => record.id === id)
    if (!timeRecord) return
    openEditTimeEntryModal(timeRecord)
  }

  const rows = sortedData.map((record) => {
    const category = findCategory(record, categories)
    return (
      <Table.Tr
        key={record.id}
        className={classes.clickableRow}
        onClick={() => editEntry(record.id)}
      >
        <Table.Td>
          <Text className={isSmallScreen ? classes.smallText : classes.normalText}>
            {minutesToTimeString(record.duration)}
          </Text>
        </Table.Td>
        <Table.Td>
          <Text className={isSmallScreen ? classes.smallText : classes.normalText}>
            {removeSeconds(record.start_time)}
          </Text>
        </Table.Td>
        <Table.Td>
          <Text className={isSmallScreen ? classes.smallText : classes.normalText}>
            {removeSeconds(record.end_time)}
          </Text>
        </Table.Td>
        <Table.Td>
          <Badge
            color={category?.color || 'gray'}
            variant='light'
            size={isSmallScreen ? 'sm' : 'md'}
            styles={{
              root: {
                border: '1px solid',
                borderColor: category?.color
                  ? category.color.startsWith('rgb')
                    ? category.color
                    : `var(--mantine-color-${category.color}-4)`
                  : 'var(--mantine-color-gray-4)',
              },
              label: {
                color: 'var(--mantine-color-text)',
                fontWeight: 500,
              },
            }}
          >
            {category
              ? category.category_set_title === 'furtherEmployment'
                ? category.title
                : t_cat(category.title)
              : record.category_id
                ? t('otherCanton')
                : t('noCategory')}
          </Badge>
        </Table.Td>
        <Table.Td>
          {record.description ? (
            <Tooltip
              label={record.description}
              multiline
              w={300}
              withArrow
              position='top'
              openDelay={300}
            >
              <Text
                className={`${isSmallScreen ? classes.smallText : classes.normalText} ${classes.descriptionText}`}
              >
                {record.description.replace(/\n/g, ' ').trim()}
              </Text>
            </Tooltip>
          ) : (
            <Text className={isSmallScreen ? classes.smallText : classes.normalText}>
              {record.description}
            </Text>
          )}
        </Table.Td>
      </Table.Tr>
    )
  })

  return (
    <Card className={classes.tableCard} padding={0} withBorder radius='md'>
      <div className={classes.tableContainer}>
        <ScrollArea
          onScrollPositionChange={({ y }) => setScrolled(y !== 0)}
          className={classes.scrollArea}
          style={{ height: '100%' }}
        >
          <Table
            horizontalSpacing='sm'
            verticalSpacing={4}
            miw={700}
            layout='fixed'
            striped
            highlightOnHover
          >
            <Table.Thead className={`${classes.header} ${scrolled ? classes.scrolled : ''}`}>
              <Table.Tr>
                <Th
                  sorted={sortBy === 'duration'}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting('duration')}
                >
                  {t('duration')}
                </Th>
                <Th
                  sorted={sortBy === 'start_time'}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting('start_time')}
                >
                  {t('startTime')}
                </Th>
                <Th
                  sorted={sortBy === 'end_time'}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting('end_time')}
                >
                  {t('endTime')}
                </Th>
                <Th
                  sorted={sortBy === 'category_id'}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting('category_id')}
                >
                  {t('category')}
                </Th>
                <Th
                  sorted={sortBy === 'description'}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting('description')}
                >
                  {t('description')}
                </Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </ScrollArea>
        {(loading || rows.length === 0) && (
          <div className={classes.noRecordsOverlay}>
            {loading ? (
              <Center>
                <Loader size='md' />
              </Center>
            ) : (
              <Text className={classes.noRecordsText}>{t('noRecords')}</Text>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
