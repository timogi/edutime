import { supabase } from "@/lib/supabase";



export const createUserCustomTarget = async (
    userId: string,
    categorySetId: number,
    targetPercentage: number,
  ): Promise<boolean> => {
    const { error } = await supabase.from('user_custom_targets').insert([
      {
        user_id: userId,
        category_set_id: categorySetId,
        target_percentage: targetPercentage,
      },
    ])
  
    if (error) {
      console.error('Error creating user custom target', error)
      return false
    }
  
    return true
  }
  
  export const updateUserCustomTarget = async (
    targetId: number,
    targetPercentage: number,
  ): Promise<boolean> => {
    const { error } = await supabase
      .from('user_custom_targets')
      .update({ target_percentage: targetPercentage })
      .eq('id', targetId)
  
    if (error) {
      console.error('Error updating user custom target', error)
      return false
    }
  
    return true
  }
  