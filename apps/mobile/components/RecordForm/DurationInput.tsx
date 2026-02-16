import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { Controller } from 'react-hook-form';
import DateTimePicker from "@react-native-community/datetimepicker";
import { Text } from "@gluestack-ui/themed";
import { TouchableOpacity } from "react-native";
import { TextStyles, Spacing, BorderRadius } from "@/constants/Styles";
import { useTranslation } from "react-i18next";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react-native";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@gluestack-ui/themed";

interface DurationInputProps {
  control: any;
  isExpanded: boolean;
  onToggleDurationPicker: () => void;
  onDurationChange: (event: any, selectedTime: Date | undefined) => void;
  colorScheme: string | null | undefined;
  theme: any;
}

export function DurationInput({
  control,
  isExpanded,
  onToggleDurationPicker,
  onDurationChange,
  colorScheme,
  theme,
}: DurationInputProps) {
  const { t } = useTranslation();

  const formatDuration = (date: Date): string => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <FormControl>
      <FormControlLabel>
        <FormControlLabelText style={[styles.label, colorScheme === "dark" && { color: "white" }]}>
          {t("Index.duration")}
        </FormControlLabelText>
      </FormControlLabel>

      <TouchableOpacity
        onPress={onToggleDurationPicker}
        style={[
          styles.inputButton,
          {
            backgroundColor:
              colorScheme === "dark" ? theme.gray[8] : "#f5f5f5",
            borderColor: isExpanded
              ? theme.primary[6]
              : colorScheme === "dark"
              ? theme.gray[6]
              : "#ddd",
            borderWidth: isExpanded ? 2 : 1,
          },
        ]}
      >
        <View style={styles.buttonContent}>
          <Text style={colorScheme === "dark" && { color: "white" }}>
            {formatDuration(control._formValues.duration)}
          </Text>
          {isExpanded ? (
            <ChevronUpIcon
              color={
                colorScheme === "dark"
                  ? theme.primary[3]
                  : theme.primary[6]
              }
              size={20}
            />
          ) : (
            <ChevronDownIcon
              color={
                colorScheme === "dark"
                  ? theme.primary[3]
                  : theme.primary[6]
              }
              size={20}
            />
          )}
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.pickerContainer}>
          <Controller
            name="duration"
            control={control}
            rules={{ required: t("Index.durationRequired") }}
            render={({ field: { value } }) => (
              <DateTimePicker
                value={value}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onDurationChange}
                accentColor={theme.primary[6]}
                locale="de-DE"
              />
            )}
          />
        </View>
      )}
    </FormControl>
  );
}

const styles = StyleSheet.create({
  label: {
    ...TextStyles.label,
    marginBottom: Spacing.xs,
    marginTop: Spacing.xs,
  },
  inputButton: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    padding: Spacing.md,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: BorderRadius.sm,
    minHeight: 48,
  },
  buttonContent: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    width: "100%",
  },
  pickerContainer: {
    marginTop: 8,
  },
});
