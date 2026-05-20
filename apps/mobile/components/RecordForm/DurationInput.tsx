import React from "react";
import { View, Platform, StyleSheet } from "react-native";
import { Control, Controller, useWatch } from "react-hook-form";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
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
import { ColorTheme } from "@/lib/types";
import type { RecordFormData } from "./record-form-types";
import { formatTimeDisplay } from "./record-form-time";

interface DurationInputProps {
  control: Control<RecordFormData>;
  isExpanded: boolean;
  onToggleDurationPicker: () => void;
  onDurationChange: (
    event: DateTimePickerEvent,
    selectedTime: Date | undefined
  ) => void;
  colorScheme: string | null | undefined;
  theme: ColorTheme;
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
  const duration = useWatch({ control, name: "duration" });

  return (
    <FormControl>
      <FormControlLabel>
        <FormControlLabelText
          style={[styles.label, colorScheme === "dark" && { color: "white" }]}
        >
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
            {duration ? formatTimeDisplay(duration) : "--:--"}
          </Text>
          {isExpanded ? (
            <ChevronUpIcon
              color={
                colorScheme === "dark" ? theme.primary[3] : theme.primary[6]
              }
              size={20}
            />
          ) : (
            <ChevronDownIcon
              color={
                colorScheme === "dark" ? theme.primary[3] : theme.primary[6]
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
                value={value instanceof Date ? value : new Date()}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    minHeight: 48,
  },
  buttonContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  pickerContainer: {
    marginTop: Spacing.sm,
  },
});
