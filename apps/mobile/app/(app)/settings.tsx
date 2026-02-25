import React, { useState, useCallback } from "react";
import { StyleSheet, ScrollView, RefreshControl, Alert } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@/contexts/UserContext";
import SettingsHeader from "@/components/settings/SettingsHeader";
import { useTranslation } from "react-i18next";
import { EmploymentInput } from "@/components/settings/EmploymentInput";
import { FurtherEmploymentInput } from "@/components/settings/FurtherEmploymentInput";
import { DeleteAccount } from "@/components/settings/DeleteAccount";
import { LogoutButton } from "@/components/settings/LogoutButton";
import Informations from "@/components/settings/Informations";
import LicenseOverview from "@/components/settings/LicenseOverview";
import { updateUserData } from "@/lib/database/user";
import { createUserCategory, updateUserCategory, deleteUserCategory } from "@/lib/database/user_categories";
import { deleteAccount } from "@/lib/database/user";
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
import { Database } from "@edutime/shared";
import { Spacing, LayoutStyles } from "@/constants/Styles";
import { EmploymentCategory } from "@/lib/types";
import { ProfileCategoryData } from "@edutime/shared";

const deleteUserAccount = async (userId: string, password: string, email: string): Promise<void> => {
  if (!userId || !password || !email) {
    throw new Error('User ID, password and email are required');
  }

  try {
    await deleteAccount(password, userId, email);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to delete account');
  }
};

export default function SettingsScreen() {
  const { userEmail, user, userCategories, cantonData, refreshUserData, logout, configMode, configProfile, profileCategories } = useUser();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshUserData();
    setRefreshing(false);
  }, [refreshUserData]);

  const saveConfigurablePercentages = useCallback(async (userPercentages: {[key: number]: number}, cantonData: unknown) => {
    if (!user?.user_id) return;
    const cd = cantonData as { category_sets: Array<{ id: number; user_percentage: number | null; user_percentage_id: number | null }> };
    
    try {
      for (const [categorySetId, userPercentage] of Object.entries(userPercentages)) {
        const existingCategorySet = cd?.category_sets.find(
          (cs) => cs.id === Number(categorySetId),
        );
        const numericUserPercentage =
          typeof userPercentage === 'string' ? parseFloat(userPercentage) : userPercentage;

        if (
          existingCategorySet &&
          existingCategorySet.user_percentage !== null &&
          existingCategorySet.user_percentage_id !== null
        ) {
          await updateUserCustomTarget(
            existingCategorySet.user_percentage_id,
            numericUserPercentage as number,
          );
        } else {
          await createUserCustomTarget(
            user.user_id,
            Number(categorySetId),
            numericUserPercentage as number,
          );
        }
      }
    } catch (error) {
      console.error('Error saving percentages:', error);
      throw error;
    }
  }, [user?.user_id]);

  const handleSaveEmployment = async (workload: number, canton: string, customWorkHours?: number, userPercentages?: {[key: number]: number}, classSize?: number | null, educationLevel?: Database["public"]["Enums"]["education_level"] | null, teacherRelief?: number | null) => {
    if (!user?.user_id) return;
    try {
      const userData: Partial<Database['public']['Tables']['users']['Update']> = { workload, canton_code: canton };
      if (customWorkHours) {
        userData.custom_work_hours = customWorkHours;
      }
      if (canton === 'TG_S') {
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
      
      await refreshUserData();
    } catch (error) {
      console.error('Error saving employment:', error);
    }
  };

  const handleSaveCustom = async (annualWorkHours: number, workload: number) => {
    if (!user?.user_id || !configProfile) return;
    try {
      await updateConfigProfile(configProfile.id, { annual_work_hours: annualWorkHours });
      await updateUserData(user.user_id, { workload });
      await refreshUserData();
    } catch (error) {
      console.error('Error saving custom settings:', error);
    }
  };

  const handleActivateCustomMode = async () => {
    if (!user?.user_id) return;
    try {
      const profile = await getOrCreateConfigProfile(user.user_id);
      await activateCustomMode(user.user_id, profile.id);
      await refreshUserData();
    } catch (error) {
      console.error('Error activating custom mode:', error);
    }
  };

  const handleDeactivateCustomMode = async () => {
    if (!user?.user_id) return;
    try {
      await deactivateCustomMode(user.user_id);
      await refreshUserData();
    } catch (error) {
      console.error('Error deactivating custom mode:', error);
    }
  };

  const handleCantonChange = async (newCanton: string) => {
    if (!user?.user_id) return;
    try {
      await updateUserData(user.user_id, { canton_code: newCanton });
      await refreshUserData();
    } catch (error) {
      console.error('Error changing canton:', error);
    }
  };

  const handleEditCategory = async (category: EmploymentCategory) => {
    if (!user?.user_id) return;
    try {
      const categoryData = {
        ...category,
        color: category.color || '#845ef7',
      };
      await updateUserCategory(category.id, categoryData);
      await refreshUserData();
    } catch (error) {
      console.error('Error editing category:', error);
    }
  };

  const handleCreateCategory = async (category: EmploymentCategory) => {
    if (!user?.user_id) return;
    try {
      const { id, ...categoryWithoutId } = category;
      const categoryData = {
        ...categoryWithoutId,
        color: categoryWithoutId.color || '#845ef7',
      };
      await createUserCategory(user.user_id, categoryData);
      await refreshUserData();
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      await deleteUserCategory(categoryId);
      await refreshUserData();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleCreateProfileCategory = async (category: Omit<ProfileCategoryData, 'id' | 'config_profile_id'>) => {
    if (!user?.user_id || !configProfile) return;
    try {
      await createProfileCategory(user.user_id, configProfile.id, category);
      await refreshUserData();
    } catch (error) {
      console.error('Error creating profile category:', error);
    }
  };

  const handleEditProfileCategory = async (id: string, updates: Partial<ProfileCategoryData>) => {
    try {
      await updateProfileCategory(id, updates);
      await refreshUserData();
    } catch (error) {
      console.error('Error editing profile category:', error);
    }
  };

  const handleDeleteProfileCategory = async (id: string) => {
    try {
      if (!user?.user_id) return;
      const linkedCount = await countRecordsForProfileCategory(id, user.user_id);
      const message =
        linkedCount > 0
          ? `${t('Settings.confirmDeleteProfileCategoryWithCount', { count: linkedCount })}\n\n${t('Settings.deleteProfileCategoryRecordsInfo')}`
          : t('Settings.confirmDeleteProfileCategory');

      Alert.alert(
        t('Settings.delete'),
        message,
        [
          { text: t('Settings.cancel'), style: 'cancel' },
          {
            text: t('Settings.delete'),
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteProfileCategory(id);
                await refreshUserData();
              } catch (error) {
                console.error('Error deleting profile category:', error);
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error('Error deleting profile category:', error);
    }
  };

  const handleDeleteAccount = async (password: string) => {
    if (!user?.user_id || !userEmail) {
      throw new Error('User not found');
    }

    try {
      await deleteUserAccount(user.user_id, password, userEmail);
      await logout();
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "right", "left", "bottom"]}
    >
      <SettingsHeader />
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        <ThemedView style={styles.buttonContainer}>
          {(cantonData || configMode === 'custom') && (
            <EmploymentInput
              onSave={handleSaveEmployment}
              onCantonChange={handleCantonChange}
              onSaveCustom={handleSaveCustom}
              onActivateCustomMode={handleActivateCustomMode}
              onDeactivateCustomMode={handleDeactivateCustomMode}
              cantonData={cantonData!}
              userData={user}
              configMode={configMode}
              configProfile={configProfile}
              profileCategories={profileCategories}
              onCreateProfileCategory={handleCreateProfileCategory}
              onEditProfileCategory={handleEditProfileCategory}
              onDeleteProfileCategory={handleDeleteProfileCategory}
            />
          )}
          <FurtherEmploymentInput
            userCategories={userCategories}
            onEditCategory={handleEditCategory}
            onCreateCategory={handleCreateCategory}
            onDeleteCategory={handleDeleteCategory}
          />
          <LicenseOverview />
          <Informations />
          <LogoutButton />
          <DeleteAccount onDeleteAccount={handleDeleteAccount} />
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...LayoutStyles.container,
    paddingTop: Spacing.lg,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: Spacing.xxl,
  },
  buttonContainer: {
    padding: Spacing.lg,
    backgroundColor: "transparent",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    width: 200,
  },
  settingsItem: {
    marginTop: Spacing.md,
  }
});
