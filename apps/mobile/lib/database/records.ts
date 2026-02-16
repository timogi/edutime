import { Database } from '../../database.types';
import { getIsoDate } from '../helpers';
import { supabase } from '../supabase';


export const insertTimeRecord = async (record: Database['public']['Tables']['records']['Insert']) => {
  const { data, error } = await supabase.from('records').insert([record]);
  if (error) {
    throw error;
  }
  return data;
};

export const insertTimeRecords = async (records: Database['public']['Tables']['records']['Insert'][]) => {
  const { data, error } = await supabase.from('records').insert(records);
  if (error) {
    throw error;
  }
  return data;
};

export const updateTimeRecord = async (record: Database['public']['Tables']['records']['Update'], id: number) => {
  const { data, error } = await supabase
    .from('records')
    .update(record)
    .eq('id', id);

  if (error) {
    throw error;
  }
  return data;
};

export const deleteTimeRecord = async (id: number) => {
  const { data, error } = await supabase.from('records').delete().eq('id', id);

  if (error) {
    throw error;
  }
  return data;
};

export const getDailyDurations = async (start: Date, end: Date, user_id: string) => {
  const startISO = getIsoDate(start);
  const endISO = getIsoDate(end);

  const { data, error } = await supabase
    .from('records')
    .select('date, duration')
    .gte('date', startISO)
    .lte('date', endISO)
    .eq('user_id', user_id)
    .order('date', { ascending: true });

  if (error) {
    throw error;
  }

  // Aggregate durations by date
  const aggregation = (data || []).reduce<{ [date: string]: number; }>(
    (acc, record) => {
      if (record.duration !== null) {
        acc[record.date] = (acc[record.date] || 0) + record.duration;
      }
      return acc;
    },
    {}
  );

  return aggregation;
};

export const getRecords = async (start: Date, end: Date, user_id: string) => {
  const startISO = getIsoDate(start);
  const endISO = getIsoDate(end);

  const { data, error } = await supabase
    .from('records')
    .select('*')
    .gte('date', startISO)
    .lte('date', endISO)
    .eq('user_id', user_id)
    .order('date', { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
};

export const getRecordsByCategory = async (
  start: Date, 
  end: Date, 
  user_id: string, 
  categoryId: number | null, 
  isUserCategory: boolean = false
) => {
  const startISO = getIsoDate(start);
  const endISO = getIsoDate(end);

  let query = supabase
    .from('records')
    .select(`
      *,
      categories!inner(title, subtitle)
    `)
    .gte('date', startISO)
    .lte('date', endISO)
    .eq('user_id', user_id);

  // Handle different category types
  if (categoryId === null) {
    // Records with no category (both category_id and user_category_id are null)
    query = query.is('category_id', null).is('user_category_id', null);
  } else if (isUserCategory) {
    // User categories
    query = query.eq('is_user_category', true).eq('user_category_id', categoryId);
  } else {
    // Regular categories
    query = query.eq('is_user_category', false).eq('category_id', categoryId);
  }

  const { data, error } = await query.order('date', { ascending: true });

  if (error) {
    console.error('Error fetching records by category:', error);
    throw error;
  }

  return data || [];
};

// New function to get records for a specific category set (for statistics)
export const getRecordsByCategorySet = async (
  start: Date,
  end: Date,
  user_id: string,
  categoryIds: number[],
  isUserCategory: boolean = false
) => {
  const startISO = getIsoDate(start);
  const endISO = getIsoDate(end);

  let query = supabase
    .from('records')
    .select(`
      *,
      categories!inner(title, subtitle)
    `)
    .gte('date', startISO)
    .lte('date', endISO)
    .eq('user_id', user_id)
    .eq('is_user_category', isUserCategory);

  if (isUserCategory) {
    query = query.in('user_category_id', categoryIds);
  } else {
    query = query.in('category_id', categoryIds);
  }

  const { data, error } = await query.order('date', { ascending: true });

  if (error) {
    console.error('Error fetching records by category set:', error);
    throw error;
  }

  return data || [];
};

export const getRecordsForOtherCanton = async (
  start: Date,
  end: Date,
  user_id: string,
  currentCantonCategoryIds: number[]
) => {
  const startISO = getIsoDate(start);
  const endISO = getIsoDate(end);

  // Get all records in the date range
  const { data, error } = await supabase
    .from('records')
    .select(`
      *,
      categories!inner(title, subtitle)
    `)
    .gte('date', startISO)
    .lte('date', endISO)
    .eq('user_id', user_id)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching records for other canton:', error);
    throw error;
  }

  // Filter out records that match current canton categories
  const filteredData = (data || []).filter(record => 
    record.category_id && 
    !currentCantonCategoryIds.includes(record.category_id) &&
    !record.is_user_category
  );

  return filteredData;
};

// Helper function to check if title matches user categories
const isUserCategoriesTitle = (title: string): boolean => {
  return title.includes('Weitere Anstellungen') || 
         title.includes('Further employments') || 
         title.includes('Autres emplois');
};

// Helper function to check if title matches no category
const isNoCategoryTitle = (title: string): boolean => {
  return title.includes('Keine Kategorie') || 
         title.includes('No category') || 
         title.includes('Pas de catégorie');
};

// Helper function to check if title matches other canton
const isOtherCantonTitle = (title: string): boolean => {
  return title.includes('Anderer Kanton') || 
         title.includes('Other canton') || 
         title.includes('Autre canton');
};

// Generic function to get records for any category type
export const getRecordsForCategoryType = async (
  start: Date,
  end: Date,
  user_id: string,
  categoryTitle: string,
  categories: any[] = []
) => {
  const startISO = getIsoDate(start);
  const endISO = getIsoDate(end);

  if (isUserCategoriesTitle(categoryTitle)) {
    // User categories (Weiterbeschäftigung) - get all user category IDs and fetch their records
    const userCategoryIds = categories
      .filter(cat => cat.is_further_employment)
      .map(cat => cat.id);
    
    if (userCategoryIds.length === 0) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('records')
      .select(`
        *,
        user_categories!inner(title, subtitle)
      `)
      .gte('date', startISO)
      .lte('date', endISO)
      .eq('user_id', user_id)
      .eq('is_user_category', true)
      .in('user_category_id', userCategoryIds)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching user category records:', error);
      throw error;
    }

    return data || [];
    
  } else if (isNoCategoryTitle(categoryTitle)) {
    // No category records
    return await getRecordsByCategory(start, end, user_id, null, false);
    
  } else if (isOtherCantonTitle(categoryTitle)) {
    // Other canton records
    const currentCantonCategoryIds = categories
      .filter(cat => !cat.is_further_employment)
      .map(cat => cat.id);
    
    return await getRecordsForOtherCanton(start, end, user_id, currentCantonCategoryIds);
    
  } else {
    // Regular category in remaining categories - this shouldn't happen in the generic function
    return [];
  }
};

// Helper function to get category color for a record
export const getCategoryColorForRecord = (record: any, categories: any[], defaultColor: string = '#000000') => {
  if (record.is_user_category && record.user_category_id) {
    // User category - find by user_category_id and is_further_employment
    const userCategory = categories.find(cat => 
      cat.id === record.user_category_id && cat.is_further_employment
    );
    return userCategory?.color || defaultColor;
  } else if (record.category_id) {
    // Regular category - find by category_id and not is_further_employment
    const category = categories.find(cat => 
      cat.id === record.category_id && !cat.is_further_employment
    );
    return category?.color || defaultColor;
  } else {
    // No category or other canton - use black
    return defaultColor;
  }
};
