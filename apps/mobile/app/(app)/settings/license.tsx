import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView } from "@/components/ThemedView";
import LicenseOverview from "@/components/settings/LicenseOverview";
import { Spacing } from "@/constants/Styles";
import { useColorScheme } from "@/hooks/useColorScheme";
import { themeForScheme } from "@/constants/Colors";

export default function LicenseSettingsScreen() {
  const colorScheme = useColorScheme();
  const theme = themeForScheme(colorScheme);

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.background }]}
      edges={["bottom", "left", "right"]}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedView style={styles.inner}>
          <LicenseOverview />
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
    paddingVertical: Spacing.md,
    width: "100%",
  },
});
