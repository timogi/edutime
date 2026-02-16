import { CantonData } from '@/types/globals'
import { supabase } from './client'

// Helper function to check and refresh session if needed
const ensureSession = async (): Promise<boolean> => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()
    if (error) {
      return false
    }
    if (!session) {
      return false
    }
    return true
  } catch (error) {
    return false
  }
}

export const getCantonData = async (
  cantonCode: string,
  user_id: string,
): Promise<CantonData | undefined> => {
  if (!cantonCode) {
    return undefined
  }

  if (!user_id) {
    return undefined
  }

  // Check session before querying
  const hasSession = await ensureSession()
  if (!hasSession) {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.refreshSession()
      if (error || !session) {
        return undefined
      }
    } catch (error) {
      return undefined
    }
  }

  // Query the 'cantons' table with timeout
  let cantonData, cantonError

  const performQuery = async (): Promise<{ data: any; error: any }> => {
    // Use a fresh query each time to avoid connection issues
    const query = supabase
      .from('cantons')
      .select(
        `
        annual_work_hours,
        title,
        has_subcategories,
        is_configurable,
        use_custom_work_hours,
        is_working_hours_disabled
        `,
      )
      .eq('code', cantonCode)

    return await query
  }

  // Try with timeout - if it times out, the query is likely stuck
  let queryCompleted = false
  const queryPromise = performQuery().then((result) => {
    queryCompleted = true
    return result
  })

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => {
      if (!queryCompleted) {
        reject(new Error('Query timeout after 8 seconds'))
      }
    }, 8000),
  )

  try {
    const result = await Promise.race([queryPromise, timeoutPromise])
    cantonData = result.data
    cantonError = result.error
  } catch (error) {
    if (error instanceof Error && error.message.includes('timeout')) {
      // Try to refresh session and retry once
      try {
        const {
          data: { session },
          error: refreshError,
        } = await supabase.auth.refreshSession()
        if (refreshError || !session) {
          return undefined
        }
        // Wait a bit before retry and reset the flag
        queryCompleted = false
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const retryResult = await performQuery()
        cantonData = retryResult.data
        cantonError = retryResult.error
      } catch (retryError) {
        return undefined
      }
    } else {
      return undefined
    }
  }

  if (cantonError) {
    return undefined
  }

  if (!cantonData || cantonData.length === 0) {
    return undefined
  }

  const canton = cantonData[0]

  // Query the 'category_sets' table with timeout
  let categoryData, categoryError

  const performCategoryQuery = async (): Promise<{ data: any; error: any }> => {
    return await supabase
      .from('category_sets')
      .select(
        `
        target_percentage,
        title,
        min_target_percentage,
        max_target_percentage,
        id,
        order
        `,
      )
      .eq('canton_code', cantonCode)
      .order('order', { ascending: true })
  }

  try {
    const queryPromise = performCategoryQuery()
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Query timeout after 8 seconds')), 8000),
    )

    const result = await Promise.race([queryPromise, timeoutPromise])
    categoryData = result.data
    categoryError = result.error
  } catch (error) {
    if (error instanceof Error && error.message.includes('timeout')) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500))
        const retryResult = await performCategoryQuery()
        categoryData = retryResult.data
        categoryError = retryResult.error
      } catch (retryError) {
        return undefined
      }
    } else {
      return undefined
    }
  }

  if (categoryError) {
    return undefined
  }

  const categorySets = categoryData.map(
    (category: {
      target_percentage: number
      title: string
      min_target_percentage: string
      max_target_percentage: string
      id: number
      order: number
    }) => ({
      id: category.id,
      percentage: category.target_percentage,
      title: category.title,
      min_target_percentage: category.min_target_percentage,
      max_target_percentage: category.max_target_percentage,
      user_percentage: null, // Initialize user_percentage to null
      user_percentage_id: null, // Initialize user_percentage_id to null
      order: category.order,
    }),
  )

  // Optionally add user custom targets if is_configurable is true
  if (canton.is_configurable) {
    let userCustomTargetsData, userCustomTargetsError

    const performUserTargetsQuery = async (): Promise<{ data: any; error: any }> => {
      return await supabase
        .from('user_custom_targets')
        .select(
          `
          target_percentage,
          category_set_id,
          id
          `,
        )
        .eq('user_id', user_id)
    }

    try {
      const queryPromise = performUserTargetsQuery()
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout after 8 seconds')), 8000),
      )

      const result = await Promise.race([queryPromise, timeoutPromise])
      userCustomTargetsData = result.data
      userCustomTargetsError = result.error
    } catch (error) {
      if (error instanceof Error && error.message.includes('timeout')) {
        try {
          await new Promise((resolve) => setTimeout(resolve, 500))
          const retryResult = await performUserTargetsQuery()
          userCustomTargetsData = retryResult.data
          userCustomTargetsError = retryResult.error
        } catch (retryError) {
          return undefined
        }
      } else {
        return undefined
      }
    }

    if (userCustomTargetsError) {
      return undefined
    }

    // Update categorySets with user custom targets
    categorySets.forEach((categorySet: CantonData['category_sets'][number]) => {
      const userCustomTarget = userCustomTargetsData.find(
        (target: { target_percentage: number; category_set_id: number; id: number }) =>
          target.category_set_id === categorySet.id,
      )
      if (userCustomTarget) {
        categorySet.user_percentage = userCustomTarget.target_percentage
        categorySet.user_percentage_id = userCustomTarget.id // Include user_percentage_id
      }
    })
  }

  // Combine data
  const result: CantonData = {
    annual_work_hours: canton.annual_work_hours,
    title: canton.title,
    has_subcategories: canton.has_subcategories,
    is_configurable: canton.is_configurable,
    use_custom_work_hours: canton.use_custom_work_hours,
    is_working_hours_disabled: canton.is_working_hours_disabled,
    category_sets: categorySets,
  }

  return result
}
