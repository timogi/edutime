import React, { useState, useEffect } from 'react'
import { Card, Stack, Text, Button, Group, Badge, Switch } from '@mantine/core'
import {
  Page,
  Text as PdfText,
  Document,
  StyleSheet,
  View,
  Image as PdfImage,
  pdf,
  Font,
} from '@react-pdf/renderer'
import { getRecords } from '../../utils/supabase/records'
import { TimeRecord, UserData, Category, CantonData } from '../../types/globals'
import { IconFileTypePdf } from '@tabler/icons-react'
import { convertMinutesToHoursAndMinutes } from '../../functions/helpers'
import { useTranslations } from 'next-intl'

// Import the Roboto font files using relative paths
import { RobotoRegular } from '../../assets/fonts/Roboto-Regular'
import { RobotoBold } from '../../assets/fonts/Roboto-Bold'
import { findCategory } from '@/utils/supabase/categories'

// Register the fonts with @react-pdf/renderer
Font.register({
  family: 'Roboto',
  fonts: [
    { src: RobotoRegular, fontWeight: 'normal' },
    { src: RobotoBold, fontWeight: 'bold' },
  ],
})

interface CategoryStatisticsProps {
  title: string
  effectiveDuration: number
  targetDuration: number
  effectiveWorkload: string
  targetWorkload: string
  color: string | null
  subcategories?: { title: string; duration: number }[]
}

interface RemainingCategoryStatisticsProps {
  title: string
  effectiveDuration: number
  targetDuration: number
  color: string | null
}

interface CategoryStatistics {
  rows: CategoryStatisticsProps[]
  totalEffectiveDuration: number
  totalTargetDuration: number
}

interface RemainingCategoryStatistics {
  rows: RemainingCategoryStatisticsProps[]
}

interface ReportingComponentProps {
  startDate: Date
  endDate: Date
  userData: UserData
  categoryStatistics: CategoryStatistics
  remainingCategoryStatistics: RemainingCategoryStatistics
  categories: Category[]
  hideTargetColumn?: boolean
  cantonData?: CantonData | null
}

export const ReportingComponent: React.FC<ReportingComponentProps> = ({
  startDate,
  endDate,
  userData,
  categoryStatistics,
  remainingCategoryStatistics,
  categories,
  hideTargetColumn = false,
  cantonData,
}) => {
  const t = useTranslations('Report')
  const t_cat = useTranslations('Categories')
  const [records, setRecords] = useState<TimeRecord[]>([])
  const [includeCategoryTable, setIncludeCategoryTable] = useState(true)
  const [includeRemainingCategoryTable, setIncludeRemainingCategoryTable] = useState(true)
  const [includeRecordsTable, setIncludeRecordsTable] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    const fetchRecords = async () => {
      const fetchedRecords: TimeRecord[] = await getRecords(startDate, endDate, userData.user_id)
      setRecords(fetchedRecords)
    }

    fetchRecords()
  }, [startDate, endDate, userData.user_id])

  // Generate export date string for file name
  const exportDate = new Date()
  const exportDateString = exportDate.toISOString().split('T')[0]
  const exportTimeString = exportDate.toTimeString().split(' ')[0].replace(/:/g, '-')
  const exportDateTimeString = `${exportDateString}_${exportTimeString}`

  // Generate start and end date strings for report header
  const startDateString = startDate.toLocaleDateString()
  const endDateString = endDate.toLocaleDateString()

  const isDownloadDisabled =
    !includeCategoryTable && !includeRemainingCategoryTable && !includeRecordsTable

  const handleDownload = async () => {
    setIsGenerating(true)

    const reportTranslations = {
      reportTitle: t('workTimeReport'),
      reportSubtitle: t('reportSubtitle', { startDate: startDateString, endDate: endDateString }),
      footerText: t('reportFooter'),
      mainEmploymentTitle: t('mainEmployment'),
      otherEmploymentsTitle: t('otherEmployments'),
      individualEntriesTitle: t('individualEntries'),
      tableHeaders: {
        category: t('category'),
        effective: t('effective'),
        target: t('target'),
        date: t('date'),
        description: t('description'),
        duration: t('duration'),
        total: t('total'),
        noCategory: t('noCategory'),
        otherCanton: t('otherCanton'),
      },
      userInfo: {
        name: t('userInfo.name'),
        email: t('userInfo.email'),
        canton: t('userInfo.canton'),
        workload: t('userInfo.workload'),
        annualWorkHours: t('userInfo.annualWorkHours'),
        customWorkHours: t('userInfo.customWorkHours'),
        hours: t('userInfo.hours'),
      },
    }

    const reportDocument = (
      <Report
        records={records}
        categories={categories}
        includeRecordsTable={includeRecordsTable}
        categoryStatistics={categoryStatistics}
        includeCategoryTable={includeCategoryTable}
        remainingCategoryStatistics={remainingCategoryStatistics}
        includeRemainingCategoryTable={includeRemainingCategoryTable}
        startDate={startDateString}
        endDate={endDateString}
        reportTranslations={reportTranslations}
        t_cat={t_cat}
        hideTargetColumn={hideTargetColumn}
        userData={userData}
        cantonData={cantonData}
      />
    )

    const asPdf = pdf()
    asPdf.updateContainer(reportDocument)

    const blob = await asPdf.toBlob()
    const blobUrl = URL.createObjectURL(blob)

    // Generate a clean filename with export timestamp
    const exportTimestamp =
      exportDateString.replace(/-/g, '') + '_' + exportTimeString.replace(/-/g, '')
    const filename = `Arbeitszeitbericht_${exportTimestamp}.pdf`

    const link = document.createElement('a')
    link.href = blobUrl
    link.download = filename
    link.setAttribute('download', filename) // Ensure download attribute is set
    document.body.appendChild(link)
    link.click()
    // Add safety check before removal to prevent NotFoundError
    if (link.parentNode === document.body) {
      document.body.removeChild(link)
    }
    URL.revokeObjectURL(blobUrl)

    setIsGenerating(false)
  }

  return (
    <Card radius='md' withBorder m={'lg'}>
      <Stack gap='sm'>
        <Group>
          <Text size='xl'>{t('workTimeReport')}</Text>
        </Group>
        <Text>{t('reportDescription')}</Text>
        <Group justify='center' gap='xl'>
          <Card radius='md' withBorder m={'lg'}>
            <Group>
              <Stack gap='sm'>
                <Switch
                  checked={includeCategoryTable}
                  onChange={() => setIncludeCategoryTable(!includeCategoryTable)}
                  label={t('mainEmployment')}
                />
                <Switch
                  checked={includeRemainingCategoryTable}
                  onChange={() => setIncludeRemainingCategoryTable(!includeRemainingCategoryTable)}
                  label={t('otherEmployments')}
                />
                <Switch
                  checked={includeRecordsTable}
                  onChange={() => setIncludeRecordsTable(!includeRecordsTable)}
                  label={t('individualEntries')}
                />
              </Stack>
              <Button
                leftSection={<IconFileTypePdf />}
                disabled={isDownloadDisabled || isGenerating}
                onClick={handleDownload}
              >
                {isGenerating ? t('generating') : t('download')}
              </Button>
            </Group>
          </Card>
        </Group>
      </Stack>
    </Card>
  )
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff', // Always white background for PDF
    fontFamily: 'Roboto', // Use the registered font
    color: '#000000', // Always black text for PDF
  },
  header: {
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logo: {
    width: 40,
    height: 40,
  },
  titleRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 12,
    color: '#888888',
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000000', // Always black text
  },
  reportSubtitle: {
    fontSize: 12,
    color: '#000000', // Always black text
    marginBottom: 10,
  },
  userInfo: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#bdbdbd',
    borderBottomStyle: 'solid',
  },
  userInfoTable: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  userInfoRow: {
    flexDirection: 'row',
  },
  userInfoCell: {
    width: '50%',
    paddingVertical: 3,
    paddingHorizontal: 5,
    fontSize: 10,
  },
  userInfoLabel: {
    fontWeight: 'bold',
    color: '#000000',
    width: '45%',
  },
  userInfoValue: {
    color: '#000000',
    width: '55%',
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 5,
    marginTop: 10,
    color: '#000000', // Always black text
  },
  table: {
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#bdbdbd',
    borderBottomStyle: 'solid',
    alignItems: 'center',
    minHeight: 24,
  },
  tableHeaderRow: {
    backgroundColor: '#f0f0f0',
  },
  tableCell: {
    fontSize: 10,
    flex: 1,
    paddingVertical: 2,
    paddingHorizontal: 5,
    fontWeight: 'normal',
    color: '#000000', // Always black text
  },
  tableCellHeader: {
    fontWeight: 'bold',
  },
  firstColumn: {
    flex: 2,
  },
  // Styles specific to the records table
  recordsTableCellDate: {
    flex: 1,
    fontSize: 10,
    paddingVertical: 2,
    paddingHorizontal: 5,
    color: '#000000', // Always black text
  },
  recordsTableCellCategory: {
    flex: 1,
    fontSize: 10,
    paddingVertical: 2,
    paddingHorizontal: 5,
    color: '#000000', // Always black text
  },
  recordsTableCellDescription: {
    flex: 2,
    fontSize: 10,
    paddingVertical: 2,
    paddingHorizontal: 5,
    color: '#000000', // Always black text
  },
  recordsTableCellDuration: {
    flex: 1,
    fontSize: 10,
    paddingVertical: 2,
    paddingHorizontal: 5,
    color: '#000000', // Always black text
  },
  recordsTableCellHeader: {
    fontWeight: 'bold',
  },
  roundedTable: {
    borderWidth: 1,
    borderColor: '#bdbdbd',
    borderRadius: 5,
    overflow: 'hidden',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#000000', // Always black text
  },
})

// Report Component and other sub-components

const Report = ({
  records,
  categories,
  includeRecordsTable,
  categoryStatistics,
  includeCategoryTable,
  remainingCategoryStatistics,
  includeRemainingCategoryTable,
  startDate,
  endDate,
  reportTranslations,
  t_cat,
  hideTargetColumn = false,
  userData,
  cantonData,
}: {
  records: TimeRecord[]
  categories: Category[]
  includeRecordsTable: boolean
  categoryStatistics: CategoryStatistics
  includeCategoryTable: boolean
  remainingCategoryStatistics: RemainingCategoryStatistics
  includeRemainingCategoryTable: boolean
  startDate: string
  endDate: string
  reportTranslations: any
  t_cat: (key: string) => string
  hideTargetColumn?: boolean
  userData: UserData
  cantonData?: CantonData | null
}) => {
  const exportDate = new Date()
  return (
    <Document
      title={reportTranslations.reportTitle}
      author={[userData.first_name, userData.last_name].filter(Boolean).join(' ') || 'EduTime'}
      subject={`Arbeitszeitbericht vom ${startDate} bis ${endDate}`}
      creator='EduTime'
      producer='EduTime'
      keywords={`Arbeitszeit, Bericht, ${startDate}, ${endDate}`}
      creationDate={exportDate}
    >
      <Page size='A4' style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <PdfText style={styles.reportTitle}>{reportTranslations.reportTitle}</PdfText>
            <PdfText style={styles.reportSubtitle}>{reportTranslations.reportSubtitle}</PdfText>
          </View>
          <PdfImage src='/logo.png' style={styles.logo} />
        </View>

        {/* User Information Section */}
        <View style={styles.userInfo}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {/* Left Column */}
            <View style={{ width: '50%', paddingRight: 10 }}>
              {userData.first_name || userData.last_name ? (
                <View style={styles.userInfoRow}>
                  <PdfText style={[styles.userInfoCell, styles.userInfoLabel]}>
                    {reportTranslations.userInfo.name}:
                  </PdfText>
                  <PdfText style={[styles.userInfoCell, styles.userInfoValue]}>
                    {[userData.first_name, userData.last_name].filter(Boolean).join(' ') || '-'}
                  </PdfText>
                </View>
              ) : null}
              {userData.email ? (
                <View style={styles.userInfoRow}>
                  <PdfText style={[styles.userInfoCell, styles.userInfoLabel]}>
                    {reportTranslations.userInfo.email}:
                  </PdfText>
                  <PdfText style={[styles.userInfoCell, styles.userInfoValue]}>
                    {userData.email}
                  </PdfText>
                </View>
              ) : null}
              {cantonData?.title ? (
                <View style={styles.userInfoRow}>
                  <PdfText style={[styles.userInfoCell, styles.userInfoLabel]}>
                    {reportTranslations.userInfo.canton}:
                  </PdfText>
                  <PdfText style={[styles.userInfoCell, styles.userInfoValue]}>
                    {cantonData.title}
                  </PdfText>
                </View>
              ) : null}
              {userData.workload ? (
                <View style={styles.userInfoRow}>
                  <PdfText style={[styles.userInfoCell, styles.userInfoLabel]}>
                    {reportTranslations.userInfo.workload}:
                  </PdfText>
                  <PdfText style={[styles.userInfoCell, styles.userInfoValue]}>
                    {userData.workload}%
                  </PdfText>
                </View>
              ) : null}
              {/* Bern: Jahresarbeitszeit */}
              {cantonData?.annual_work_hours != null &&
                cantonData.annual_work_hours > 0 &&
                !cantonData.use_custom_work_hours &&
                !cantonData.is_working_hours_disabled && (
                  <View style={styles.userInfoRow}>
                    <PdfText style={[styles.userInfoCell, styles.userInfoLabel]}>
                      {reportTranslations.userInfo.annualWorkHours}:
                    </PdfText>
                    <PdfText style={[styles.userInfoCell, styles.userInfoValue]}>
                      {cantonData.annual_work_hours} {reportTranslations.userInfo.hours}
                    </PdfText>
                  </View>
                )}
              {/* Aargau: Netto-Jahresarbeitszeit (Vollpensum) */}
              {cantonData?.use_custom_work_hours &&
                !cantonData?.is_working_hours_disabled &&
                userData.custom_work_hours && (
                  <View style={styles.userInfoRow}>
                    <PdfText style={[styles.userInfoCell, styles.userInfoLabel]}>
                      {reportTranslations.userInfo.customWorkHours}:
                    </PdfText>
                    <PdfText style={[styles.userInfoCell, styles.userInfoValue]}>
                      {userData.custom_work_hours} {reportTranslations.userInfo.hours}
                    </PdfText>
                  </View>
                )}
            </View>
            {/* Right Column */}
            <View style={{ width: '50%', paddingLeft: 10 }}>
              {/* St. Gallen: Konfigurierbare %-Sätze für Kategorien */}
              {cantonData?.is_configurable &&
                cantonData.category_sets &&
                cantonData.category_sets.length > 0 && (
                  <>
                    {cantonData.category_sets.map((categorySet) => {
                      const userPercentage =
                        categorySet.user_percentage ?? categorySet.percentage ?? 0
                      if (userPercentage === 0) return null
                      return (
                        <View key={categorySet.id} style={styles.userInfoRow}>
                          <PdfText style={[styles.userInfoCell, styles.userInfoLabel]}>
                            {t_cat(categorySet.title)}:
                          </PdfText>
                          <PdfText style={[styles.userInfoCell, styles.userInfoValue]}>
                            {userPercentage}%
                          </PdfText>
                        </View>
                      )
                    })}
                  </>
                )}
            </View>
          </View>
        </View>

        {/* Content Section */}
        {includeCategoryTable && (
          <>
            <PdfText style={styles.sectionTitle}>{reportTranslations.mainEmploymentTitle}</PdfText>
            <View style={[styles.table, styles.roundedTable]}>
              <CategoryStatisticsPDFTable
                data={categoryStatistics}
                reportTranslations={reportTranslations}
                hideTargetColumn={hideTargetColumn}
              />
            </View>
          </>
        )}
        {includeRemainingCategoryTable && (
          <>
            <PdfText style={styles.sectionTitle}>
              {reportTranslations.otherEmploymentsTitle}
            </PdfText>
            <View style={[styles.table, styles.roundedTable]}>
              <RemainingCategoryStatisticsPDFTable
                data={remainingCategoryStatistics}
                reportTranslations={reportTranslations}
                hideTargetColumn={hideTargetColumn}
              />
            </View>
          </>
        )}
        {includeRecordsTable && (
          <>
            <PdfText style={styles.sectionTitle}>
              {reportTranslations.individualEntriesTitle}
            </PdfText>
            <View style={[styles.table, styles.roundedTable]}>
              <RecordsTable
                records={records}
                categories={categories}
                reportTranslations={reportTranslations}
                t_cat={t_cat}
              />
            </View>
          </>
        )}
        {/* Footer Section */}
        <PdfText style={styles.footer}>{reportTranslations.footerText}</PdfText>
      </Page>
    </Document>
  )
}

const CategoryStatisticsPDFTable = ({
  data,
  reportTranslations,
  hideTargetColumn = false,
}: {
  data: CategoryStatistics
  reportTranslations: any
  hideTargetColumn?: boolean
}) => (
  <>
    <TableHeader
      headers={
        hideTargetColumn
          ? [reportTranslations.tableHeaders.category, reportTranslations.tableHeaders.effective]
          : [
              reportTranslations.tableHeaders.category,
              reportTranslations.tableHeaders.effective,
              reportTranslations.tableHeaders.target,
            ]
      }
    />
    {data.rows.map((row, index) => (
      <React.Fragment key={index}>
        <View style={styles.tableRow} wrap={false}>
          <PdfText style={[styles.tableCell, styles.firstColumn]}>{row.title}</PdfText>
          <PdfText style={styles.tableCell}>
            {convertMinutesToHoursAndMinutes(row.effectiveDuration)} ({row.effectiveWorkload}%)
          </PdfText>
          {!hideTargetColumn && (
            <PdfText style={styles.tableCell}>
              {convertMinutesToHoursAndMinutes(row.targetDuration)} ({row.targetWorkload}%)
            </PdfText>
          )}
        </View>
        {row.subcategories &&
          row.subcategories.map((subcat, subIndex) => (
            <View style={styles.tableRow} key={`${index}-${subIndex}`} wrap={false}>
              <PdfText style={[styles.tableCell, styles.firstColumn]}>
                {'\u00A0\u00A0\u2022\u00A0'}
                {subcat.title}
              </PdfText>
              <PdfText style={styles.tableCell}>
                {convertMinutesToHoursAndMinutes(subcat.duration)}
              </PdfText>
              {!hideTargetColumn && <PdfText style={styles.tableCell}></PdfText>}
            </View>
          ))}
      </React.Fragment>
    ))}
    <View style={styles.tableRow} wrap={false}>
      <PdfText style={[styles.tableCell, styles.firstColumn]}>
        {reportTranslations.tableHeaders.total}
      </PdfText>
      <PdfText style={styles.tableCell}>
        {convertMinutesToHoursAndMinutes(data.totalEffectiveDuration)}
      </PdfText>
      {!hideTargetColumn && (
        <PdfText style={styles.tableCell}>
          {convertMinutesToHoursAndMinutes(data.totalTargetDuration)}
        </PdfText>
      )}
    </View>
  </>
)

const RemainingCategoryStatisticsPDFTable = ({
  data,
  reportTranslations,
  hideTargetColumn = false,
}: {
  data: RemainingCategoryStatistics
  reportTranslations: any
  hideTargetColumn?: boolean
}) => (
  <>
    <TableHeader
      headers={
        hideTargetColumn
          ? [reportTranslations.tableHeaders.category, reportTranslations.tableHeaders.effective]
          : [
              reportTranslations.tableHeaders.category,
              reportTranslations.tableHeaders.effective,
              reportTranslations.tableHeaders.target,
            ]
      }
    />
    {data.rows.map((row, index) => (
      <View style={styles.tableRow} key={index} wrap={false}>
        <PdfText style={[styles.tableCell, styles.firstColumn]}>{row.title}</PdfText>
        <PdfText style={styles.tableCell}>
          {convertMinutesToHoursAndMinutes(row.effectiveDuration)}
        </PdfText>
        {!hideTargetColumn && (
          <PdfText style={styles.tableCell}>
            {convertMinutesToHoursAndMinutes(row.targetDuration)}
          </PdfText>
        )}
      </View>
    ))}
  </>
)

const RecordsTable = ({
  records,
  categories,
  reportTranslations,
  t_cat,
}: {
  records: TimeRecord[]
  categories: Category[]
  reportTranslations: any
  t_cat: (key: string) => string
}) => {
  return (
    <>
      <RecordsTableHeader
        headers={[
          reportTranslations.tableHeaders.date,
          reportTranslations.tableHeaders.category,
          reportTranslations.tableHeaders.description,
          reportTranslations.tableHeaders.duration,
        ]}
      />
      {records.map((record, index) => {
        const category = findCategory(record, categories)
        return (
          <View style={styles.tableRow} key={index} wrap={false}>
            <PdfText style={styles.recordsTableCellDate}>
              {new Date(record.date).toLocaleDateString()}
            </PdfText>
            <PdfText style={styles.recordsTableCellCategory}>
              {category
                ? category.category_set_title === 'furtherEmployment'
                  ? category.title
                  : t_cat(category.title)
                : record.category_id
                  ? reportTranslations.tableHeaders.otherCanton
                  : reportTranslations.tableHeaders.noCategory}
            </PdfText>
            <PdfText style={styles.recordsTableCellDescription}>{record.description}</PdfText>
            <PdfText style={styles.recordsTableCellDuration}>
              {convertMinutesToHoursAndMinutes(record.duration)}
            </PdfText>
          </View>
        )
      })}
    </>
  )
}

const TableHeader = ({ headers }: { headers: string[] }) => (
  <View style={[styles.tableRow, styles.tableHeaderRow]} fixed>
    {headers.map((header, index) => (
      <PdfText
        key={index}
        style={
          index === 0
            ? [styles.tableCell, styles.firstColumn, styles.tableCellHeader]
            : [styles.tableCell, styles.tableCellHeader]
        }
      >
        {header}
      </PdfText>
    ))}
  </View>
)

const RecordsTableHeader = ({ headers }: { headers: string[] }) => (
  <View style={[styles.tableRow, styles.tableHeaderRow]} fixed>
    <PdfText style={[styles.recordsTableCellDate, styles.recordsTableCellHeader]}>
      {headers[0]}
    </PdfText>
    <PdfText style={[styles.recordsTableCellCategory, styles.recordsTableCellHeader]}>
      {headers[1]}
    </PdfText>
    <PdfText style={[styles.recordsTableCellDescription, styles.recordsTableCellHeader]}>
      {headers[2]}
    </PdfText>
    <PdfText style={[styles.recordsTableCellDuration, styles.recordsTableCellHeader]}>
      {headers[3]}
    </PdfText>
  </View>
)
