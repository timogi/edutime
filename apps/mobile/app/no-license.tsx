import {
  StyleSheet,
  View,
  ActivityIndicator,
  Pressable,
  Image,
  Dimensions,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { Button, ButtonText, Text, VStack } from "@gluestack-ui/themed";
import { Redirect } from "expo-router";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ThemedText } from "@/components/ThemedText";
import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "react-i18next";
import { getMemberships } from "@/lib/database/organization";
import { Membership } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import {
  hasEverHadTrial,
  acceptOrgMemberInviteViaSupabase,
  rejectOrgMemberInviteViaSupabase,
} from "@edutime/shared";
import { showErrorToast, showSuccessToast } from "@/components/ui/Toast";
import { HapticFeedback } from "@/lib/haptics";
import { useColorScheme } from "@/hooks/useColorScheme";
import { themeForScheme } from "@/constants/Colors";
import { TextStyles, Spacing, BorderRadius, LayoutStyles } from "@/constants/Styles";
const windowHeight = Dimensions.get("window").height;

export default function NotSubscribedScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const theme = themeForScheme(colorScheme);
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [processingOrgId, setProcessingOrgId] = useState<number | null>(null);

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
    HapticFeedback.light();
    setIsRefreshing(true);
    try {
      await reloadSubscription();
      await loadMemberships();
      HapticFeedback.selection();
    } catch (error) {
      console.error("Error refreshing license state:", error);
      HapticFeedback.error();
      showErrorToast(t("Index.toastError"), t("Index.pleaseTryAgain"));
    } finally {
      setIsRefreshing(false);
    }
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

  const handleLogout = async () => {
    await logout();
  };

  const handleAcceptMembership = async (organizationId: number) => {
    if (!userEmail || processingOrgId != null) return;
    setProcessingOrgId(organizationId);
    HapticFeedback.light();
    try {
      await acceptOrgMemberInviteViaSupabase(supabase, organizationId);
      await loadMemberships();
      await reloadSubscription();
      HapticFeedback.success();
      showSuccessToast(t("Index.toastSuccess"), t("Index.invitation-accepted"));
    } catch (error) {
      console.error("Error accepting invitation:", error);
      HapticFeedback.error();
      showErrorToast(
        t("Index.toastError"),
        error instanceof Error ? error.message : t("Index.invitation-accept-failed"),
      );
    } finally {
      setProcessingOrgId(null);
    }
  };

  const handleDeclineMembership = async (organizationId: number) => {
    if (!userEmail || processingOrgId != null) return;
    setProcessingOrgId(organizationId);
    HapticFeedback.light();
    try {
      await rejectOrgMemberInviteViaSupabase(supabase, organizationId);
      await loadMemberships();
      HapticFeedback.success();
      showSuccessToast(t("Index.toastSuccess"), t("Index.invitation-rejected"));
    } catch (error) {
      console.error("Error declining invitation:", error);
      HapticFeedback.error();
      showErrorToast(
        t("Index.toastError"),
        error instanceof Error ? error.message : t("Index.invitation-reject-failed"),
      );
    } finally {
      setProcessingOrgId(null);
    }
  };

  if (userLoading || isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary[6]} />
      </View>
    );
  }

  if (!user) return <Redirect href="/(auth)/login" />;
  if (hasActiveSubscription) return <Redirect href="/(app)" />;

  const pendingMemberships = memberships.filter((m) => m.status === "invited");
  const inviteScrollMaxHeight = Math.round(windowHeight * 0.36);
  const surfaceMuted = colorScheme === "dark" ? theme.gray[8] : theme.gray[0];
  const borderSubtle = colorScheme === "dark" ? theme.gray[6] : theme.gray[3];
  const textPrimary = colorScheme === "dark" ? theme.gray[2] : theme.gray[8];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={["top", "right", "left", "bottom"]}>
      <View style={styles.root}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => void handleReloadSubscription()}
            disabled={isRefreshing}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={t("Index.refresh")}
            style={({ pressed }) => [
              styles.refreshPressable,
              {
                borderColor: theme.primary[6],
                backgroundColor: pressed || isRefreshing ? theme.primary[0] : "transparent",
                opacity: isRefreshing ? 0.85 : pressed ? 0.75 : 1,
              },
            ]}
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color={theme.primary[6]} />
            ) : (
              <IconSymbol name="arrow.clockwise" size={20} color={theme.primary[6]} />
            )}
          </Pressable>
        </View>

        <View style={styles.mainColumn}>
          <VStack space="md" style={styles.heroBlock}>
            <ThemedText style={styles.brand}>edutime.ch</ThemedText>
            <Image source={require("../assets/images/logo.png")} style={styles.logoImage} />
            <View
              style={[
                styles.noticeCard,
                {
                  backgroundColor: surfaceMuted,
                  borderLeftColor: theme.primary[6],
                  borderColor: borderSubtle,
                },
              ]}
            >
              <Text style={[styles.noticeTitle, { color: textPrimary }]}>{t("Index.no-license")}</Text>
              <Text style={[styles.noticeSubtitle, { color: theme.gray[6] }]}>{t("Index.license-required")}</Text>
            </View>
          </VStack>

          {pendingMemberships.length > 0 ? (
            <View style={[styles.invitesSection, styles.invitesSectionFlex]}>
              <Text style={[styles.sectionTitle, { color: textPrimary }]}>{t("Index.pending-memberships")}</Text>
              <ScrollView
                style={[styles.invitesScroll, { maxHeight: inviteScrollMaxHeight }]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                bounces={false}
              >
                <VStack space="md">
                  {pendingMemberships.map((m) => {
                    const busy = processingOrgId === m.id;
                    return (
                      <View
                        key={m.id}
                        style={[
                          styles.inviteCard,
                          {
                            backgroundColor: surfaceMuted,
                            borderColor: borderSubtle,
                          },
                        ]}
                      >
                        <Text style={[styles.organizationName, { color: textPrimary }]} numberOfLines={2}>
                          {m.name}
                        </Text>
                        {busy ? (
                          <View style={styles.inviteLoadingRow}>
                            <ActivityIndicator size="small" color={theme.primary[6]} />
                            <Text style={[styles.inviteLoadingLabel, { color: theme.gray[6] }]}>
                              {t("Index.loading")}
                            </Text>
                          </View>
                        ) : (
                          <View style={styles.inviteActions}>
                            <Button
                              size="md"
                              variant="solid"
                              onPress={() => void handleAcceptMembership(m.id)}
                              style={[styles.inviteBtnPrimary, { backgroundColor: theme.primary[6] }]}
                              isDisabled={processingOrgId !== null}
                            >
                              <ButtonText style={styles.inviteBtnPrimaryText}>{t("Index.accept")}</ButtonText>
                            </Button>
                            <Button
                              size="md"
                              variant="outline"
                              action="negative"
                              onPress={() => void handleDeclineMembership(m.id)}
                              style={[styles.inviteBtnOutline, { borderColor: theme.red[6] }]}
                              isDisabled={processingOrgId !== null}
                            >
                              <ButtonText style={[styles.inviteBtnOutlineText, { color: theme.red[6] }]}>
                                {t("Index.decline")}
                              </ButtonText>
                            </Button>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </VStack>
              </ScrollView>
            </View>
          ) : (
            <View style={styles.invitesSpacer} />
          )}

          <VStack space="md" style={styles.footerBlock}>
            {hasUsedDemo === false && (
              <VStack space="xs">
                <Button
                  size="lg"
                  variant="solid"
                  onPress={handleStartDemo}
                  style={[styles.demoBtn, { backgroundColor: theme.primary[6] }]}
                  isDisabled={isStartingDemo}
                >
                  <IconSymbol name="play.fill" size={20} color="white" />
                  <ButtonText style={styles.demoText}>
                    {isStartingDemo ? t("Index.starting") : t("Index.start-demo")}
                  </ButtonText>
                </Button>
                <Text style={[styles.demoInfo, { color: theme.gray[6] }]}>{t("Index.demo-info")}</Text>
              </VStack>
            )}
            <Text style={[styles.userEmail, { color: theme.gray[6] }]}>{userEmail}</Text>
            <Button size="lg" variant="solid" onPress={handleLogout} style={[styles.logoutBtn, { backgroundColor: theme.gray[7] }]}>
              <IconSymbol name="power" size={20} color="white" />
              <ButtonText style={styles.logoutText}>{t("Index.logout")}</ButtonText>
            </Button>
          </VStack>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  root: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
    minHeight: 48,
  },
  refreshPressable: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  mainColumn: {
    flex: 1,
    justifyContent: "space-between",
    minHeight: 0,
  },
  heroBlock: {
    alignItems: "center",
    flexShrink: 0,
  },
  brand: {
    ...TextStyles.title,
    fontSize: 22,
    letterSpacing: 0.3,
  },
  logoImage: {
    width: 88,
    height: 88,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  noticeCard: {
    width: "100%",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderLeftWidth: 4,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  noticeTitle: {
    ...TextStyles.subtitle,
    fontSize: 17,
  },
  noticeSubtitle: {
    ...TextStyles.small,
    marginTop: Spacing.xs,
    lineHeight: 20,
  },
  invitesSection: {
    flexShrink: 1,
    minHeight: 0,
    marginTop: Spacing.md,
    width: "100%",
  },
  invitesSectionFlex: {
    flex: 1,
  },
  invitesScroll: {
    marginTop: Spacing.sm,
  },
  invitesSpacer: {
    flex: 1,
    minHeight: Spacing.md,
  },
  sectionTitle: {
    ...TextStyles.subtitle,
    fontSize: 16,
    textAlign: "left",
  },
  inviteCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  organizationName: {
    ...TextStyles.body,
    fontWeight: "600",
    fontSize: 17,
  },
  inviteLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
  },
  inviteLoadingLabel: {
    ...TextStyles.small,
  },
  inviteActions: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  inviteBtnPrimary: {
    flex: 1,
    minHeight: 44,
    justifyContent: "center",
  },
  inviteBtnPrimaryText: {
    color: "#fff",
    fontWeight: "600",
  },
  inviteBtnOutline: {
    flex: 1,
    minHeight: 44,
    justifyContent: "center",
    borderWidth: 1.5,
  },
  inviteBtnOutlineText: {
    fontWeight: "600",
  },
  footerBlock: {
    width: "100%",
    paddingBottom: Spacing.md,
    flexShrink: 0,
  },
  userEmail: {
    ...TextStyles.small,
    fontSize: 13,
    textAlign: "center",
  },
  demoBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    width: "100%",
  },
  demoText: {
    color: "#fff",
    fontWeight: "600",
  },
  demoInfo: {
    ...TextStyles.small,
    textAlign: "center",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    width: "100%",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "600",
  },
  centered: {
    ...LayoutStyles.centered,
  },
});
