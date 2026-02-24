import { StyleSheet, View, ActivityIndicator, Platform, ScrollView, Linking, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { Button, ButtonText, Text, VStack, Alert, AlertText } from "@gluestack-ui/themed";
import { Redirect } from "expo-router";
// import { InfoIcon } from "@/components/ui/Icon";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ThemedText } from "@/components/ThemedText";
import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "react-i18next";
import { getMemberships, updateMembership } from "@/lib/database/organization";
import { Membership } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { hasEverHadTrial } from "@edutime/shared";
import { showErrorToast, showSuccessToast } from "@/components/ui/Toast";
import { HapticFeedback } from "@/lib/haptics";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { TextStyles, Spacing, BorderRadius, ShadowStyles, LayoutStyles } from "@/constants/Styles";



export default function NotSubscribedScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const {
    logout,
    user,
    hasActiveSubscription,
    userEmail,
    isLoading: userLoading,
    reloadSubscription,
  } = useUser();

  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingDemo, setIsStartingDemo] = useState(false);
  const [hasUsedDemo, setHasUsedDemo] = useState<boolean | null>(null);

  // ────────────────────────────────────────────────────────────
  // Data helpers
  // ────────────────────────────────────────────────────────────

  const loadMemberships = async () => {
    if (!userEmail) return;
    const data = await getMemberships(userEmail);
    setMemberships(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadMemberships();
  }, [userEmail]);

  useEffect(() => {
    const checkTrialStatus = async () => {
      if (!user?.user_id) return;
      try {
        const hasTrial = await hasEverHadTrial(supabase, user.user_id);
        setHasUsedDemo(hasTrial);
      } catch (error) {
        console.error("Error checking trial status:", error);
        setHasUsedDemo(false);
      }
    };

    checkTrialStatus();
  }, [user?.user_id]);

  const handleReloadSubscription = async () => {
    await reloadSubscription();
    await loadMemberships();
  };

  const handleStartDemo = async () => {
    if (!user?.user_id || isStartingDemo) return;

    HapticFeedback.light();
    setIsStartingDemo(true);
    try {
      const { error } = await supabase.schema("license").rpc("start_demo");
      if (error) throw error;

      setHasUsedDemo(true);
      await reloadSubscription();
      HapticFeedback.success();
      showSuccessToast(t("Index.toastSuccess"), t("Index.demo-started-message"));
    } catch (error) {
      console.error("Error starting demo:", error);
      HapticFeedback.error();
      showErrorToast(
        t("Index.toastError"),
        error instanceof Error ? error.message : t("Index.demo-start-failed"),
      );
    } finally {
      setIsStartingDemo(false);
    }
  };

  const handleManageAccount = async () => {
    HapticFeedback.light();
    try {
      await Linking.openURL("https://edutime.ch/app");
    } catch (error) {
      console.error("Error opening web app:", error);
      HapticFeedback.error();
      showErrorToast(t("Index.toastError"), t("Index.pleaseTryAgain"));
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleAcceptMembership = async (organizationId: number) => {
    if (!userEmail) return;
    await updateMembership(organizationId, userEmail, "active");
    await loadMemberships();
    await reloadSubscription();
  };

  const handleDeclineMembership = async (organizationId: number) => {
    if (!userEmail) return;
    await updateMembership(organizationId, userEmail, "rejected");
    await loadMemberships();
  };

  // ────────────────────────────────────────────────────────────
  // Guard clauses
  // ────────────────────────────────────────────────────────────

  if (userLoading || isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) return <Redirect href="/(auth)/login" />;
  if (hasActiveSubscription) return <Redirect href="/(app)" />;

  const pendingMemberships = memberships.filter(m => m.status === "invited");

  // ────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "right", "left", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, colorScheme === 'dark' && { backgroundColor: theme.gray[9] }]}>
          <Button
            size="sm"
            variant="outline"
            onPress={handleReloadSubscription}
            style={[styles.openWebAppBtn, { borderColor: theme.primary[6] }]}
          >
            <IconSymbol name="arrow.clockwise" size={18} color={theme.primary[6]} />
          </Button>

          {/* Brand & icon */}
          <VStack space="lg" style={styles.content}>
            <ThemedText style={styles.brand}>edutime.ch</ThemedText>

            <Image source={require("../assets/images/logo.png")} style={styles.logoImage} />

            {/* License alert */}
            <Alert action="info" variant="solid" style={styles.alert}>
              {/* <AlertIcon as={InfoIcon} /> */}
              <AlertText style={styles.alertText}>{t("Index.no-license")}</AlertText>
              <AlertText style={styles.subtitle}>{t("Index.license-required")}</AlertText>
            </Alert>

            
          </VStack>

          {/* Pending memberships */}
          {pendingMemberships.length > 0 && (
            <VStack space="md" style={styles.membershipsContainer}>
              <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? theme.gray[2] : theme.gray[8] }]}>
                {t("Index.pending-memberships")}
              </Text>

              {pendingMemberships.map((m) => (
                <View key={m.id} style={[styles.membershipRow, { borderBottomColor: colorScheme === 'dark' ? theme.gray[2] : theme.gray[8] }]}>
                  <Text style={[styles.organizationName, { color: colorScheme === 'dark' ? theme.gray[2] : theme.gray[8] }]}>
                    {m.name}
                  </Text>
                  <View style={styles.buttonGroup}>
                    <Button
                      size="sm"
                      variant="solid"
                      onPress={() => handleAcceptMembership(m.id)}
                      style={styles.acceptButton}
                    >
                      <ButtonText style={styles.acceptText}>{t("Index.accept")}</ButtonText>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      action="negative"
                      onPress={() => handleDeclineMembership(m.id)}
                      style={styles.declineButton}
                    >
                      <ButtonText style={styles.declineText}>{t("Index.decline")}</ButtonText>
                    </Button>
                  </View>
                </View>
              ))}
            </VStack>
          )}

          {/* User email & global actions */}
          <VStack space="sm" style={styles.actionsWrapper}>
            <VStack space="md" style={styles.actions}>
              {hasUsedDemo === false && (
                <VStack space="xs">
                  <Button
                    size="lg"
                    variant="solid"
                    onPress={handleStartDemo}
                    style={styles.demoBtn}
                    isDisabled={isStartingDemo}
                  >
                    <IconSymbol name="play.fill" size={20} color="white" />
                    <ButtonText style={styles.demoText}>
                      {isStartingDemo ? t("Index.starting") : t("Index.start-demo")}
                    </ButtonText>
                  </Button>
                  <Text
                    style={[
                      styles.demoInfo,
                      { color: colorScheme === "dark" ? theme.gray[4] : theme.gray[6] },
                    ]}
                  >
                    {t("Index.demo-info")}
                  </Text>
                </VStack>
              )}
              <Button
                size="lg"
                variant="outline"
                onPress={handleManageAccount}
                style={[styles.manageAccountBtn, { borderColor: theme.primary[6] }]}
              >
                <IconSymbol name="arrow.up.right.square" size={20} color={theme.primary[6]} />
                <ButtonText style={[styles.manageAccountText, { color: theme.primary[6] }]}>
                  {t("Index.manage-account")}
                </ButtonText>
              </Button>
              <Text style={[styles.userEmail, { color: colorScheme === 'dark' ? theme.gray[2] : theme.gray[8] }]}>
                {userEmail}
              </Text>
              <Button size="lg" variant="solid" onPress={handleLogout} style={styles.logoutBtn}>
                <IconSymbol name="power" size={20} color="white" />
                <ButtonText style={styles.logoutText}>{t("Index.logout")}</ButtonText>
              </Button>
            </VStack>
          </VStack>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ────────────────────────────────────────────────────────────
// Styles
// ────────────────────────────────────────────────────────────

const cardShadow = Platform.select({
  ios: {
    shadowColor: undefined,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  android: {
    elevation: 4,
  },
});

const styles = StyleSheet.create({
  safeArea: {
    ...LayoutStyles.container,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
  centered: {
    ...LayoutStyles.centered,
  },
  card: {
    width: "92%",
    position: "relative",
    borderRadius: BorderRadius.xxl,
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    ...cardShadow,
  },
  openWebAppBtn: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    zIndex: 1,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
  },
  brand: {
    ...TextStyles.title,
    fontSize: 26,
  },
  logoImage: {
    width: 120,
    height: 120,
    marginTop: 4,
    marginBottom: 24,
  },
  alert: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "column",
    alignItems: "flex-start",
  },
  subtitle: {
    textAlign: "center",
    marginTop: 8,
  },
  sectionTitle: {
    ...TextStyles.subtitle,
    textAlign: "center",
  },
  membershipsContainer: {
    marginTop: 32,
  },
  membershipRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  organizationName: {
    flexShrink: 1,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 8,
  },
  acceptButton: {
    paddingHorizontal: 18,
  },
  acceptText: {},
  declineButton: {
    paddingHorizontal: 18,
  },
  declineText: {},
  actionsWrapper: {
    marginTop: 24,
    alignItems: "center",
  },
  userEmail: {
    ...TextStyles.small,
    fontSize: 13,
  },
  actions: {
    width: "100%",
    marginTop: 8,
  },
  demoBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 24,
    width: "100%",
  },
  demoText: {},
  demoInfo: {
    ...TextStyles.small,
    textAlign: "center",
  },
  manageAccountBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 24,
    width: "100%",
  },
  manageAccountText: {},
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 24,
    width: "100%",
  },
  logoutText: {},
  alertText: {
    ...TextStyles.body,
    fontWeight: "500",
  },
});