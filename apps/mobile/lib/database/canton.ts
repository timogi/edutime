import { supabase } from "../supabase"
import { CantonData } from "../types"

export const getCantonData = async (
    cantonCode: string,
    user_id: string,
  ): Promise<CantonData | undefined> => {
    // Query the 'cantons' table
    const { data: cantonData, error: cantonError } = await supabase
      .from('cantons')
      .select(
        `
        annual_work_hours,
        title,
        has_subcategories,
        is_configurable,
        is_working_hours_disabled,
        use_custom_work_hours
        `,
      )
      .eq('code', cantonCode)
      .single()
  
    if (cantonError) {
      console.error('Error fetching canton data:', cantonError)
      return
    }
  
    if (!cantonData) {
      console.error('No data found for the given canton code')
      return
    }
  
    // Query the 'category_sets' table
    const { data: categoryData, error: categoryError } = await supabase
      .from('category_sets')
      .select(
        `
        target_percentage,
        title,
        min_target_percentage,
        max_target_percentage,
        id
        `,
      )
      .eq('canton_code', cantonCode)
  
    if (categoryError) {
      console.error('Error fetching category data:', categoryError)
      return
    }
  
    const categorySets = categoryData.map((category) => ({
      id: category.id,
      percentage: category.target_percentage,
      title: category.title,
      min_target_percentage: category.min_target_percentage?.toString() ?? null,
      max_target_percentage: category.max_target_percentage?.toString() ?? null,
      user_percentage: null as number | null,
      user_percentage_id: null as number | null,
    }))
  
    // Optionally add user custom targets if is_configurable is true
    if (cantonData.is_configurable) {
      const { data: userCustomTargetsData, error: userCustomTargetsError } = await supabase
        .from('user_custom_targets')
        .select(
          `
          target_percentage,
          category_set_id,
          id
          `,
        )
        .eq('user_id', user_id)
  
      if (userCustomTargetsError) {
        console.error('Error fetching user custom targets:', userCustomTargetsError)
        return
      }
  
      // Update categorySets with user custom targets
      categorySets.forEach((categorySet) => {
        const userCustomTarget = userCustomTargetsData?.find(
          (target) => target.category_set_id === categorySet.id,
        )
        if (userCustomTarget) {
          categorySet.user_percentage = userCustomTarget.target_percentage
          categorySet.user_percentage_id = userCustomTarget.id
        }
      })
    }
  
    // Combine data
    const result: CantonData = {
      annual_work_hours: cantonData.annual_work_hours,
      title: cantonData.title,
      has_subcategories: cantonData.has_subcategories,
      is_configurable: cantonData.is_configurable,
      is_working_hours_disabled: cantonData.is_working_hours_disabled,
      use_custom_work_hours: cantonData.use_custom_work_hours,
      category_sets: categorySets,
    }
  
    return result
  }