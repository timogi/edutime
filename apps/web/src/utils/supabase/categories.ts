import { BaseTimeRecord, Category, CategorySet, StopWatchSession, UserData } from '@/types/globals'
import { supabase } from './client'
import { getUserCategories } from './user'

export const getCategories = async (userData: UserData) => {
  const { data, error } = await supabase
    .from('categories')
    .select(
      `
        id,
        title,
        subtitle,
        category_sets(color,title,order)
      `,
    )
    .eq('canton_code', userData.canton_code)
    .order('order')

  if (error) {
    console.error('error', error)
    return
  }

  const categories = data.map((item: any) => ({
    // any needed because of bug in supabase types
    id: item.id,
    title: item.title,
    subtitle: item.subtitle,
    color: item.category_sets.color,
    category_set_title: item.category_sets.title,
    category_set_order: item.category_sets.order,
  }))

  // Sort categories by category_set order first, then by category order
  categories.sort((a, b) => {
    if (a.category_set_order !== b.category_set_order) {
      return a.category_set_order - b.category_set_order
    }
    return 0 // categories within the same set maintain their original order
  })

  return categories as Category[]
}

export const getAllCategories = async (userData: UserData) => {
  // use the getUserCategories function to get all the important information about the user category
  // add it as a new category_set to the output of the getCategories so that the output of this function has the same format as the output of getCategories
  const userCategories = await getUserCategories(userData.user_id)
  const categories = (await getCategories(userData)) ?? []

  const userCategoriesCategory = userCategories.map((cat) => ({
    id: cat.id,
    title: cat.title,
    subtitle: cat.subtitle,
    color: cat.color,
    category_set_title: 'furtherEmployment',
  }))

  return [...categories, ...userCategoriesCategory]
}

export const findCategory = (record: BaseTimeRecord, categories: Category[]) => {
  if (!categories || !Array.isArray(categories)) {
    return undefined
  }

  if (record.is_user_category) {
    return categories.find(
      (cat) => cat.id === record.user_category_id && cat.category_set_title === 'furtherEmployment',
    )
  } else {
    return categories.find(
      (cat) => cat.id === record.category_id && cat.category_set_title !== 'furtherEmployment',
    )
  }
}
