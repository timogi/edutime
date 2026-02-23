import { useState } from "react";
import { StyleSheet, View, ScrollView, Linking, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, ButtonText, VStack, Text } from "@gluestack-ui/themed";
import { Redirect, useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { TextStyles, Spacing, BorderRadius, LayoutStyles } from "@/constants/Styles";
import { useLegalCheck, useInvalidateLegalCheck } from "@/hooks/useLegalCheck";
import { acceptUserDocument, DOCUMENT_LABELS, type MissingDocument } from "@edutime/shared";
import { supabase } from "@/lib/supabase";
import { HapticFeedback } from "@/lib/haptics";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const DOCUMENT_URLS: Record<string, string> = {
  privacy_policy: "https://edutime.ch/docs/privacy",
  terms_of_use: "https://edutime.ch/docs/terms",
  saas_agb: "https://edutime.ch/docs/agb",
};

export default function LegalAcceptanceScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const { user, isLoading: userLoading } = useUser();
  const { data: missingDocs, isLoading: legalLoading } = useLegalCheck(!!user);
  const invalidateLegal = useInvalidateLegalCheck();
  const router = useRouter();

  const [acceptedDocs, setAcceptedDocs] = useState<Set<string>>(new Set());
  const [accepting, setAccepting] = useState(false);

  if (userLoading || legalLoading) {
    return (
      <View style={LayoutStyles.centered}>
        <Text>{t("Index.loading")}</Text>
      </View>
    );
  }

  if (!user) return <Redirect href="/(auth)/login" />;
  if (!accepting && (!missingDocs || missingDocs.length === 0)) {
    return <Redirect href="/(app)" />;
  }

  const docs = missingDocs ?? [];

  const toggleDoc = (code: string) => {
    HapticFeedback.selection();
    setAcceptedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  const allAccepted = docs.every(
    (doc: MissingDocument) => acceptedDocs.has(doc.code) || !doc.can_accept,
  );

  const handleAcceptAndContinue = async () => {
    HapticFeedback.medium();
    const toAccept = docs.filter(
      (doc: MissingDocument) => acceptedDocs.has(doc.code) && doc.can_accept,
    );
    if (toAccept.length === 0) return;

    setAccepting(true);
    try {
      for (const doc of toAccept) {
        try {
          await acceptUserDocument(supabase, doc.code, Platform.OS === "ios" ? "ios" : "android");
        } catch (error) {
          console.error(`Error accepting document ${doc.code}:`, error);
        }
      }
      HapticFeedback.success();
      await invalidateLegal();
      router.replace("/(app)");
    } catch (error) {
      console.error("Error accepting documents:", error);
    } finally {
      setAccepting(false);
    }
  };

  const openDocument = (code: string) => {
    HapticFeedback.light();
    const url = DOCUMENT_URLS[code];
    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "right", "left", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: colorScheme === "dark" ? theme.gray[9] : undefined }]}>
          <VStack space="lg" style={styles.content}>
            <ThemedText style={styles.title}>{t("Legal.title")}</ThemedText>
            <Text style={[styles.description, { color: theme.gray[6] }]}>
              {t("Legal.description")}
            </Text>

            <VStack space="md" style={styles.docList}>
              {docs.map((doc: MissingDocument) => (
                <View
                  key={doc.code}
                  style={[styles.docCard, { borderColor: theme.gray[3], backgroundColor: colorScheme === "dark" ? theme.gray[8] : theme.gray[0] }]}
                >
                  <View style={styles.docHeader}>
                    <Text style={[styles.docTitle, { color: theme.text }]}>
                      {DOCUMENT_LABELS[doc.code] || doc.title}
                    </Text>
                    {doc.version_label && (
                      <Text style={[styles.docVersion, { color: theme.gray[5] }]}>
                        {doc.version_label}
                      </Text>
                    )}
                  </View>

                  {DOCUMENT_URLS[doc.code] && (
                    <Pressable
                      onPress={() => openDocument(doc.code)}
                      style={styles.openLink}
                    >
                      <Ionicons name="open-outline" size={14} color={theme.primary[5]} />
                      <Text style={[styles.openLinkText, { color: theme.primary[5] }]}>
                        {t("Legal.openDocument")}
                      </Text>
                    </Pressable>
                  )}

                  {doc.can_accept ? (
                    <Pressable
                      onPress={() => toggleDoc(doc.code)}
                      style={styles.checkboxRow}
                      disabled={accepting}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          { borderColor: theme.gray[4] },
                          acceptedDocs.has(doc.code) && {
                            backgroundColor: theme.primary[5],
                            borderColor: theme.primary[5],
                          },
                        ]}
                      >
                        {acceptedDocs.has(doc.code) && (
                          <Ionicons name="checkmark" size={14} color="#fff" />
                        )}
                      </View>
                      <Text style={[styles.checkboxLabel, { color: theme.text }]}>
                        {t("Legal.iAccept")} {DOCUMENT_LABELS[doc.code] || doc.title}
                      </Text>
                    </Pressable>
                  ) : (
                    <Text style={[styles.cannotAccept, { color: theme.gray[5] }]}>
                      {t("Legal.cannotAccept")}
                    </Text>
                  )}
                </View>
              ))}
            </VStack>

            <Button
              size="lg"
              variant="solid"
              onPress={handleAcceptAndContinue}
              isDisabled={!allAccepted || accepting}
              style={styles.acceptBtn}
            >
              <ButtonText>
                {accepting ? t("Index.loading") : t("Legal.acceptAndContinue")}
              </ButtonText>
            </Button>
          </VStack>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const cardShadow = Platform.select({
  ios: {
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
  title: {
    ...TextStyles.title,
    textAlign: "center",
  },
  description: {
    ...TextStyles.body,
    textAlign: "center",
  },
  docList: {
    width: "100%",
  },
  docCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  docHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  docTitle: {
    ...TextStyles.body,
    fontWeight: "600",
    flex: 1,
  },
  docVersion: {
    ...TextStyles.small,
    marginLeft: Spacing.sm,
  },
  openLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: Spacing.sm,
  },
  openLinkText: {
    ...TextStyles.small,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxLabel: {
    ...TextStyles.small,
    flex: 1,
  },
  cannotAccept: {
    ...TextStyles.small,
    marginTop: Spacing.xs,
  },
  acceptBtn: {
    width: "100%",
    marginTop: Spacing.md,
  },
});
