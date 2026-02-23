import { useQuery } from '@tanstack/react-query';
import { getRecordsForCategoryType, getCategoryColorForRecord, getRecordsByCategory, getRecordsByCategorySet } from '@/lib/database/records';
import { Database } from '@edutime/shared';
import { useUser } from '@/contexts/UserContext';

type TimeRecord = Database['public']['Tables']['records']['Row'];

interface UseCategoryRecordsQueryProps {
  startDate: Date;
  endDate: Date;
  categoryTitle: string;
  categoryId?: number | null;
  isUserCategory?: boolean;
  categoryIds?: number[];
  enabled?: boolean;
}

export const useCategoryRecordsQuery = ({
  startDate,
  endDate,
  categoryTitle,
  categoryId,
  isUserCategory = false,
  categoryIds,
  enabled = true
}: UseCategoryRecordsQueryProps) => {
  const { user, categories } = useUser();

  return useQuery({
    queryKey: ['category-records', categoryTitle, categoryId, isUserCategory, categoryIds, startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      if (!user?.user_id) {
        throw new Error('User not authenticated');
      }

      let records: TimeRecord[] = [];

      // Handle different category types
      if (categoryIds && categoryIds.length > 0) {
        // Category set - get records for multiple categories
        records = await getRecordsByCategorySet(startDate, endDate, user.user_id, categoryIds, isUserCategory);
      } else if (categoryId !== null) {
        // Single category (regular or user category)
        records = await getRecordsByCategory(startDate, endDate, user.user_id, categoryId, isUserCategory);
      } else {
        // Use generic function for special category types
        records = await getRecordsForCategoryType(startDate, endDate, user.user_id, categoryTitle, categories);
      }

      // Add category colors to each record
      const recordsWithColors = records.map(record => ({
        ...record,
        categoryColor: getCategoryColorForRecord(record, categories, '#000000')
      }));

      return recordsWithColors;
    },
    enabled: enabled && !!user?.user_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
};
