import {
  CategoryStatisticsProps,
  RemainingCategoryStatisticsProps,
} from '@/components/Statistics/CategoryStatsTable'
import { supabase } from './client'
import { getIsoDate } from '@/functions/helpers'
import {
  Category,
  EmploymentCategory,
  CategoryStatistic,
  CantonData,
  UserData,
} from '@/types/globals'
import { ConfigProfileData, ProfileCategoryData } from '@edutime/shared'
import { getUserCategories } from './user'
import { findCategory } from './categories'

interface CategoryStatistics {
  rows: CategoryStatisticsProps[]
  noCategoryDuration: number
  totalEffectiveDuration: number
  totalTargetDuration: number
}

const calculateRequiredHours = (
  annualWorkHours: number,
  percentage: number,
  startDate: Date,
  endDate: Date,
  workload: number,
  cantonData: CantonData,
  userData: UserData,
): number => {
  const isLeapYear = (year: number) => new Date(year, 1, 29).getMonth() === 1
  const daysInYear = isLeapYear(endDate.getFullYear()) ? 366 : 365
  const workingDays = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24) + 1

  let effectiveAnnualHours = annualWorkHours
  if (cantonData.use_custom_work_hours && userData.custom_work_hours) {
    effectiveAnnualHours = userData.custom_work_hours
  }

  const adjustedAnnualWorkMinutes = ((effectiveAnnualHours * 60) / daysInYear) * workingDays
  return Math.round(adjustedAnnualWorkMinutes * (percentage / 100) * (workload / 100))
}

const aggregateStatistics = (data: any[]): { [key: string]: CategoryStatistic } => {
  return data.reduce((acc: { [key: string]: CategoryStatistic }, record) => {
    const key = record.is_user_category
      ? `user_cat_${record.user_category_id}`
      : `cat_${record.category_id}`
    if (!acc[key]) {
      acc[key] = {
        duration: 0,
        is_user_category: record.is_user_category,
        category_id: record.category_id,
        user_category_id: record.user_category_id,
        user_category_workload: null,
      }
    }
    acc[key].duration += record.duration
    return acc
  }, {})
}

const fetchCategoryStatistics = async (
  startISO: string,
  endISO: string,
  user_id: string,
): Promise<any[]> => {
  const { data, error } = await supabase
    .from('records')
    .select('category_id, duration, user_category_id, is_user_category, profile_category_id')
    .gte('date', startISO)
    .lte('date', endISO)
    .eq('user_id', user_id)

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

const fetchUserCategoryWorkloads = async (
  userCategoryIds: (number | null)[],
  user_id: string,
): Promise<{ [key: number]: number }> => {
  const validIds = userCategoryIds.filter((id): id is number => id !== null)

  const { data: userCategories, error } = await supabase
    .from('user_categories')
    .select('id, workload')
    .in('id', validIds)
    .eq('user_id', user_id)

  if (error) {
    throw new Error(error.message)
  }

  return (userCategories || []).reduce((acc: { [key: number]: number }, userCategory) => {
    acc[userCategory.id] = userCategory.workload
    return acc
  }, {})
}

const applyWorkloadsToStatistics = (
  aggregation: { [key: string]: CategoryStatistic },
  workloadMap: { [key: number]: number },
) => {
  Object.values(aggregation).forEach((stat) => {
    if (stat.is_user_category && stat.user_category_id !== null) {
      stat.user_category_workload = workloadMap[stat.user_category_id] || null
    }
  })
}

const groupCategoriesBySetTitle = (categories: Category[]): { [key: string]: Category[] } => {
  try {
    if (!categories || categories.length === 0 || !Array.isArray(categories)) return {}
    return categories.reduce(
      (acc, category) => {
        if (
          category &&
          category.category_set_title &&
          category.category_set_title !== 'furtherEmployment'
        ) {
          if (!acc[category.category_set_title]) {
            acc[category.category_set_title] = []
          }
          acc[category.category_set_title].push(category)
        }
        return acc
      },
      {} as { [key: string]: Category[] },
    )
  } catch (error) {
    console.error('Error in groupCategoriesBySetTitle:', error)
    return {}
  }
}

const calculateEffectiveWorkload = (
  effectiveDuration: number,
  totalEffectiveDuration: number,
): string => {
  // Handle case when totalEffectiveDuration is 0 to prevent NaN
  if (totalEffectiveDuration === 0) {
    return '0.00'
  }
  // Ensure the return type is string as required by CategoryStatisticsProps
  const percentage = (effectiveDuration / totalEffectiveDuration) * 100
  return percentage.toFixed(2) // returns as string
}

export const getCategoryStatisticsData = async (
  start: Date,
  end: Date,
  user_id: string,
  categories: Category[],
  cantonData: CantonData,
  userData: UserData,
  t_cat: (key: string) => string,
): Promise<CategoryStatistics> => {
  const startISO = getIsoDate(start)
  const endISO = getIsoDate(end)
  const data = await fetchCategoryStatistics(startISO, endISO, user_id)
  const aggregation = aggregateStatistics(data)

  const userCategoryIds = Object.values(aggregation)
    .filter((stat) => stat.is_user_category && stat.user_category_id !== null)
    .map((stat) => stat.user_category_id)

  if (userCategoryIds.length > 0) {
    const workloadMap = await fetchUserCategoryWorkloads(userCategoryIds, user_id)
    applyWorkloadsToStatistics(aggregation, workloadMap)
  }

  const groupedCategories = groupCategoriesBySetTitle(categories || [])

  const rows = Object.entries(groupedCategories || {}).map(([setTitle, categoryGroup]) => {
    const setTotalDuration = (categoryGroup || []).reduce((sum, category) => {
      const duration =
        aggregation[`cat_${category.id}`]?.duration ||
        aggregation[`user_cat_${category.id}`]?.duration ||
        0
      return sum + duration
    }, 0)

    const categorySet = cantonData.category_sets.find((set) => set.title === setTitle)
    const percentage = cantonData.is_configurable
      ? (categorySet?.user_percentage ?? categorySet?.percentage ?? 0)
      : (categorySet?.percentage ?? 0)

    const targetDuration = calculateRequiredHours(
      cantonData.annual_work_hours,
      percentage,
      start,
      end,
      userData.workload,
      cantonData,
      userData,
    )

    const targetWorkload = percentage.toString()

    return {
      title: t_cat(setTitle),
      effectiveDuration: setTotalDuration,
      targetDuration,
      effectiveWorkload: '0', // Placeholder for now, will be calculated later
      targetWorkload,
      color: categoryGroup[0]?.color,
      subcategories: cantonData.has_subcategories
        ? (categoryGroup || []).map((category) => ({
            title: t_cat(category.title),
            duration:
              aggregation[`cat_${category.id}`]?.duration ||
              aggregation[`user_cat_${category.id}`]?.duration ||
              0,
          }))
        : [],
    }
  })

  const totalEffectiveDuration = rows.reduce((sum, row) => sum + row.effectiveDuration, 0)
  const totalTargetDuration = rows.reduce((sum, row) => sum + row.targetDuration, 0)

  // Update effective workload for each row now that totalEffectiveDuration is available
  rows.forEach((row) => {
    row.effectiveWorkload = calculateEffectiveWorkload(
      row.effectiveDuration,
      totalEffectiveDuration,
    )
  })

  return {
    rows,
    noCategoryDuration: 0, // Placeholder, adjust as needed
    totalEffectiveDuration,
    totalTargetDuration,
  }
}

interface RemainingCategoryStatistics {
  rows: RemainingCategoryStatisticsProps[]
}

export const getRemainingCategoryStatisticsData = async (
  start: Date,
  end: Date,
  user_id: string,
  categories: Category[],
  cantonData: CantonData,
  userData: UserData,
  t_cat: (key: string) => string,
): Promise<{ rows: RemainingCategoryStatisticsProps[] }> => {
  const startISO = getIsoDate(start)
  const endISO = getIsoDate(end)
  const data = await fetchCategoryStatistics(startISO, endISO, user_id)
  const aggregation = aggregateStatistics(data)

  // Fetch user categories to get workload
  const userCategories = await getUserCategories(user_id)

  const userCategoryIds = Object.values(aggregation)
    .filter((stat) => stat.is_user_category && stat.user_category_id !== null)
    .map((stat) => stat.user_category_id)

  if (userCategoryIds.length > 0) {
    const workloadMap = await fetchUserCategoryWorkloads(userCategoryIds, user_id)
    applyWorkloadsToStatistics(aggregation, workloadMap)
  }

  // Filter categories to only include 'furtherEmployment'
  const furtherEmploymentCategories = (categories || []).filter(
    (category) => category.category_set_title === 'furtherEmployment',
  )

  // Map userCategories to ids for workload
  const userCategoryWorkloads = (userCategories || []).reduce(
    (acc, category) => {
      acc[category.id] = category.workload
      return acc
    },
    {} as { [key: number]: number },
  )

  const rows: RemainingCategoryStatisticsProps[] = (furtherEmploymentCategories || []).map(
    (category) => {
      const effectiveDuration =
        aggregation[`cat_${category.id}`]?.duration ||
        aggregation[`user_cat_${category.id}`]?.duration ||
        0

      const workloadPercentage = userCategoryWorkloads[category.id] || 0
      const targetDuration = calculateRequiredHours(
        cantonData.annual_work_hours,
        100,
        start,
        end,
        workloadPercentage,
        cantonData,
        userData,
      )

      return {
        title: category.title,
        effectiveDuration,
        targetDuration,
        color: category.color,
      }
    },
  )

  // Find entries with no category
  const noCategoryDuration = data
    .filter((record) => !record.category_id && !record.user_category_id)
    .reduce((sum, record) => sum + record.duration, 0)

  // Include the no-category row if applicable
  if (noCategoryDuration > 0) {
    rows.push({
      title: t_cat('no_category'),
      effectiveDuration: noCategoryDuration,
      targetDuration: 0,
      color: 'rgb(100,100,100)', // Default color or any placeholder
    })
  }
  // Calculate otherCantonDuration excluding the selected canton and add it to rows with default color
  const otherCantonDuration = data
    .filter((record) => record.category_id && !findCategory(record, categories))
    .reduce((sum, record) => sum + record.duration, 0)

  if (otherCantonDuration > 0) {
    rows.push({
      title: t_cat('other_canton'),
      effectiveDuration: otherCantonDuration,
      targetDuration: 0,
      color: 'rgb(100,100,100)', // Default color or any placeholder
    })
  }

  return { rows }
}

const calculateCustomRequiredHours = (
  annualWorkHours: number,
  weight: number,
  startDate: Date,
  endDate: Date,
  workload: number,
): number => {
  const isLeapYear = (year: number) => new Date(year, 1, 29).getMonth() === 1
  const daysInYear = isLeapYear(endDate.getFullYear()) ? 366 : 365
  const workingDays = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24) + 1
  const adjustedAnnualWorkMinutes = ((annualWorkHours * 60) / daysInYear) * workingDays
  return Math.round(adjustedAnnualWorkMinutes * (weight / 100) * (workload / 100))
}

export const getCustomCategoryStatisticsData = async (
  start: Date,
  end: Date,
  user_id: string,
  profileCategories: ProfileCategoryData[],
  configProfile: ConfigProfileData,
  userData: UserData,
  t_cat: (key: string) => string,
): Promise<CategoryStatistics> => {
  const startISO = getIsoDate(start)
  const endISO = getIsoDate(end)
  const data = await fetchCategoryStatistics(startISO, endISO, user_id)

  const profileAggregation: { [key: string]: number } = {}
  for (const record of data) {
    if (record.profile_category_id) {
      const key = record.profile_category_id
      profileAggregation[key] = (profileAggregation[key] || 0) + (record.duration || 0)
    }
  }

  const rows: CategoryStatisticsProps[] = profileCategories.map((cat) => {
    const effectiveDuration = profileAggregation[cat.id] || 0
    const targetDuration = calculateCustomRequiredHours(
      configProfile.annual_work_hours,
      cat.weight,
      start,
      end,
      userData.workload,
    )

    return {
      title: cat.title,
      effectiveDuration,
      targetDuration,
      effectiveWorkload: '0',
      targetWorkload: cat.weight.toString(),
      color: cat.color,
      subcategories: [],
    }
  })

  const totalEffectiveDuration = rows.reduce((sum, row) => sum + row.effectiveDuration, 0)
  const totalTargetDuration = rows.reduce((sum, row) => sum + row.targetDuration, 0)

  rows.forEach((row) => {
    row.effectiveWorkload = totalEffectiveDuration === 0
      ? '0.00'
      : ((row.effectiveDuration / totalEffectiveDuration) * 100).toFixed(2)
  })

  return {
    rows,
    noCategoryDuration: 0,
    totalEffectiveDuration,
    totalTargetDuration,
  }
}

export const getCustomRemainingCategoryStatisticsData = async (
  start: Date,
  end: Date,
  user_id: string,
  profileCategories: ProfileCategoryData[],
  t_cat: (key: string) => string,
): Promise<{ rows: RemainingCategoryStatisticsProps[] }> => {
  const startISO = getIsoDate(start)
  const endISO = getIsoDate(end)
  const data = await fetchCategoryStatistics(startISO, endISO, user_id)

  const rows: RemainingCategoryStatisticsProps[] = []
  const profileCatIds = new Set(profileCategories.map(pc => pc.id))

  const noCategoryDuration = data
    .filter((r: any) => !r.category_id && !r.user_category_id && !r.profile_category_id)
    .reduce((sum: number, r: any) => sum + (r.duration || 0), 0)

  if (noCategoryDuration > 0) {
    rows.push({
      title: t_cat('no_category'),
      effectiveDuration: noCategoryDuration,
      targetDuration: 0,
      color: 'rgb(100,100,100)',
    })
  }

  const unmatchedDuration = data
    .filter((r: any) => {
      if (r.profile_category_id && !profileCatIds.has(r.profile_category_id)) return true
      if (!r.profile_category_id && (r.category_id || r.user_category_id)) return true
      return false
    })
    .reduce((sum: number, r: any) => sum + (r.duration || 0), 0)

  if (unmatchedDuration > 0) {
    rows.push({
      title: t_cat('other_canton'),
      effectiveDuration: unmatchedDuration,
      targetDuration: 0,
      color: 'rgb(100,100,100)',
    })
  }

  return { rows }
}
