import React from "react";
import { Linking, Platform, StyleSheet } from "react-native";
import { VStack } from "@gluestack-ui/themed";
import { useTranslation } from "react-i18next";
import Constants from "expo-constants";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { SettingsRow } from "@/components/settings/SettingsRow";
import { Spacing } from "@/constants/Styles";

const DOCUMENT_LINKS = {
  privacy: "https://edutime.ch/docs/privacy",
  terms: "https://edutime.ch/docs/terms",
  agb: "https://edutime.ch/docs/agb",
  imprint: "https://edutime.ch/docs/imprint",
} as const;

export default function Informations() {
  const { t } = useTranslation();

  const openExternalUrl = (url: string) => {
    Linking.openURL(url).catch((error: unknown) => {
      console.error("Failed to open external URL:", error);
    });
  };

  const handleEmailPress = () => {
    openExternalUrl(
      `mailto:info@edutime.ch?body=\n\n\n------------------\nApp Information:\nPlatform: ${Platform.OS}\nVersion: ${Constants.expoConfig?.version}`
    );
  };

  return (
    <VStack style={styles.wrapper}>
      <SettingsSection title={t("Settings.documents")}>
        <SettingsRow
          title={t("Settings.privacy")}
          icon="shield"
          isFirst
          onPress={() => openExternalUrl(DOCUMENT_LINKS.privacy)}
        />
        <SettingsRow
          title={t("Settings.termsOfService")}
          icon="doc.text"
          onPress={() => openExternalUrl(DOCUMENT_LINKS.terms)}
        />
        <SettingsRow
          title={t("Settings.agb")}
          icon="doc.text"
          onPress={() => openExternalUrl(DOCUMENT_LINKS.agb)}
        />
        <SettingsRow
          title={t("Settings.imprint")}
          icon="doc.text"
          onPress={() => openExternalUrl(DOCUMENT_LINKS.imprint)}
        />
        <SettingsRow
          title={t("Settings.contact")}
          icon="envelope"
          onPress={handleEmailPress}
        />
      </SettingsSection>
    </VStack>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    paddingTop: Spacing.md,
  },
});
