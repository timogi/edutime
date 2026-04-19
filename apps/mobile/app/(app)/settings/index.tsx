import React, { useCallback, useState } from "react";
import { ActivityIndicator, Linking, Platform, ScrollView, RefreshControl, StyleSheet } from "react-native";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { VStack } from "@gluestack-ui/themed";
import { ThemedView } from "@/components/ThemedView";
import SettingsHeader from "@/components/settings/SettingsHeader";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { SettingsRow } from "@/components/settings/SettingsRow";
import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "react-i18next";
import { Spacing, LayoutStyles } from "@/constants/Styles";
import { useColorScheme } from "@/hooks/useColorScheme";
import { themeForScheme } from "@/constants/Colors";
import { useSettingsDataQuery } from "@/hooks/useSettingsDataQuery";

export default function SettingsIndexScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { refreshUserData, userEmail, user } = useUser();
  const settingsDataQuery = useSettingsDataQuery(user);
  const colorScheme = useColorScheme();
  const theme = themeForScheme(colorScheme);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshUserData();
    setRefreshing(false);
  }, [refreshUserData]);

  const openExternalUrl = useCallback((url: string) => {
    Linking.openURL(url).catch((error: unknown) => {
      console.error("Failed to open external URL:", error);
    });
  }, []);

  const handleContactPress = useCallback(() => {
    openExternalUrl(
      `mailto:info@edutime.ch?body=\n\n\n------------------\nApp Information:\nPlatform: ${Platform.OS}\nVersion: ${Constants.expoConfig?.version}`
    );
  }, [openExternalUrl]);

  const showEmployment = Boolean(
    settingsDataQuery.data?.configMode === "custom" || settingsDataQuery.data?.cantonData
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={["top", "right", "left", "bottom"]}
    >
      <SettingsHeader />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ThemedView style={styles.inner}>
          <VStack space="lg" style={styles.stack}>
            {settingsDataQuery.isLoading ? (
              <ThemedView style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.primary[5]} />
              </ThemedView>
            ) : null}
            <SettingsSection title={t("Settings.groupWork")}>
              {showEmployment ? (
                <SettingsRow
                  title={t("Settings.employment")}
                  icon="slider.horizontal.3"
                  isFirst
                  onPress={() => router.push("/settings/employment")}
                />
              ) : null}
              <SettingsRow
                title={t("Settings.furtherEmployment")}
                icon="folder"
                isFirst={!showEmployment}
                onPress={() => router.push("/settings/additional-tasks")}
              />
            </SettingsSection>

            <SettingsSection title={t("Settings.groupApp")}>
              <SettingsRow
                title={t("Settings.license")}
                icon="doc.text"
                isFirst
                onPress={() => router.push("/settings/license")}
              />
              <SettingsRow
                title={t("Settings.documents")}
                icon="doc.text"
                onPress={() => router.push("/settings/information")}
              />
              <SettingsRow
                title={t("Settings.contact")}
                icon="envelope"
                onPress={handleContactPress}
              />
            </SettingsSection>

            <SettingsSection title={t("Settings.groupAccount")}>
              <SettingsRow
                title={t("Settings.account")}
                icon="envelope"
                subtitle={userEmail ?? undefined}
                isFirst
                onPress={() => router.push("/settings/account")}
              />
            </SettingsSection>
          </VStack>
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
  inner: {
    paddingVertical: Spacing.md,
    backgroundColor: "transparent",
    width: "100%",
  },
  stack: {
    width: "100%",
    paddingBottom: Spacing.lg,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
  },
});
