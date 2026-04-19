import { CategoryResult, findCategory } from "@/lib/database/categories";
import { TimeRecord } from "@/lib/types";

export type ResolvedCategoryType = "profile" | "user" | "regular" | "other_canton" | "none";

export interface ResolvedCategory {
  categoryType: ResolvedCategoryType;
  category: CategoryResult | undefined;
}

export const resolveRecordCategory = (
  record: TimeRecord,
  categories: CategoryResult[],
): ResolvedCategory => {
  const category = findCategory(record, categories);

  if (record.profile_category_id) {
    return { categoryType: category ? "profile" : "none", category };
  }

  if (record.is_user_category && record.user_category_id) {
    return { categoryType: category ? "user" : "none", category };
  }

  if (record.category_id && category) {
    return { categoryType: "regular", category };
  }

  if (!record.is_user_category && record.category_id && !category) {
    return { categoryType: "other_canton", category: undefined };
  }

  return { categoryType: "none", category: undefined };
};
