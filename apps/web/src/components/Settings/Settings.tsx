import React, { useState, useEffect, useCallback } from 'react'
import {
  Card,
  Stack,
  Text,
  Button,
  Modal,
  Table,
  Group,
  NumberInput,
  ActionIcon,
  SimpleGrid,
  Select,
  SegmentedControl,
} from '@mantine/core'
import { GetStaticPropsContext } from 'next/types'
import { ThemeDropdown } from './ThemeDropdown'
import { CantonPicker } from './CantonPicker'
import LocaleSwitcher from './LocaleSwitcher'
import { useTranslations } from 'next-intl'
import { useDisclosure } from '@mantine/hooks'
import {
  updateUserCustomTarget,
  createUserCustomTarget,
  updateUserData,
  createUserCategory,
  deleteUserCategory,
  updateUserCategory,
} from '@/utils/supabase/user'
import { AppComponentProps } from '@/types/globals'
import { EmploymentCategory, CantonData } from '@/types/globals'
import { ProfileCategoryData } from '@edutime/shared'
import {
  IconCheck,
  IconCircleFilled,
  IconPlus,
  IconTableImport,
  IconTable,
} from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { CategoryModal } from './CategoryModal'
import { ProfileCategoryModal } from './ProfileCategoryModal'
import ImportModal from './ImportModal'
import { getCantonData } from '@/utils/supabase/canton'
import {
  getOrCreateConfigProfile,
  activateCustomMode,
  deactivateCustomMode,
  updateConfigProfile,
  createProfileCategory,
  updateProfileCategory,
  deleteProfileCategory,
} from '@/utils/supabase/config_profiles'
import { useUser } from '@/contexts/UserProvider'
import classes from './Settings.module.css'

const WORK_HOURS_DATA = [
  { age: '21-39', vacationDays: 22, netHours: 1890 },
  { age: '40-49', vacationDays: 25, netHours: 1865 },
  { age: '50-59', vacationDays: 27, netHours: 1848 },
  { age: '60+', vacationDays: 30, netHours: 1823 },
]

export function Settings({ userData, reloadUserData }: AppComponentProps) {
  const [canton, setCanton] = useState(userData.canton_code)
  const [workload, setWorkload] = useState(userData.workload || 0)
  const [customWorkHours, setCustomWorkHours] = useState(userData.custom_work_hours || 0)
  const [educationLevel, setEducationLevel] = useState(userData.education_level || 'kindergarten')
  const [classSize, setClassSize] = useState(userData.class_size || 0)
  const [teacherRelief, setTeacherRelief] = useState<number | null>(userData.teacher_relief ?? null)
  const [cantonData, setCantonData] = useState<CantonData | null>(null)
  const [categoryModalOpened, { open: openCategoryModal, close: closeCategoryModal }] =
    useDisclosure(false)
  const [profileCategoryModalOpened, { open: openProfileCategoryModal, close: closeProfileCategoryModal }] =
    useDisclosure(false)
  const [importModalOpened, { open: openImportModal, close: closeImportModal }] =
    useDisclosure(false)
  const [calculatorModalOpened, { open: openCalculatorModal, close: closeCalculatorModal }] =
    useDisclosure(false)
  const [currentCategory, setCurrentCategory] = useState<EmploymentCategory>({
    title: '',
    subtitle: '',
    color: '',
    workload: 0,
  } as EmploymentCategory)
  const [currentProfileCategory, setCurrentProfileCategory] = useState<ProfileCategoryData | null>(null)
  const [userPercentages, setUserPercentages] = useState<{ [key: number]: number }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCantonData, setIsLoadingCantonData] = useState(false)
  const [customAnnualHours, setCustomAnnualHours] = useState(1930)

  const { configMode, configProfile, profileCategories, refreshUserData: refreshCtx } = useUser()

  const t = useTranslations('Index')
  const t_cat = useTranslations('Categories')

  const formatSwissNumber = (num: number): string => {
    return num.toString()
  }

  const calculateActualWorkload = () => {
    if (!customWorkHours) return 0
    return (customWorkHours * (workload / 100)).toFixed(1)
  }

  const handleWorkHoursSelect = (netHours: number) => {
    setCustomWorkHours(netHours)
    closeCalculatorModal()
  }

  useEffect(() => {
    if (configProfile) {
      setCustomAnnualHours(configProfile.annual_work_hours)
    }
  }, [configProfile])

  const initializeUserPercentages = useCallback((data: CantonData) => {
    const initialPercentages: { [key: number]: number } = {}
    data.category_sets.forEach((categorySet) => {
      initialPercentages[categorySet.id] = categorySet.user_percentage ?? 0
    })
    setUserPercentages(initialPercentages)
  }, [])

  const handleCantonChange = async (value: string | null) => {
    const newCanton = value ?? null
    if (newCanton && newCanton !== canton) {
      setCanton(newCanton)
      setIsLoading(true)
      try {
        const data = await getCantonData(newCanton, userData.user_id)
        if (data) {
          setCantonData(data)
          initializeUserPercentages(data)
        }
      } catch (error) {
        console.error('[Settings] Error loading canton data:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleModeSwitch = async (value: string) => {
    if (value === 'custom' && configMode !== 'custom') {
      setIsLoading(true)
      try {
        const profile = await getOrCreateConfigProfile(userData.user_id)
        await activateCustomMode(userData.user_id, profile.id)
        await reloadUserData()
        await refreshCtx()
      } catch (error) {
        console.error('[Settings] Error activating custom mode:', error)
      } finally {
        setIsLoading(false)
      }
    } else if (value === 'default' && configMode === 'custom') {
      setIsLoading(true)
      try {
        await deactivateCustomMode(userData.user_id)
        await reloadUserData()
        await refreshCtx()
      } catch (error) {
        console.error('[Settings] Error deactivating custom mode:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const loadCantonData = useCallback(async () => {
    if (!canton || !userData?.user_id) {
      setCantonData(null)
      return
    }
    setIsLoadingCantonData(true)
    let retryCount = 0
    const maxRetries = 3
    while (retryCount <= maxRetries) {
      try {
        const data = await getCantonData(canton, userData.user_id)
        if (data) {
          setCantonData(data)
          initializeUserPercentages(data)
          setIsLoadingCantonData(false)
          return
        } else {
          if (retryCount < maxRetries) {
            retryCount++
            await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount))
            continue
          }
          setCantonData(null)
          setIsLoadingCantonData(false)
          return
        }
      } catch (error) {
        console.error('[Settings] Error loading canton data in useEffect:', error)
        if (retryCount < maxRetries) {
          retryCount++
          await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount))
          continue
        }
        setCantonData(null)
        setIsLoadingCantonData(false)
        return
      }
    }
  }, [canton, userData.user_id, initializeUserPercentages])

  useEffect(() => {
    loadCantonData()
  }, [loadCantonData, canton, userData.user_id])

  useEffect(() => {
    if (userData.canton_code && userData.canton_code !== canton) {
      setCanton(userData.canton_code)
    }
  }, [userData.canton_code, canton])

  const handlePercentageChange = useCallback((categorySetId: number, value: number | null) => {
    setUserPercentages((prev) => ({
      ...prev,
      [categorySetId]: value ?? 0,
    }))
  }, [])

  const saveConfigurablePercentages = useCallback(async () => {
    try {
      for (const [categorySetId, userPercentage] of Object.entries(userPercentages)) {
        const existingCategorySet = cantonData?.category_sets.find(
          (cs) => cs.id === Number(categorySetId),
        )
        if (
          existingCategorySet &&
          existingCategorySet.user_percentage !== null &&
          existingCategorySet.user_percentage_id !== null
        ) {
          await updateUserCustomTarget(existingCategorySet.user_percentage_id, userPercentage)
        } else {
          await createUserCustomTarget(userData.user_id, Number(categorySetId), userPercentage)
        }
      }
    } catch (error) {
      console.error('Error saving percentages:', error)
      notifications.show({
        title: t('error'),
        message: t('error_saving_percentages'),
        color: 'red',
      })
    }
  }, [userPercentages, cantonData, userData.user_id, t])

  const saveCantonAndWorkload = useCallback(async () => {
    try {
      const data: Record<string, unknown> = { canton_code: canton, workload: workload, class_size: classSize }
      if (cantonData?.use_custom_work_hours) {
        data.custom_work_hours = customWorkHours
      }
      if (canton === 'TG_S') {
        data.education_level = educationLevel
        data.teacher_relief = teacherRelief
      }
      await updateUserData(data, userData.user_id)
    } catch (error) {
      console.error('Error saving settings:', error)
      notifications.show({ title: t('error'), message: t('error_saving_settings'), color: 'red' })
    }
  }, [
    canton,
    workload,
    classSize,
    customWorkHours,
    educationLevel,
    teacherRelief,
    cantonData?.use_custom_work_hours,
    userData.user_id,
    t,
  ])

  const handleSave = useCallback(async () => {
    setIsLoading(true)

    const calculateTotalPercentage = () => {
      const total = Object.values(userPercentages).reduce((sum, val) => {
        return Math.round((sum + val) * 100) / 100
      }, 0)
      return total
    }

    try {
      if (configMode === 'custom') {
        if (configProfile) {
          await updateConfigProfile(configProfile.id, { annual_work_hours: customAnnualHours })
        }
        await updateUserData({ workload }, userData.user_id)
        notifications.show({
          title: t('success'),
          message: t('saved'),
          color: 'green',
          icon: <IconCheck />,
        })
        await reloadUserData()
        await refreshCtx()
      } else {
        if (cantonData?.is_configurable) {
          const totalPercentage = calculateTotalPercentage()
          if (Math.abs(totalPercentage - 100) > 0.01) {
            notifications.show({
              title: t('error'),
              message: t('percentages_must_sum_to_100'),
              color: 'red',
            })
            setIsLoading(false)
            return
          }
        }
        await saveCantonAndWorkload()
        if (cantonData?.is_configurable) {
          await saveConfigurablePercentages()
        }
        notifications.show({
          title: t('success'),
          message: t('saved'),
          color: 'green',
          icon: <IconCheck />,
        })
        await reloadUserData()
      }
    } catch (error) {
      console.error('Error during save:', error)
      notifications.show({ title: t('error'), message: t('error_saving_settings'), color: 'red' })
    } finally {
      setIsLoading(false)
    }
  }, [
    configMode,
    configProfile,
    customAnnualHours,
    workload,
    saveCantonAndWorkload,
    saveConfigurablePercentages,
    reloadUserData,
    refreshCtx,
    cantonData?.is_configurable,
    userPercentages,
    userData.user_id,
    t,
  ])

  const handleCreateCategory = () => {
    setCurrentCategory({ title: '', subtitle: '', color: '', workload: 0 } as EmploymentCategory)
    openCategoryModal()
  }

  const handleEditCategory = (category: EmploymentCategory) => {
    setCurrentCategory(category)
    openCategoryModal()
  }

  const handleSaveCategory = async (category: EmploymentCategory) => {
    if (category.id) {
      await updateUserCategory(category.id, category)
    } else {
      await createUserCategory(userData.user_id, category)
    }
    closeCategoryModal()
    reloadUserData()
  }

  const handleDeleteCategory = async (categoryId: number) => {
    await deleteUserCategory(categoryId)
    closeCategoryModal()
    reloadUserData()
  }

  const handleCreateProfileCategory = () => {
    setCurrentProfileCategory(null)
    openProfileCategoryModal()
  }

  const handleEditProfileCategory = (category: ProfileCategoryData) => {
    setCurrentProfileCategory(category)
    openProfileCategoryModal()
  }

  const handleSaveProfileCategory = async (category: ProfileCategoryData) => {
    if (!configProfile) return
    try {
      if (currentProfileCategory) {
        await updateProfileCategory(currentProfileCategory.id, {
          title: category.title,
          subtitle: category.subtitle,
          color: category.color,
          weight: category.weight,
        })
      } else {
        await createProfileCategory(userData.user_id, configProfile.id, {
          title: category.title,
          subtitle: category.subtitle,
          color: category.color,
          weight: category.weight,
        })
      }
      closeProfileCategoryModal()
      await reloadUserData()
      await refreshCtx()
    } catch (error) {
      console.error('Error saving profile category:', error)
    }
  }

  const handleDeleteProfileCategory = async (id: string) => {
    try {
      await deleteProfileCategory(id)
      closeProfileCategoryModal()
      await reloadUserData()
      await refreshCtx()
    } catch (error) {
      console.error('Error deleting profile category:', error)
    }
  }

  const totalProfileWeight = profileCategories.reduce((sum, cat) => sum + cat.weight, 0)

  return (
    <>
      <Stack className={classes.wrapper} p={'lg'}>
        <Card radius='md' withBorder>
          <Stack gap='sm'>
            <Text size='xl'>{t('view')}</Text>
            <ThemeDropdown userData={userData} refreshUserData={reloadUserData} />
          </Stack>
        </Card>

        <Card radius='md' withBorder>
          <Stack gap='sm'>
            <Text size='xl'>{t('employment')}</Text>

            <SegmentedControl
              value={configMode}
              onChange={handleModeSwitch}
              data={[
                { label: t('cantonMode'), value: 'default' },
                { label: t('customMode'), value: 'custom' },
              ]}
              disabled={isLoading}
            />

            <div className={classes.employmentCardContent}>
              <div className={classes.inputsGrid}>
                <NumberInput
                  value={workload}
                  onChange={(value) => setWorkload(typeof value === 'number' ? value : 0)}
                  placeholder={t('workload')}
                  min={0}
                  max={500}
                  decimalScale={2}
                  label={t('workload')}
                  size='md'
                />

                {configMode === 'custom' && (
                  <NumberInput
                    value={customAnnualHours}
                    onChange={(value) => setCustomAnnualHours(typeof value === 'number' ? value : 1930)}
                    placeholder={t('annualWorkHours')}
                    min={0}
                    max={10000}
                    decimalScale={0}
                    label={t('annualWorkHours')}
                    size='md'
                  />
                )}

                {configMode === 'default' && canton === 'TG_S' && (
                  <NumberInput
                    value={classSize}
                    onChange={(value) => setClassSize(typeof value === 'number' ? value : 0)}
                    placeholder={t('class_size')}
                    min={0}
                    max={50}
                    decimalScale={0}
                    label={t('class_size')}
                    size='md'
                  />
                )}

                {configMode === 'default' && canton === 'TG_S' && (
                  <Select
                    value={educationLevel}
                    onChange={(value) => setEducationLevel(value as string)}
                    placeholder={t('education_level_placeholder')}
                    label={t('education_level')}
                    size='md'
                    data={[
                      { value: 'kindergarten', label: t('kindergarten') },
                      { value: 'foundation_stage', label: t('foundation_stage') },
                      { value: 'lower_primary', label: t('lower_primary') },
                      { value: 'grade_3_4', label: t('grade_3_4') },
                      { value: 'middle_primary', label: t('middle_primary') },
                      { value: 'lower_secondary', label: t('lower_secondary') },
                      { value: 'special_class', label: t('special_class') },
                      { value: 'special_school', label: t('special_school') },
                      { value: 'vocational_school', label: t('vocational_school') },
                      { value: 'upper_secondary', label: t('upper_secondary') },
                    ]}
                  />
                )}
              </div>

              {configMode === 'default' && (
                <div className={classes.cantonPickerWrapper}>
                  <CantonPicker canton={canton} setCanton={handleCantonChange} required={false} />
                </div>
              )}

              {configMode === 'default' && cantonData && (
                <Card radius='md' withBorder style={{ gridColumn: '1 / -1' }}>
                  <Stack gap='sm' p='lg'>
                    {cantonData.title && (
                      <Text size='lg' fw={500}>
                        {cantonData.title}
                      </Text>
                    )}
                    <Stack gap='md'>
                      {cantonData.annual_work_hours != null &&
                        cantonData.annual_work_hours > 0 &&
                        !cantonData.use_custom_work_hours &&
                        !cantonData.is_working_hours_disabled && (
                          <Text size='sm' c='dimmed'>
                            {t('annual_work_hours')}:{' '}
                            {formatSwissNumber(cantonData.annual_work_hours)} {t('hours')}
                          </Text>
                        )}
                      {cantonData.use_custom_work_hours && (
                        <NumberInput
                          value={customWorkHours}
                          onChange={(value) =>
                            setCustomWorkHours(typeof value === 'number' ? value : 0)
                          }
                          placeholder={t('custom_work_hours')}
                          min={0}
                          max={10000}
                          decimalScale={2}
                          label={t('custom_work_hours')}
                          size='md'
                          rightSection={
                            <ActionIcon
                              onClick={openCalculatorModal}
                              variant='subtle'
                              style={{ marginRight: 'var(--mantine-spacing-xs)' }}
                            >
                              <IconTable size='1rem' />
                            </ActionIcon>
                          }
                          rightSectionWidth={40}
                        />
                      )}
                      {cantonData.use_custom_work_hours && (
                        <Text size='sm' c='dimmed'>
                          {t('actual_workload')}: {calculateActualWorkload()} {t('hours')}
                        </Text>
                      )}
                      {cantonData.is_configurable && (
                        <div className={classes.flexRow}>
                          {cantonData.category_sets.map((categorySet) => (
                            <NumberInput
                              key={categorySet.id}
                              label={t_cat(categorySet.title)}
                              placeholder={
                                categorySet.min_target_percentage ||
                                categorySet.max_target_percentage
                                  ? `${
                                      categorySet.min_target_percentage
                                        ? `${categorySet.min_target_percentage}% - `
                                        : ''
                                    }${
                                      categorySet.max_target_percentage
                                        ? `${categorySet.max_target_percentage}%`
                                        : ''
                                    }`
                                  : ''
                              }
                              value={userPercentages[categorySet.id] ?? 0}
                              onChange={(value) =>
                                handlePercentageChange(categorySet.id, Number(value))
                              }
                              min={0}
                              max={100}
                              decimalScale={2}
                              size='md'
                              className={classes.flexItem}
                            />
                          ))}
                        </div>
                      )}
                    </Stack>
                  </Stack>
                </Card>
              )}

              {configMode === 'custom' && (
                <Card radius='md' withBorder style={{ gridColumn: '1 / -1' }}>
                  <Stack gap='sm' p='lg'>
                    <Group justify='space-between'>
                      <Text size='lg' fw={500}>{t('customCategories')}</Text>
                      <Text size='sm' c={Math.abs(totalProfileWeight - 100) > 0.01 ? 'orange' : 'dimmed'}>
                        {totalProfileWeight.toFixed(0)}%
                      </Text>
                    </Group>

                    {profileCategories.length > 0 && (
                      <Table.ScrollContainer minWidth={400}>
                        <Table
                          striped
                          highlightOnHover
                          withColumnBorders
                          withTableBorder
                          horizontalSpacing='md'
                          verticalSpacing='sm'
                        >
                          <Table.Thead>
                            <Table.Tr>
                              <Table.Th w='40%'>{t('Title')}</Table.Th>
                              <Table.Th w='30%'>{t('subtitle')}</Table.Th>
                              <Table.Th w='10%'>{t('color')}</Table.Th>
                              <Table.Th w='20%'>{t('weight')}</Table.Th>
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>
                            {profileCategories.map((category) => (
                              <Table.Tr
                                key={category.id}
                                onClick={() => handleEditProfileCategory(category)}
                                style={{ cursor: 'pointer' }}
                              >
                                <Table.Td>{category.title}</Table.Td>
                                <Table.Td>{category.subtitle}</Table.Td>
                                <Table.Td>
                                  <IconCircleFilled
                                    style={{ color: category.color ?? undefined, width: 16, opacity: 0.5 }}
                                  />
                                </Table.Td>
                                <Table.Td>{category.weight}%</Table.Td>
                              </Table.Tr>
                            ))}
                          </Table.Tbody>
                        </Table>
                      </Table.ScrollContainer>
                    )}

                    <Group justify='flex-start'>
                      <Button onClick={handleCreateProfileCategory} leftSection={<IconPlus />}>
                        {t('createCategory')}
                      </Button>
                    </Group>
                  </Stack>
                </Card>
              )}

              <div className={classes.saveButtonWrapper}>
                <Group justify='flex-start'>
                  <Button onClick={handleSave} disabled={isLoading}>
                    {t('save')}
                  </Button>
                </Group>
              </div>
            </div>
          </Stack>
        </Card>

        {configMode === 'default' && (
          <Card radius='md' withBorder>
            <Stack gap='sm'>
              <Text size='xl'>{t('additionalCategories')}</Text>

              {userData.user_categories.length > 0 && (
                <Table.ScrollContainer minWidth={500}>
                  <Table
                    striped
                    highlightOnHover
                    withColumnBorders
                    withTableBorder
                    horizontalSpacing='md'
                    verticalSpacing='sm'
                  >
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th w='40%'>{t('Title')}</Table.Th>
                        <Table.Th w='40%'>{t('subtitle')}</Table.Th>
                        <Table.Th w='10%'>{t('color')}</Table.Th>
                        <Table.Th w='10%'>{t('workload')}</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {userData.user_categories.map((category) => (
                        <Table.Tr
                          key={category.id}
                          onClick={() => handleEditCategory(category)}
                          style={{ cursor: 'pointer' }}
                        >
                          <Table.Td>{category.title}</Table.Td>
                          <Table.Td>{category.subtitle}</Table.Td>
                          <Table.Td>
                            <IconCircleFilled
                              style={{ color: category.color ?? undefined, width: 16, opacity: 0.5 }}
                            />
                          </Table.Td>
                          <Table.Td>{category.workload}%</Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              )}
              <Group justify='flex-start'>
                <Button onClick={handleCreateCategory} leftSection={<IconPlus />}>
                  {t('createCategory')}
                </Button>
              </Group>
            </Stack>
          </Card>
        )}
        {configMode === 'default' && canton === 'BE' && (
          <Card radius='md' withBorder>
            <Stack gap='sm'>
              <Text size='xl'>{t('importData')}</Text>
              <Text>{t('importDataInfo')}</Text>
              <Group justify='flex-start'>
                <Button onClick={openImportModal} leftSection={<IconTableImport />}>
                  {t('startImport')}
                </Button>
              </Group>
            </Stack>
          </Card>
        )}
      </Stack>

      <CategoryModal
        category={currentCategory}
        onSave={handleSaveCategory}
        onDelete={handleDeleteCategory}
        onClose={closeCategoryModal}
        opened={categoryModalOpened}
      />
      <ProfileCategoryModal
        category={currentProfileCategory}
        onSave={handleSaveProfileCategory}
        onDelete={currentProfileCategory ? () => handleDeleteProfileCategory(currentProfileCategory.id) : undefined}
        onClose={closeProfileCategoryModal}
        opened={profileCategoryModalOpened}
      />
      <ImportModal
        onClose={closeImportModal}
        opened={importModalOpened}
        userData={userData}
        reloadUserData={reloadUserData}
      />
      <Modal
        opened={calculatorModalOpened}
        onClose={closeCalculatorModal}
        title={t('professional-mission')}
        size='lg'
      >
        <SimpleGrid cols={2} spacing='sm'>
          {WORK_HOURS_DATA.map((data) => (
            <Card
              key={data.age}
              p='lg'
              radius='md'
              withBorder
              className={classes.workHoursCard}
              onClick={() => handleWorkHoursSelect(data.netHours)}
            >
              <Text fw={500} size='lg' mb={4}>
                {t('age')}: {data.age}
              </Text>
              <Text size='sm' c='dimmed' mb={4}>
                {t('vacation_days')}: {data.vacationDays}
              </Text>
              <Text size='sm'>
                {t('net_work_hours')}: {data.netHours}
              </Text>
            </Card>
          ))}
        </SimpleGrid>
      </Modal>
    </>
  )
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return { props: { messages: (await import(`../../../messages/${locale}.json`)).default } }
}
