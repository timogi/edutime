import React, { useEffect } from "react";
import { ActivityIndicator, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView } from "@/components/ThemedView";
import { FurtherEmploymentInput } from "@/components/settings/FurtherEmploymentInput";
import { useUser } from "@/contexts/UserContext";
import { useSettingsActions } from "@/hooks/useSettingsActions";
import { Spacing } from "@/constants/Styles";
import { useColorScheme } from "@/hooks/useColorScheme";
import { themeForScheme } from "@/constants/Colors";
import { useSettingsDataQuery } from "@/hooks/useSettingsDataQuery";
import { showToast } from "@/components/ui/Toast";
import { useTranslation } from "react-i18next";

export default function AdditionalTasksSettingsScreen() {
  const colorScheme = useColorScheme();
  const theme = themeForScheme(colorScheme);
  const { t } = useTranslation();
  const { user } = useUser();
  const settingsDataQuery = useSettingsDataQuery(user);
  const {
    handleEditCategory,
    handleCreateCategory,
    handleDeleteCategory,
  } = useSettingsActions();

  useEffect(() => {
    if (!settingsDataQuery.error) return;
    showToast({
      type: "error",
      title: t("Index.error"),
      message: t("Settings.loadFailed"),
    });
  }, [settingsDataQuery.error, t]);

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.background }]}
      edges={["bottom", "left", "right"]}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedView style={styles.inner}>
          {settingsDataQuery.isLoading ? (
            <ActivityIndicator size="small" color={theme.primary[5]} />
          ) : null}
          <FurtherEmploymentInput
            userCategories={settingsDataQuery.data?.userCategories ?? []}
            onEditCategory={handleEditCategory}
            onCreateCategory={handleCreateCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: Spacing.xxl,
  },
  inner: {
    padding: Spacing.lg,
    alignItems: "center",
    width: "100%",
  },
});
