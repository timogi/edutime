import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, ButtonText } from "@gluestack-ui/themed";
import { Spacing } from "@/constants/Styles";
import { useTranslation } from "react-i18next";
import { CreateTimerRecordButton } from "@/components/CreateTimerRecordButton";

interface FooterButtonsProps {
  isEditing: boolean;
  stopwatchSessionId: string | undefined;
  onDelete: () => void;
  onSubmit: () => void;
  onCreateAndRestart: () => Promise<void>;
  onSaveAndContinue: () => Promise<void>;
  loading: boolean;
  colorScheme: string | null | undefined;
  theme: any;
}

export function FooterButtons({
  isEditing,
  stopwatchSessionId,
  onDelete,
  onSubmit,
  onCreateAndRestart,
  onSaveAndContinue,
  loading,
  colorScheme,
  theme,
}: FooterButtonsProps) {
  const { t } = useTranslation();

  return (
    <View
      style={[
        styles.footer,
        {
          backgroundColor:
            colorScheme === "dark" ? theme.gray[9] : "white",
          borderColor: colorScheme === "dark" ? theme.gray[6] : "#ccc",
        },
      ]}
    >
      {/* DELETE/DISCARD BUTTON (only if editing or timer) */}
      {(isEditing || stopwatchSessionId) && (
        <View style={styles.footerButtonContainer}>
          <Button
            size="md"
            action="negative"
            style={styles.footerButton}
            onPress={onDelete}
            pressRetentionOffset={{
              top: 50,
              left: 50,
              right: 50,
              bottom: 50,
            }}
          >
            <ButtonText style={{ color: "white" }}>
              {stopwatchSessionId
                ? t("Index.discard")
                : t("Index.delete")}
            </ButtonText>
          </Button>
        </View>
      )}

      {/* SAVE BUTTON */}
      <View
        style={[
          styles.footerButtonContainer,
          !isEditing &&
            !stopwatchSessionId &&
            styles.footerButtonContainerFull,
        ]}
      >
        {stopwatchSessionId ? (
          <CreateTimerRecordButton
            onCreateAndRestart={onCreateAndRestart}
            onSaveAndContinue={onSaveAndContinue}
            onPress={onSubmit}
          >
            {t("Index.create")}
          </CreateTimerRecordButton>
        ) : (
          <Button
            size="md"
            variant="solid"
            style={styles.footerButton}
            onPress={onSubmit}
            isDisabled={loading}
            pressRetentionOffset={{
              top: 50,
              left: 50,
              right: 50,
              bottom: 50,
            }}
          >
            <ButtonText style={{ color: "white" }}>
              {isEditing ? t("Index.update") : t("Index.create")}
            </ButtonText>
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row" as const,
    padding: Spacing.md,
    borderTopWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  footerButtonContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  footerButtonContainerFull: {
    marginHorizontal: 0,
  },
  footerButton: {
    width: "100%",
  },
});
