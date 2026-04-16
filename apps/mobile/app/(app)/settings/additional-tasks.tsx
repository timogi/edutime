import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView } from "@/components/ThemedView";
import { FurtherEmploymentInput } from "@/components/settings/FurtherEmploymentInput";
import { useUser } from "@/contexts/UserContext";
import { useSettingsActions } from "@/hooks/useSettingsActions";
import { Spacing } from "@/constants/Styles";
import { useColorScheme } from "@/hooks/useColorScheme";
import { themeForScheme } from "@/constants/Colors";

export default function AdditionalTasksSettingsScreen() {
  const colorScheme = useColorScheme();
  const theme = themeForScheme(colorScheme);
  const { userCategories } = useUser();
  const {
    handleEditCategory,
    handleCreateCategory,
    handleDeleteCategory,
  } = useSettingsActions();

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
          <FurtherEmploymentInput
            userCategories={userCategories}
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
