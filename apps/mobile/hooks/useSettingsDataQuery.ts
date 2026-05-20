import { useMemo } from "react";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {
  ConfigMode,
  ConfigProfileData,
  Database,
  getConfigMode,
  ProfileCategoryData,
} from "@edutime/shared";
import { CantonData, EmploymentCategory } from "@/lib/types";
import { getCategories, CategoryResult, getUserCategories } from "@/lib/database/categories";
import { getCantonData } from "@/lib/database/canton";
import {
  getConfigProfile,
  getProfileCategories,
  profileCategoriesToCategoryResults,
} from "@/lib/database/config_profiles";
import { getUser } from "@/lib/database/user";
import { hasActiveEntitlement } from "@edutime/shared";
import { supabase } from "@/lib/supabase";

type UserRow = Database["public"]["Tables"]["users"]["Row"];

export interface SettingsDataResult {
  configMode: ConfigMode;
  configProfile: ConfigProfileData | null;
  profileCategories: ProfileCategoryData[];
  categories: CategoryResult[];
  userCategories: EmploymentCategory[];
  cantonData: CantonData | null;
}

const mapUserCategoriesToCategoryResults = (
  cats: EmploymentCategory[],
): CategoryResult[] =>
  cats.map((cat) => ({
    id: cat.id,
    title: cat.title,
    subtitle: cat.subtitle,
    color: cat.color ?? "#845ef7",
    category_set_title: "furtherEmployment",
    is_further_employment: true,
    order: null,
  }));

export const settingsKeys = {
  all: ["settings"] as const,
  user: (userId: string) => [...settingsKeys.all, "user", userId] as const,
  entitlement: (userId: string) => [...settingsKeys.all, "entitlement", userId] as const,
  dataScope: (userId: string) => [...settingsKeys.all, "data", userId] as const,
  data: (userId: string, fingerprint: string) =>
    [...settingsKeys.all, "data", userId, fingerprint] as const,
} as const;

const buildSettingsFingerprint = (user: UserRow | null): string => {
  if (!user) return "no-user";
  return [
    user.canton_code ?? "no-canton",
    user.active_config_profile_id ?? "default-mode",
    user.updated_at ?? "no-updated-at",
  ].join("|");
};

const fetchSettingsData = async (user: UserRow): Promise<SettingsDataResult> => {
  const configMode = getConfigMode(user);

  if (configMode === "custom" && user.active_config_profile_id) {
    const [configProfile, profileCategories, userCategories, cantonData] = await Promise.all([
      getConfigProfile(user.active_config_profile_id),
      getProfileCategories(user.active_config_profile_id),
      getUserCategories(user.user_id),
      user.canton_code ? getCantonData(user.canton_code, user.user_id) : Promise.resolve(undefined),
    ]);

    const categoryResults = [
      ...profileCategoriesToCategoryResults(profileCategories),
      ...mapUserCategoriesToCategoryResults(userCategories),
    ];

    return {
      configMode,
      configProfile,
      profileCategories,
      categories: categoryResults,
      userCategories,
      cantonData: cantonData ?? null,
    };
  }

  const [regularCategories, userCategories, cantonData] = await Promise.all([
    user.canton_code ? getCategories({ canton_code: user.canton_code, user_id: user.user_id }) : Promise.resolve([]),
    getUserCategories(user.user_id),
    user.canton_code ? getCantonData(user.canton_code, user.user_id) : Promise.resolve(undefined),
  ]);

  return {
    configMode: "default",
    configProfile: null,
    profileCategories: [],
    categories: [...regularCategories, ...mapUserCategoriesToCategoryResults(userCategories)],
    userCategories,
    cantonData: cantonData ?? null,
  };
};

export const useSettingsUserQuery = (
  authUserId: string | null,
): UseQueryResult<UserRow | null, Error> =>
  useQuery({
    queryKey: authUserId ? settingsKeys.user(authUserId) : [...settingsKeys.all, "user", "none"],
    queryFn: () => {
      if (!authUserId) return Promise.resolve(null);
      return getUser(authUserId);
    },
    enabled: Boolean(authUserId),
  });

export const useSettingsEntitlementQuery = (
  authUserId: string | null,
): UseQueryResult<boolean, Error> =>
  useQuery({
    queryKey: authUserId
      ? settingsKeys.entitlement(authUserId)
      : [...settingsKeys.all, "entitlement", "none"],
    queryFn: async () => {
      if (!authUserId) return false;
      return hasActiveEntitlement(supabase, authUserId);
    },
    enabled: Boolean(authUserId),
  });

export const useSettingsDataQuery = (
  user: UserRow | null,
): UseQueryResult<SettingsDataResult, Error> => {
  const fingerprint = useMemo(() => buildSettingsFingerprint(user), [user]);

  return useQuery({
    queryKey: user
      ? settingsKeys.data(user.user_id, fingerprint)
      : [...settingsKeys.all, "data", "none", "none"],
    queryFn: () => {
      if (!user) throw new Error("No user available");
      return fetchSettingsData(user);
    },
    enabled: Boolean(user),
  });
};
