import React from 'react'
import {
  Table,
  Text,
  Group,
  Stack,
  ScrollArea,
  useMantineTheme,
  useMantineColorScheme,
  rem,
} from '@mantine/core'
import { IconFolder } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'
import { convertMinutesToHoursAndMinutes } from '@/functions/helpers'
import { useMediaQuery } from '@mantine/hooks'
import classes from './CategoryStatsTable.module.css'

export interface CategoryStatisticsProps {
  title: string
  effectiveDuration: number
  targetDuration: number
  effectiveWorkload: string
  targetWorkload: string
  color: string | null
  subcategories?: { title: string; duration: number }[]
}

export interface RemainingCategoryStatisticsProps {
  title: string
  effectiveDuration: number
  targetDuration: number
  color: string | null
}

export interface CategoryStatistics {
  rows: CategoryStatisticsProps[]
  noCategoryDuration: number
  totalEffectiveDuration: number
  totalTargetDuration: number
}

export interface RemainingCategoryStatistics {
  rows: RemainingCategoryStatisticsProps[]
}

interface RemainingCategoryStatsTableProps {
  data: RemainingCategoryStatistics
  hideTargetColumn?: boolean
}

interface CategoryStatsTableProps {
  data: CategoryStatistics
  hideTargetColumn?: boolean
}

type CombinedCategoryStatsTableProps = CategoryStatsTableProps | RemainingCategoryStatsTableProps

const FIRST_COLUMN_WIDTH = 'calc(100% - 250px)'
const FIXED_COLUMN_WIDTH = '125px'
const SMALL_SCREEN_FIXED_COLUMN_WIDTH = '90px'

const styles = {
  titleIndicator: {
    marginRight: 'var(--mantine-spacing-xs)',
    width: rem(18),
    height: rem(18),
    flexShrink: 0,
  },
  categoryGroup: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  categoryText: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontWeight: 600,
  },
  subcategoryText: {
    paddingLeft: rem(30),
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}

const adjustColorBrightness = (
  color: string | null | undefined,
  mode: 'light' | 'dark',
): string | undefined => {
  if (!color || typeof color !== 'string' || !/^rgb\(\d+,\s*\d+,\s*\d+\)$/i.test(color)) {
    return undefined // Return undefined instead of null or invalid input
  }

  const rgb = color.match(/\d+/g)?.map(Number)
  if (!rgb || rgb.length !== 3) return undefined

  const adjustment = mode === 'dark' ? 10 : -50
  const adjusted = rgb.map((value) => Math.min(255, Math.max(0, value + adjustment)))

  return `rgb(${adjusted.join(', ')})`
}

const CategoryStatsTable: React.FC<CombinedCategoryStatsTableProps> = ({
  data,
  hideTargetColumn = false,
}) => {
  const t = useTranslations('Index')
  const theme = useMantineTheme()
  const { colorScheme } = useMantineColorScheme()
  const isSmallScreen = useMediaQuery('(max-width: 40em)') // Adjust breakpoint as needed

  // Type guard to distinguish between CategoryStatistics and RemainingCategoryStatistics
  const isCategoryStatistics = (data: any): data is CategoryStatistics => {
    return 'totalEffectiveDuration' in data
  }

  return (
    <Table.ScrollContainer minWidth={600} style={{ margin: 0 }} className={classes.scrollContainer}>
      <Table withTableBorder withColumnBorders striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th
              style={{
                width: hideTargetColumn ? 'calc(100% - 125px)' : FIRST_COLUMN_WIDTH,
              }}
            >
              {t('category')}
            </Table.Th>
            <Table.Th
              style={{
                width: isSmallScreen ? SMALL_SCREEN_FIXED_COLUMN_WIDTH : FIXED_COLUMN_WIDTH,
              }}
            >
              {t('effective')}
            </Table.Th>
            {!hideTargetColumn && (
              <Table.Th
                style={{
                  width: isSmallScreen ? SMALL_SCREEN_FIXED_COLUMN_WIDTH : FIXED_COLUMN_WIDTH,
                }}
              >
                {t('target')}
              </Table.Th>
            )}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {(data.rows || []).map((row) => (
            <React.Fragment key={row.title}>
              <Table.Tr className={classes.mainRow}>
                <Table.Td
                  style={{ width: hideTargetColumn ? 'calc(100% - 125px)' : FIRST_COLUMN_WIDTH }}
                >
                  <Group wrap='nowrap' style={styles.categoryGroup}>
                    <IconFolder
                      style={{
                        ...styles.titleIndicator,
                        color: adjustColorBrightness(
                          row.color,
                          colorScheme === 'auto' ? 'light' : colorScheme,
                        ),
                      }}
                    />
                    <Text style={styles.categoryText} size={isSmallScreen ? 'xs' : 'sm'}>
                      {row.title}
                    </Text>
                  </Group>
                </Table.Td>
                <Table.Td
                  style={{
                    width: isSmallScreen ? SMALL_SCREEN_FIXED_COLUMN_WIDTH : FIXED_COLUMN_WIDTH,
                  }}
                >
                  <Text size={isSmallScreen ? 'xs' : 'sm'}>
                    {convertMinutesToHoursAndMinutes(row.effectiveDuration)}
                  </Text>
                  {'effectiveWorkload' in row && (
                    <Text size={isSmallScreen ? 'xs' : 'sm'}>{row.effectiveWorkload}%</Text>
                  )}
                </Table.Td>
                {!hideTargetColumn && (
                  <Table.Td
                    style={{
                      width: isSmallScreen ? SMALL_SCREEN_FIXED_COLUMN_WIDTH : FIXED_COLUMN_WIDTH,
                    }}
                  >
                    <Text size={isSmallScreen ? 'xs' : 'sm'}>
                      {convertMinutesToHoursAndMinutes(row.targetDuration)}
                    </Text>
                    {'targetWorkload' in row && (
                      <Text size={isSmallScreen ? 'xs' : 'sm'}>{row.targetWorkload}%</Text>
                    )}
                  </Table.Td>
                )}
              </Table.Tr>
              {'subcategories' in row &&
                (row.subcategories || [])?.map((subcategory) => (
                  <Table.Tr key={subcategory.title} className={classes.subcategoryRow}>
                    <Table.Td
                      style={{
                        width: hideTargetColumn ? 'calc(100% - 125px)' : FIRST_COLUMN_WIDTH,
                      }}
                    >
                      <Text style={styles.subcategoryText} size={isSmallScreen ? 'xs' : 'sm'}>
                        {subcategory.title}
                      </Text>
                    </Table.Td>
                    <Table.Td
                      style={{
                        width: isSmallScreen ? SMALL_SCREEN_FIXED_COLUMN_WIDTH : FIXED_COLUMN_WIDTH,
                      }}
                    >
                      <Text size={isSmallScreen ? 'xs' : 'sm'}>
                        {convertMinutesToHoursAndMinutes(subcategory.duration)}
                      </Text>
                    </Table.Td>
                    {!hideTargetColumn && (
                      <Table.Td
                        style={{
                          width: isSmallScreen
                            ? SMALL_SCREEN_FIXED_COLUMN_WIDTH
                            : FIXED_COLUMN_WIDTH,
                        }}
                      ></Table.Td>
                    )}
                  </Table.Tr>
                ))}
            </React.Fragment>
          ))}
          {isCategoryStatistics(data) && (
            <Table.Tr fw={600} className={classes.mainRow}>
              <Table.Td
                style={{ width: hideTargetColumn ? 'calc(100% - 125px)' : FIRST_COLUMN_WIDTH }}
              >
                <Text size={isSmallScreen ? 'xs' : 'sm'}>{t('total')}</Text>
              </Table.Td>
              <Table.Td
                style={{
                  width: isSmallScreen ? SMALL_SCREEN_FIXED_COLUMN_WIDTH : FIXED_COLUMN_WIDTH,
                }}
              >
                <Text size={isSmallScreen ? 'xs' : 'sm'}>
                  {convertMinutesToHoursAndMinutes(data.totalEffectiveDuration)}
                </Text>
              </Table.Td>
              {!hideTargetColumn && (
                <Table.Td
                  style={{
                    width: isSmallScreen ? SMALL_SCREEN_FIXED_COLUMN_WIDTH : FIXED_COLUMN_WIDTH,
                  }}
                >
                  <Text size={isSmallScreen ? 'xs' : 'sm'}>
                    {convertMinutesToHoursAndMinutes(data.totalTargetDuration)}
                  </Text>
                </Table.Td>
              )}
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  )
}

export default CategoryStatsTable
