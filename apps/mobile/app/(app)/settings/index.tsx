import React, { useCallback, useState } from "react";
import { ScrollView, RefreshControl, StyleSheet } from "react-native";
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

export default function SettingsIndexScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { refreshUserData, userEmail, cantonData, configMode } = useUser();
  const colorScheme = useColorScheme();
  const theme = themeForScheme(colorScheme);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshUserData();
    setRefreshing(false);
  }, [refreshUserData]);

  const showEmployment = Boolean(cantonData || configMode === "custom");

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
            <SettingsSection title={t("Settings.groupWork")}>
              {showEmployment ? (
                <SettingsRow
                  title={t("Settings.employment")}
                  icon="hourglass.tophalf.filled"
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
                title={t("Settings.information")}
                icon="shield"
                onPress={() => router.push("/settings/information")}
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
});
