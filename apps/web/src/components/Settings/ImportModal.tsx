import React, { useRef, useState } from 'react'
import {
  Stack,
  Modal,
  Text,
  Button,
  Alert,
  Table,
  Checkbox,
  Group,
  Tooltip,
  Pagination,
  rem,
  useMantineTheme,
  ScrollArea,
  Card,
} from '@mantine/core'
import { useTranslations } from 'next-intl'
import { createUserCategory, getUserCategories } from '@/utils/supabase/user'
import { Dropzone, MIME_TYPES } from '@mantine/dropzone'
import { IconCloudUpload, IconX, IconDownload, IconAlertTriangle } from '@tabler/icons-react'
import { convertToMinutes } from '@/functions/helpers'
import { ImportCategory, mapActivityToCategory } from '@/functions/import'
import { insertRecords } from '@/utils/supabase/records'
import { getIsoDate } from '@/functions/helpers'
import { EmploymentCategory, TimeRecord, UserData } from '@/types/globals'
import { notifications } from '@mantine/notifications'
import Papa from 'papaparse'

interface ImportEntry {
  date: Date
  duration: number
  category: ImportCategory | null
  description: string
  selected: boolean
}

interface ImportModalProps {
  onClose: () => void
  opened: boolean
  userData: UserData
  reloadUserData: () => void
}

const ImportModal: React.FC<ImportModalProps> = ({ onClose, opened, userData, reloadUserData }) => {
  const t = useTranslations('Index')
  const t_cat = useTranslations('Categories')
  const theme = useMantineTheme()
  const [entries, setEntries] = useState<ImportEntry[]>([])
  const [showDropzone, setShowDropzone] = useState(true)
  const openRef = useRef<() => void>(null)
  const [modalSize, setModalSize] = useState<'md' | 'xl'>('md') // State for modal size
  const [activePage, setActivePage] = useState(1)
  const itemsPerPage = 10
  const [newCategories, setNewCategories] = useState<ImportCategory[]>([])
  const [isCreatingEntries, setIsCreatingEntries] = useState(false)
  const totalPages = Math.ceil(entries.length / itemsPerPage)

  const handleFileDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    const reader = new FileReader()

    reader.onload = (event) => {
      if (!event.target?.result) {
        return
      }
      const content = event.target.result as string

      // Use PapaParse to parse the CSV
      const parsedData = Papa.parse<string[]>(content, {
        header: false, // Set to false to get rows as arrays
        skipEmptyLines: true,
        dynamicTyping: true, // Automatically type data (convert numbers, etc.)
      })

      const rows = parsedData.data as Array<Array<string | null>> // Array of arrays

      // Define indices for each field
      const INDEX_ENTRY = 0 // Eintrag
      const INDEX_REMARK = 1 // Bemerkung
      const INDEX_CATEGORY = 2 // Kategorie
      const INDEX_DURATION = 3 // Dauer
      const INDEX_DATE = 4 // Datum

      const parsedEntries = rows
        // Skip all rows that do not start with a number in the Datum index
        .filter((row) => /^\d/.test(row[INDEX_DATE] || ''))
        .map((row) => {
          const description = row[INDEX_REMARK] || '' // Default to empty string if null
          const category = row[INDEX_CATEGORY] || '' // Default to empty string if null
          const duration = row[INDEX_DURATION] || '' // Handle duration similarly if needed
          const date = row[INDEX_DATE] || '' // Handle date similarly if needed

          // Convert duration to minutes
          const durationInMinutes = convertToMinutes(duration)
          const mappedCategory = mapActivityToCategory(category, userData.user_categories)

          // Convert date string to Date object (dd.mm.yyyy)
          const [day, month, year] = date.split('.')
          const dateObj = new Date(`${year}-${month}-${day}`)

          if (
            mappedCategory &&
            !mappedCategory.id &&
            !newCategories.some((c) => c.title === mappedCategory.title)
          ) {
            setNewCategories([...newCategories, mappedCategory])
          }

          return {
            description,
            category: mappedCategory,
            duration: durationInMinutes,
            date: dateObj,
            selected: true,
          }
        })

      setEntries(parsedEntries)
      setShowDropzone(false) // Hide Dropzone after successful file parse
      setModalSize('xl') // Set modal size to xl after CSV file is loaded
    }

    reader.readAsText(file)
  }

  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0') // getMonth() returns 0-based month
    const year = date.getFullYear()

    return `${day}.${month}.${year}`
  }

  const handleCloseModal = () => {
    onClose()
    setEntries([]) // Clear entries when closing modal
    setNewCategories([]) // Clear new categories when closing modal
    setShowDropzone(true) // Reset Dropzone visibility on modal close
    setActivePage(1) // Reset active page to 1
    setModalSize('md') // Reset modal size to md when modal closes
  }

  const handleToggleEntry = (index: number) => {
    const pageIndex = (activePage - 1) * itemsPerPage + index
    const updatedEntries = [...entries]
    updatedEntries[pageIndex].selected = !updatedEntries[pageIndex].selected
    setEntries(updatedEntries)
  }

  const createMissingCategories = async (
    selectedEntries: ImportEntry[],
  ): Promise<{ [title: string]: number }> => {
    const newCategories = selectedEntries
      .filter(
        (entry) => entry.category && entry.category.id === null && entry.category.is_user_category,
      )
      .map(
        (entry) =>
          ({
            title: (entry.category as ImportCategory).title,
            subtitle: '',
            color: theme.colors.green[6], // Use theme green color for new categories
            workload: 20,
          }) as EmploymentCategory,
      )

    const uniqueCategories = Array.from(
      new Set(newCategories.map((category) => category.title)),
    ).map(
      (title) => newCategories.find((category) => category.title === title) as EmploymentCategory,
    )

    const createdCategories = await Promise.all(
      uniqueCategories.map((category) => createUserCategory(userData.user_id, category)),
    )

    const categoryMapping: { [title: string]: number } = {}
    createdCategories.forEach((category) => {
      if (category) {
        categoryMapping[category.title] = category.id
      }
    })

    notifications.show({
      title: t('success'),
      message: t('missingCategoriesCreated'),
      color: 'green',
    })

    return categoryMapping
  }

  const handleCreateEntries = async () => {
    setIsCreatingEntries(true)
    try {
      // Filter selected entries
      const selectedEntries = entries.filter((entry) => entry.selected)

      // Create missing categories
      let userCategories: EmploymentCategory[] = []

      if (newCategories.length > 0) {
        await createMissingCategories(selectedEntries)
        userCategories = await getUserCategories(userData.user_id)
      }

      const records: TimeRecord[] = selectedEntries.map((entry) => {
        let category_id: number | null = null
        let user_category_id: number | null = null
        let is_user_category = false

        if (entry.category) {
          if (entry.category.is_user_category) {
            if (entry.category.id !== null) {
              category_id = null
              user_category_id = entry.category.id
            } else {
              const userCategory = userCategories.find((cat) => cat.title === entry.category?.title)
              if (userCategory) {
                user_category_id = userCategory.id
              }
            }
            is_user_category = true
          } else {
            category_id = entry.category.id
            user_category_id = null
            is_user_category = false
          }
        }

        return {
          date: getIsoDate(entry.date),
          duration: entry.duration,
          description: entry.description,
          start_time: null,
          end_time: null,
          category_id,
          is_user_category,
          user_category_id,
        }
      })

      // Insert records
      await insertRecords(records)

      await reloadUserData()

      notifications.show({
        title: t('success'),
        message: t('entriesCreated'),
        color: 'green',
      })

      // Close modal
      handleCloseModal()
    } catch (error) {
      console.error('Error creating entries:', error)
      notifications.show({
        title: t('error'),
        message: t('entriesCreateFailed') || 'Fehler beim Erstellen der Einträge',
        color: 'red',
      })
    } finally {
      setIsCreatingEntries(false)
    }
  }

  const toggleAll = () =>
    setEntries(
      entries.map((entry) => ({ ...entry, selected: !entries.every((entry) => entry.selected) })),
    )

  const paginatedEntries = entries.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage)

  return (
    <Modal
      opened={opened}
      onClose={handleCloseModal}
      title={t('importData')}
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
      <Stack gap='md'>
        {showDropzone ? (
          <Stack gap='md'>
            <Dropzone
              openRef={openRef}
              onDrop={handleFileDrop}
              accept={[MIME_TYPES.csv]}
              maxSize={30 * 1024 ** 2}
            >
              <Group justify='center' gap='xl' mih={220} style={{ pointerEvents: 'none' }}>
                <Dropzone.Accept>
                  <IconDownload size={52} stroke={1.5} />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX size={52} stroke={1.5} />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconCloudUpload size={52} stroke={1.5} />
                </Dropzone.Idle>

                <div>
                  <Text size='xl' inline>
                    <Dropzone.Accept>{t('uploadFile')}</Dropzone.Accept>
                    <Dropzone.Reject>{t('uploadReject')}</Dropzone.Reject>
                    <Dropzone.Idle>{t('importData')}</Dropzone.Idle>
                  </Text>
                  <Text size='sm' c='dimmed' inline mt={7}>
                    {t('dropHere')}
                  </Text>
                </div>
              </Group>
            </Dropzone>
            <Group justify='center'>
              <Button onClick={() => openRef.current?.()} variant='light'>
                {t('selectFile')}
              </Button>
            </Group>
          </Stack>
        ) : (
          <>
            {newCategories.length > 0 && (
              <Alert
                variant='light'
                color='orange'
                title={t('categoryNotYetExists')}
                icon={<IconAlertTriangle />}
              >
                {t('categoryNotYetExistsInfo')}
              </Alert>
            )}
            <Card padding={0} withBorder radius='md'>
              <ScrollArea>
                <Table
                  horizontalSpacing='sm'
                  verticalSpacing={4}
                  miw={700}
                  striped
                  highlightOnHover
                >
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ width: rem(40) }}>
                        <Checkbox
                          checked={entries.length > 0 && entries.every((entry) => entry.selected)}
                          indeterminate={
                            entries.some((entry) => entry.selected) &&
                            !entries.every((entry) => entry.selected)
                          }
                          onChange={toggleAll}
                          size='xs'
                        />
                      </Table.Th>
                      <Table.Th>{t('date')}</Table.Th>
                      <Table.Th>{t('duration')}</Table.Th>
                      <Table.Th>{t('category')}</Table.Th>
                      <Table.Th>{t('description')}</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {paginatedEntries.map((entry, index) => (
                      <Table.Tr key={index}>
                        <Table.Td>
                          <Checkbox
                            checked={entry.selected}
                            onChange={() => handleToggleEntry(index)}
                            size='xs'
                          />
                        </Table.Td>
                        <Table.Td>{formatDate(entry.date)}</Table.Td>
                        <Table.Td>{entry.duration}</Table.Td>
                        <Table.Td>
                          {entry.category && (
                            <Group gap='xs'>
                              <Text size='sm'>
                                {entry.category.is_user_category
                                  ? entry.category.title
                                  : t_cat(entry.category.title)}
                              </Text>
                              {!entry.category.id && (
                                <Tooltip label={t('categoryNotYetExists')}>
                                  <IconAlertTriangle size={16} color='orange' />
                                </Tooltip>
                              )}
                            </Group>
                          )}
                        </Table.Td>
                        <Table.Td>
                          <Text size='sm'>{entry.description}</Text>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            </Card>
            <Group justify='center'>
              <Pagination value={activePage} onChange={setActivePage} total={totalPages} />
            </Group>
            <Group justify='flex-end' mt='md'>
              <Button onClick={handleCloseModal} variant='default' disabled={isCreatingEntries}>
                {t('cancel')}
              </Button>
              <Button
                onClick={handleCreateEntries}
                disabled={!entries.some((entry) => entry.selected) || isCreatingEntries}
                variant='filled'
                loading={isCreatingEntries}
              >
                {entries.filter((entry) => entry.selected).length} {t('createEntries')}
              </Button>
            </Group>
          </>
        )}
      </Stack>
    </Modal>
  )
}

export default ImportModal
