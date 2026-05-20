import React, { useEffect } from "react";
import { ActivityIndicator, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { EmploymentInput } from "@/components/settings/EmploymentInput";
import { useUser } from "@/contexts/UserContext";
import { useSettingsActions } from "@/hooks/useSettingsActions";
import { Spacing, LayoutStyles } from "@/constants/Styles";
import { useColorScheme } from "@/hooks/useColorScheme";
import { themeForScheme } from "@/constants/Colors";
import { useTranslation } from "react-i18next";
import { useSettingsDataQuery } from "@/hooks/useSettingsDataQuery";
import { showToast } from "@/components/ui/Toast";

export default function EmploymentSettingsScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const theme = themeForScheme(colorScheme);
  const {
    user,
  } = useUser();
  const settingsDataQuery = useSettingsDataQuery(user);
  const {
    handleSaveEmployment,
    handleSaveCustom,
    handleActivateCustomMode,
    handleDeactivateCustomMode,
    handleCantonChange,
    handleCreateProfileCategory,
    handleEditProfileCategory,
    handleDeleteProfileCategory,
  } = useSettingsActions();

  useEffect(() => {
    if (!settingsDataQuery.error) return;
    showToast({
      type: "error",
      title: t("Index.error"),
      message: t("Settings.loadFailed"),
    });
  }, [settingsDataQuery.error, t]);

  const configMode = settingsDataQuery.data?.configMode ?? "default";
  const cantonData = settingsDataQuery.data?.cantonData ?? null;
  const configProfile = settingsDataQuery.data?.configProfile ?? null;
  const profileCategories = settingsDataQuery.data?.profileCategories ?? [];

  /** Kanton-Modus: Payload kommt async — nicht als «nicht verfügbar» flackern lassen. */
  const awaitingCantonPayload =
    settingsDataQuery.isLoading || (configMode === "default" && Boolean(user?.canton_code) && !cantonData);

  const showEditor = Boolean(cantonData || configMode === "custom");

  if (awaitingCantonPayload) {
    return (
      <SafeAreaView
        style={[styles.safe, { backgroundColor: theme.background }]}
        edges={["bottom", "left", "right"]}
      >
        <ThemedView style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary[5]} />
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (!showEditor) {
    return (
      <SafeAreaView
        style={[styles.safe, { backgroundColor: theme.background }]}
        edges={["bottom", "left", "right"]}
      >
        <ThemedView style={styles.centered}>
          <ThemedText type="subtitle" style={styles.muted}>
            {t("Settings.employmentUnavailable")}
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

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
  centered: {
    ...LayoutStyles.centered,
    padding: Spacing.lg,
  },
  muted: {
    opacity: 0.8,
    textAlign: "center",
  },
});
