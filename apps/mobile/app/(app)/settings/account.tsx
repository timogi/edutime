import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { VStack } from "@gluestack-ui/themed";
import { ThemedView } from "@/components/ThemedView";
import { DeleteAccount } from "@/components/settings/DeleteAccount";
import { LogoutButton } from "@/components/settings/LogoutButton";
import { useSettingsActions } from "@/hooks/useSettingsActions";
import { Spacing } from "@/constants/Styles";
import { useColorScheme } from "@/hooks/useColorScheme";
import { themeForScheme } from "@/constants/Colors";

export default function AccountSettingsScreen() {
  const colorScheme = useColorScheme();
  const theme = themeForScheme(colorScheme);
  const { handleDeleteAccount } = useSettingsActions();

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.background }]}
      edges={["bottom", "left", "right"]}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedView style={styles.inner}>
          <VStack space="md" style={styles.stack}>
            <LogoutButton />
            <DeleteAccount onDeleteAccount={handleDeleteAccount} />
          </VStack>
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
    width: "100%",
  },
  stack: {
    width: "100%",
    alignItems: "center",
  },
});
