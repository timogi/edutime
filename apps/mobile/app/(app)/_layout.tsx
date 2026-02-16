import { Tabs, Redirect } from "expo-router";
import React from "react";
import { Platform, View, ActivityIndicator } from "react-native";
import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useVersionCheck } from "@/lib/version-check";

const TabLayout = () => {
  const { user, hasActiveSubscription, isLoading } = useUser();
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const { isValid: isVersionValid, isLoading: isVersionLoading } = useVersionCheck();

  if (isLoading || isVersionLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isVersionValid === false) {
    return <Redirect href="/update-required" />;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!hasActiveSubscription) {
    return <Redirect href="/no-license" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colorScheme === "dark" ? "#ffffff" : "#000000",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      {/* Always include index, but disable it if no subscription */}
      <Tabs.Screen
        name="index"
        options={{
          title: t("Index.timeTracking"),
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="hourglass.tophalf.filled"
              color={color}
            />
          ),
          href: hasActiveSubscription ? undefined : null, // ⬅️ Disable if no subscription
        }}
      />

    <Tabs.Screen
        name="statistics"
        options={{
          title: t("Index.statistics"),
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="chart.bar.xaxis"
              color={color}
            />
          ),
          href: hasActiveSubscription ? undefined : null, // ⬅️ Disable if no subscription
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: t("Index.settings"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="gearshape.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
