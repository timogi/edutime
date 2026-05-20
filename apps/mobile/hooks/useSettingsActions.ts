import { useCallback } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { Database, ProfileCategoryData } from "@edutime/shared";
import { useUser } from "@/contexts/UserContext";
import { updateUserData, deleteAccount } from "@/lib/database/user";
import {
  createUserCategory,
  updateUserCategory,
  deleteUserCategory,
} from "@/lib/database/user_categories";
import { createUserCustomTarget, updateUserCustomTarget } from "@/lib/database/user_custom_targets";
import {
  getOrCreateConfigProfile,
  activateCustomMode,
  deactivateCustomMode,
  updateConfigProfile,
  createProfileCategory,
  updateProfileCategory,
  deleteProfileCategory,
  countRecordsForProfileCategory,
} from "@/lib/database/config_profiles";
import { EmploymentCategory } from "@/lib/types";
import { showToast } from "@/components/ui/Toast";
import { settingsKeys } from "./useSettingsDataQuery";

const deleteUserAccount = async (
  userId: string,
  password: string,
  email: string
): Promise<void> => {
  if (!userId || !password || !email) {
    throw new Error("User ID, password and email are required");
  }

  try {
    await deleteAccount(password, userId, email);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to delete account");
  }
};

/**
 * Shared handlers for settings sub-screens (employment, categories, account, etc.).
 */
export function useSettingsActions() {
  const { userEmail, user, cantonData, logout, configProfile } =
    useUser();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const invalidateSettingsData = useCallback(async () => {
    if (!user?.user_id) return;
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: settingsKeys.user(user.user_id) }),
      queryClient.invalidateQueries({ queryKey: settingsKeys.entitlement(user.user_id) }),
      queryClient.invalidateQueries({ queryKey: settingsKeys.dataScope(user.user_id) }),
    ]);
  }, [queryClient, user?.user_id]);

  const resolveConfigProfileId = useCallback(async (): Promise<string> => {
    if (!user?.user_id) {
      throw new Error("User not found");
    }
    if (configProfile?.id) {
      return configProfile.id;
    }
    const profile = await getOrCreateConfigProfile(user.user_id);
    return profile.id;
  }, [user?.user_id, configProfile?.id]);

  const saveConfigurablePercentages = useCallback(
    async (userPercentages: { [key: number]: number }, cantonDataArg: unknown) => {
      if (!user?.user_id) return;
      const cd = cantonDataArg as {
        category_sets: Array<{
          id: number;
          user_percentage: number | null;
          user_percentage_id: number | null;
        }>;
      };

      try {
        for (const [categorySetId, userPercentage] of Object.entries(userPercentages)) {
          const existingCategorySet = cd?.category_sets.find(
            (cs) => cs.id === Number(categorySetId)
          );
          const numericUserPercentage =
            typeof userPercentage === "string" ? parseFloat(userPercentage) : userPercentage;

          if (
            existingCategorySet &&
            existingCategorySet.user_percentage !== null &&
            existingCategorySet.user_percentage_id !== null
          ) {
            await updateUserCustomTarget(
              existingCategorySet.user_percentage_id,
              numericUserPercentage as number
            );
          } else {
            await createUserCustomTarget(
              user.user_id,
              Number(categorySetId),
              numericUserPercentage as number
            );
          }
        }
      } catch (error) {
        console.error("Error saving percentages:", error);
        throw error;
      }
    },
    [user?.user_id]
  );

  const handleSaveEmployment = useCallback(
    async (
      workload: number,
      canton: string,
      customWorkHours?: number,
      userPercentages?: { [key: number]: number },
      classSize?: number | null,
      educationLevel?: Database["public"]["Enums"]["education_level"] | null,
      teacherRelief?: number | null
    ) => {
      if (!user?.user_id) return;
      try {
        const userData: Partial<Database["public"]["Tables"]["users"]["Update"]> = {
          workload,
          canton_code: canton,
        };
        if (customWorkHours) {
          userData.custom_work_hours = customWorkHours;
        }
        if (canton === "TG_S") {
          if (classSize !== undefined) {
            userData.class_size = classSize;
          }
          if (educationLevel !== undefined) {
            userData.education_level = educationLevel;
          }
          if (teacherRelief !== undefined) {
            userData.teacher_relief = teacherRelief;
          }
        }
        await updateUserData(user.user_id, userData);

        if (cantonData?.is_configurable && userPercentages && cantonData) {
          await saveConfigurablePercentages(userPercentages, cantonData);
        }

        await invalidateSettingsData();
      } catch (error) {
        console.error("Error saving employment:", error);
      }
    },
    [user?.user_id, cantonData, invalidateSettingsData, saveConfigurablePercentages]
  );

  const handleSaveCustom = useCallback(
    async (annualWorkHours: number, workload: number) => {
      if (!user?.user_id) {
        throw new Error("User not found");
      }
      try {
        const profileId = await resolveConfigProfileId();
        await updateConfigProfile(profileId, { annual_work_hours: annualWorkHours });
        await updateUserData(user.user_id, { workload });
        await invalidateSettingsData();
      } catch (error) {
        console.error("Error saving custom settings:", error);
        throw error;
      }
    },
    [user?.user_id, resolveConfigProfileId, invalidateSettingsData]
  );

  const handleActivateCustomMode = useCallback(async () => {
    if (!user?.user_id) return;
    try {
      const profile = await getOrCreateConfigProfile(user.user_id);
      await activateCustomMode(user.user_id, profile.id);
      await invalidateSettingsData();
    } catch (error) {
      console.error("Error activating custom mode:", error);
    }
  }, [user?.user_id, invalidateSettingsData]);

  const handleDeactivateCustomMode = useCallback(async () => {
    if (!user?.user_id) return;
    try {
      await deactivateCustomMode(user.user_id);
      await invalidateSettingsData();
    } catch (error) {
      console.error("Error deactivating custom mode:", error);
    }
  }, [user?.user_id, invalidateSettingsData]);

  const handleCantonChange = useCallback(
    async (newCanton: string) => {
      if (!user?.user_id) return;
      try {
        await updateUserData(user.user_id, { canton_code: newCanton });
        await invalidateSettingsData();
      } catch (error) {
        console.error("Error changing canton:", error);
      }
    },
    [user?.user_id, invalidateSettingsData]
  );

  const handleEditCategory = useCallback(
    async (category: EmploymentCategory) => {
      if (!user?.user_id) return;
      try {
        const categoryData = {
          ...category,
          color: category.color || "#845ef7",
        };
        await updateUserCategory(category.id, categoryData);
        await invalidateSettingsData();
      } catch (error) {
        console.error("Error editing category:", error);
      }
    },
    [user?.user_id, invalidateSettingsData]
  );

  const handleCreateCategory = useCallback(
    async (category: EmploymentCategory) => {
      if (!user?.user_id) return;
      try {
        const { id: _id, ...categoryWithoutId } = category;
        const categoryData = {
          ...categoryWithoutId,
          color: categoryWithoutId.color || "#845ef7",
        };
        await createUserCategory(user.user_id, categoryData);
        await invalidateSettingsData();
      } catch (error) {
        console.error("Error creating category:", error);
      }
    },
    [user?.user_id, invalidateSettingsData]
  );

  const handleDeleteCategory = useCallback(
    async (categoryId: number) => {
      try {
        await deleteUserCategory(categoryId);
        await invalidateSettingsData();
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    },
    [invalidateSettingsData]
  );

  const handleCreateProfileCategory = useCallback(
    async (category: Omit<ProfileCategoryData, "id" | "config_profile_id">) => {
      if (!user?.user_id) {
        throw new Error("User not found");
      }
      try {
        const profileId = await resolveConfigProfileId();
        await createProfileCategory(user.user_id, profileId, category);
        await invalidateSettingsData();
      } catch (error) {
        console.error("Error creating profile category:", error);
        throw error;
      }
    },
    [user?.user_id, resolveConfigProfileId, invalidateSettingsData]
  );

  const handleEditProfileCategory = useCallback(
    async (id: string, updates: Partial<ProfileCategoryData>) => {
      try {
        await updateProfileCategory(id, updates);
        await invalidateSettingsData();
      } catch (error) {
        console.error("Error editing profile category:", error);
        throw error;
      }
    },
    [invalidateSettingsData]
  );

  const handleDeleteProfileCategory = useCallback(
    async (id: string) => {
      try {
        if (!user?.user_id) return;
        const linkedCount = await countRecordsForProfileCategory(id, user.user_id);
        const message =
          linkedCount > 0
            ? `${t("Settings.confirmDeleteProfileCategoryWithCount", { count: linkedCount })}\n\n${t("Settings.deleteProfileCategoryRecordsInfo")}`
            : t("Settings.confirmDeleteProfileCategory");

        Alert.alert(t("Settings.delete"), message, [
          { text: t("Settings.cancel"), style: "cancel" },
          {
            text: t("Settings.delete"),
            style: "destructive",
            onPress: async () => {
              try {
                await deleteProfileCategory(id);
                await invalidateSettingsData();
              } catch (error) {
                console.error("Error deleting profile category:", error);
              }
            },
          },
        ]);
      } catch (error) {
        console.error("Error deleting profile category:", error);
      }
    },
    [user?.user_id, t, invalidateSettingsData]
  );

  const handleDeleteAccount = useCallback(
    async (password: string) => {
      if (!user?.user_id || !userEmail) {
        throw new Error("User not found");
      }

      try {
        await deleteUserAccount(user.user_id, password, userEmail);
        showToast({
          type: "success",
          title: t("Settings.accountDeletionQueuedTitle"),
          message: t("Settings.accountDeletionQueuedMessage"),
        });
        await logout();
      } catch (error) {
        console.error("Error deleting account:", error);
        throw error;
      }
    },
    [user?.user_id, userEmail, t, logout]
  );

  return {
    handleSaveEmployment,
    handleSaveCustom,
    handleActivateCustomMode,
    handleDeactivateCustomMode,
    handleCantonChange,
    handleEditCategory,
    handleCreateCategory,
    handleDeleteCategory,
    handleCreateProfileCategory,
    handleEditProfileCategory,
    handleDeleteProfileCategory,
    handleDeleteAccount,
  };
}
