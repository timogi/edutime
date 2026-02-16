import React, { useEffect, useState } from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import "@/global.css";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@/gluestack-ui.config";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { ActivityIndicator, View, Platform } from "react-native";

import { useColorScheme } from "@/hooks/useColorScheme";
import UserProvider from "../contexts/UserContext";
import "@/lib/i18n/i18n";
import { useTranslation } from "react-i18next";
import { StopWatchProvider } from "@/contexts/StopWatchContext";
import { ReactQueryProvider } from "@/lib/react-query";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthRefreshWrapper } from "@/components/AuthRefreshWrapper";
import { KeyboardHandler } from "@/components/KeyboardHandler";
import { ToastContainer } from "@/components/ui/Toast";
import { DateRangeProvider } from "@/contexts/DateRangeContext";

SplashScreen.preventAutoHideAsync();


export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <ReactQueryProvider>
        <UserProvider>
          <DateRangeProvider>
            <GluestackUIProvider config={config}>
              <ThemeProvider
                value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
              >
                <StopWatchProvider>
                  <AuthRefreshWrapper>
                    <RootLayoutNav />
                    <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
                    <ToastContainer />
                  </AuthRefreshWrapper>
                </StopWatchProvider>
              </ThemeProvider>
            </GluestackUIProvider>
          </DateRangeProvider>
        </UserProvider>
      </ReactQueryProvider>
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();

  return (
    <KeyboardHandler>
      <Stack>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />

        <Stack.Screen
          name="record-form"
          options={({
            route,
          }: {
            route: { params?: { title?: string } };
          }) => ({
            presentation: "modal",
            headerTransparent: true,
            headerShadowVisible: false,
            ...(Platform.OS === "ios" ? { headerBlurEffect: "systemMaterial" as const } : {}),
            headerShown: Platform.OS === "ios",
            title: Platform.OS === "ios" 
              ? (route.params?.title ? route.params?.title : t("Index.createEntry"))
              : undefined,
            headerStyle: {
              backgroundColor: "transparent",
            },
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontSize: 17,
              fontWeight: "600",
              color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
            },
            headerBackVisible: false,
            headerLeft: () => null,
            headerLeftContainerStyle: { paddingLeft: 16 },
            headerRightContainerStyle: { paddingRight: 16 },
          })}
        />

        <Stack.Screen name="no-license" options={{ headerShown: false }} />
        <Stack.Screen name="update-required" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </KeyboardHandler>
  );
}

