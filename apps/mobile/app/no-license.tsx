import { StyleSheet, View, Image, ActivityIndicator, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { Button, ButtonText, Text, VStack, Alert, AlertIcon, AlertText } from "@gluestack-ui/themed";
import { Redirect } from "expo-router";
// import { InfoIcon } from "@/components/ui/Icon";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ThemedText } from "@/components/ThemedText";
import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "react-i18next";
import { getMemberships, updateMembership } from "@/lib/database/organization";
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

  const [memberships, setMemberships] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleReloadSubscription = async () => {
    await reloadSubscription();
    await loadMemberships();
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
          {/* Brand & icon */}
          <VStack space="lg" style={styles.content}>
            <ThemedText style={styles.brand}>edutime.ch</ThemedText>

            <View style={[styles.iconContainer, { borderColor: theme.gray[2] }]}>
              <Image source={require("@/assets/images/icon.png")} style={styles.appIcon} />
            </View>

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
              <Button
                size="lg"
                variant="solid"
                action="secondary"
                onPress={handleReloadSubscription}
                style={styles.reloadBtn}
              >
                <IconSymbol name="arrow.clockwise" size={20} color="white" />
                <ButtonText style={styles.reloadText}>{t("Index.refresh")}</ButtonText>
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
    borderRadius: BorderRadius.xxl,
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    ...cardShadow,
  },
  content: {
    alignItems: "center",
  },
  brand: {
    ...TextStyles.title,
    fontSize: 26,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 24,
    marginTop: 4,
    marginBottom: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
  appIcon: {
    width: "100%",
    height: "100%",
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
  reloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 24,
    width: "100%",
  },
  reloadText: {},
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