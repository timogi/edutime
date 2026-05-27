import React, { useCallback, useEffect, useState } from 'react'
import { Button, Card, Stack, Text } from '@mantine/core'
import { IconFileTypeCsv } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'
import { Category, UserData } from '@/types/globals'
import { countUserRecords, getAllRecords } from '@/utils/supabase/records'
import { buildRecordsCsv, triggerCsvDownload } from '@/utils/exportRecordsCsv'
import accountClasses from '@/components/Account/Account.module.css'

interface RecordsDataExportProps {
  userData: UserData
  categories: Category[]
  /** Do not render the section when the user has no records */
  hideWhenEmpty?: boolean
  /** Match Account settings tiles in the grid */
  variant?: 'card' | 'tile'
}

export function RecordsDataExport({
  userData,
  categories,
  hideWhenEmpty = false,
  variant = 'card',
}: RecordsDataExportProps) {
  const t = useTranslations('DataExport')
  const t_report = useTranslations('Report')
  const t_cat = useTranslations('Categories')
  const [recordCount, setRecordCount] = useState<number | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const loadRecordCount = useCallback(async () => {
    const count = await countUserRecords(userData.user_id)
    setRecordCount(count)
  }, [userData.user_id])

  useEffect(() => {
    void loadRecordCount()
  }, [loadRecordCount])

  const handleDownload = async () => {
    setIsGenerating(true)
    try {
      const records = await getAllRecords(userData.user_id)
      const csvLabels = {
        date: t_report('date'),
        from: t_report('csvFrom'),
        to: t_report('csvTo'),
        category: t_report('category'),
        description: t_report('description'),
        duration: t_report('duration'),
        noCategory: t_report('noCategory'),
        otherCanton: t_report('otherCanton'),
      }
      const csvContent = buildRecordsCsv(records, categories, csvLabels, t_cat)
      const exportDate = new Date()
      const exportDateString = exportDate.toISOString().split('T')[0].replace(/-/g, '')
      const exportTimeString = exportDate
        .toTimeString()
        .split(' ')[0]
        .replace(/:/g, '-')
      triggerCsvDownload(csvContent, `EduTime_Datenexport_${exportDateString}_${exportTimeString}.csv`)
    } catch (error) {
      console.error('CSV data export failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  if (recordCount === null) {
    return null
  }

  if (hideWhenEmpty && recordCount === 0) {
    return null
  }

  const hasRecords = recordCount > 0

  const content = (
    <Stack gap='sm' p={variant === 'tile' ? 'lg' : undefined}>
      <Text size='xl'>{t('title')}</Text>
      <Text size='sm' c='dimmed'>
        {t('description')}
      </Text>
      {!hasRecords && (
        <Text size='sm' c='dimmed'>
          {t('noRecords')}
        </Text>
      )}
      <Button
        leftSection={<IconFileTypeCsv size={18} />}
        variant='light'
        loading={isGenerating}
        disabled={!hasRecords}
        onClick={() => void handleDownload()}
        w='fit-content'
      >
        {isGenerating ? t_report('generating') : t('download')}
      </Button>
    </Stack>
  )

  if (variant === 'tile') {
    return (
      <Card radius='md' withBorder className={accountClasses.card}>
        <div className={accountClasses.cardContent}>{content}</div>
      </Card>
    )
  }

  return (
    <Card radius='md' withBorder p='md'>
      {content}
    </Card>
  )
}
