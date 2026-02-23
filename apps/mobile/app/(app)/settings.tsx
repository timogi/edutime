import React, { useState, useCallback } from "react";
import { StyleSheet, ScrollView, RefreshControl } from "react-native";
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
import { updateUserData } from "@/lib/database/user";
import { createUserCategory, updateUserCategory, deleteUserCategory } from "@/lib/database/user_categories";
import { deleteAccount } from "@/lib/database/user";
import { createUserCustomTarget, updateUserCustomTarget } from "@/lib/database/user_custom_targets";
import { Database } from "@edutime/shared";
import { Spacing, LayoutStyles } from "@/constants/Styles";
import { EmploymentCategory } from "@/lib/types";

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
  const { userEmail, user, userCategories, cantonData, refreshUserData, logout } = useUser();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshUserData();
    setRefreshing(false);
  }, [refreshUserData]);

  const saveConfigurablePercentages = useCallback(async (userPercentages: {[key: number]: number}, cantonData: any) => {
    if (!user?.user_id) return;
    
    try {
      for (const [categorySetId, userPercentage] of Object.entries(userPercentages)) {
        const existingCategorySet = cantonData?.category_sets.find(
          (cs: any) => cs.id === Number(categorySetId),
        );
        const numericUserPercentage =
          typeof userPercentage === 'string' ? parseFloat(userPercentage) : userPercentage;

        if (
          existingCategorySet &&
          existingCategorySet.user_percentage !== null &&
          existingCategorySet.user_percentage_id !== null
        ) {
          // Update existing percentage using the user_percentage_id
          await updateUserCustomTarget(
            existingCategorySet.user_percentage_id,
            numericUserPercentage as number,
          );
        } else {
          // Create a new custom target
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
      const userData: any = { workload, canton_code: canton };
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
      
      // Save configurable percentages if canton is configurable and percentages are provided
      if (cantonData?.is_configurable && userPercentages && cantonData) {
        await saveConfigurablePercentages(userPercentages, cantonData);
      }
      
      // Refresh user data to get updated canton data with new percentages
      await refreshUserData();
    } catch (error) {
      console.error('Error saving employment:', error);
    }
  };

  const handleCantonChange = async (newCanton: string) => {
    if (!user?.user_id) return;
    try {
      // Update the canton in the database
      await updateUserData(user.user_id, { canton_code: newCanton });
      // Refresh user data to get updated canton data
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
        color: category.color || '#845ef7', // Default color if null
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
        color: categoryWithoutId.color || '#845ef7', // Default color if null
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

  const handleDeleteAccount = async (password: string) => {
    if (!user?.user_id || !userEmail) {
      throw new Error('User not found');
    }

    try {
      await deleteUserAccount(user.user_id, password, userEmail);
      // The deleteAccount function now handles signing out the user
      // We need to call logout to update the UserContext state
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
          {cantonData && (
            <EmploymentInput
              onSave={handleSaveEmployment}
              onCantonChange={handleCantonChange}
              cantonData={cantonData}
              userData={user}
            />
          )}
          <FurtherEmploymentInput
            userCategories={userCategories}
            onEditCategory={handleEditCategory}
            onCreateCategory={handleCreateCategory}
            onDeleteCategory={handleDeleteCategory}
          />
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
