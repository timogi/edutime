import { Stack } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "@/hooks/useColorScheme";
import { themeForScheme } from "@/constants/Colors";

export default function SettingsStackLayout() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const theme = themeForScheme(colorScheme);

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleStyle: {
          fontWeight: "600",
          fontSize: 17,
          color: theme.text,
        },
        headerTintColor: theme.primary[5],
        headerStyle: { backgroundColor: theme.background },
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="employment"
        options={{ title: t("Settings.employment") }}
      />
      <Stack.Screen
        name="additional-tasks"
        options={{ title: t("Settings.furtherEmployment") }}
      />
      <Stack.Screen name="license" options={{ title: t("Settings.license") }} />
      <Stack.Screen
        name="information"
        options={{ title: t("Settings.information") }}
      />
      <Stack.Screen name="account" options={{ title: t("Settings.account") }} />
    </Stack>
  );
}
