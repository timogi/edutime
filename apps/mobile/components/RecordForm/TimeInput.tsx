import React from 'react';
import { View, Platform } from 'react-native';
import { Control, Controller } from 'react-hook-form';
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Text } from "@gluestack-ui/themed";
import { TouchableOpacity } from "react-native";
import { TextStyles, Spacing, BorderRadius } from "@/constants/Styles";
import { useTranslation } from "react-i18next";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ColorTheme } from "@/lib/types";

interface TimeInputProps {
  control: Control<Record<string, Date | null | string | number | boolean | undefined>>;
  activeTimePicker: "start" | "end" | null;
  onToggleTimePicker: (type: "start" | "end") => void;
  onStartTimeChange: (event: DateTimePickerEvent, selectedTime?: Date) => void;
  onEndTimeChange: (event: DateTimePickerEvent, selectedTime?: Date) => void;
  onResetTime: (type: "start" | "end") => void;
  timePickerValue: Date;
  setTimePickerValue: (date: Date) => void;
  colorScheme: string | null | undefined;
  theme: ColorTheme;
}

export function TimeInput({
  control,
  activeTimePicker,
  onToggleTimePicker,
  onStartTimeChange,
  onEndTimeChange,
  onResetTime,
  timePickerValue,
  setTimePickerValue,
  colorScheme,
  theme,
}: TimeInputProps) {
  const { t } = useTranslation();

  const formatTimeDisplay = (date: Date | null): string => {
    if (!date) return "--:--";
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View style={styles.container}>
      {/* Time Buttons Row - Always Visible */}
      <View style={styles.timeRow}>
        {/* Start Time */}
        <View style={styles.timeInputContainer}>
          <Text style={[styles.label, colorScheme === "dark" && { color: "white" }]}>
            {t("Index.start")}
          </Text>
          <TouchableOpacity
            style={[
              styles.inputButton,
              {
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                backgroundColor:
                  colorScheme === "dark" ? theme.gray[8] : "#f5f5f5",
                borderColor:
                  activeTimePicker === "start"
                    ? theme.primary[6]
                    : colorScheme === "dark"
                    ? theme.gray[6]
                    : "#ddd",
                borderWidth: activeTimePicker === "start" ? 2 : 1,
              },
            ]}
            onPress={() => onToggleTimePicker("start")}
          >
            <Text style={colorScheme === "dark" && { color: "white" }}>
              {formatTimeDisplay(control._formValues.startTime)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* End Time */}
        <View style={styles.timeInputContainer}>
          <Text style={[styles.label, colorScheme === "dark" && { color: "white" }]}>
            {t("Index.end")}
          </Text>
          <TouchableOpacity
            style={[
              styles.inputButton,
              {
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                backgroundColor:
                  colorScheme === "dark" ? theme.gray[8] : "#f5f5f5",
                borderColor:
                  activeTimePicker === "end"
                    ? theme.primary[6]
                    : colorScheme === "dark"
                    ? theme.gray[6]
                    : "#ddd",
                borderWidth: activeTimePicker === "end" ? 2 : 1,
              },
            ]}
            onPress={() => onToggleTimePicker("end")}
          >
            <Text style={colorScheme === "dark" && { color: "white" }}>
              {formatTimeDisplay(control._formValues.endTime)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Reset Button - Only show if there are time entries */}
      {(control._formValues.startTime || control._formValues.endTime) && (
        <View style={styles.resetContainer}>
          <TouchableOpacity
            onPress={() => onResetTime("end")}
            style={[
              styles.resetButton,
              {
                backgroundColor: colorScheme === "dark" ? theme.gray[7] : "#f8f9fa",
                borderColor: colorScheme === "dark" ? theme.gray[5] : "#e9ecef",
              }
            ]}
          >
            <IconSymbol
              name="clock.badge.xmark"
              size={16}
              color={
                colorScheme === "dark"
                  ? theme.primary[3]
                  : theme.primary[6]
              }
            />
            <Text style={[
              styles.resetButtonText,
              { color: colorScheme === "dark" ? theme.primary[3] : theme.primary[6] }
            ]}>
              {t("Index.resetTimes")}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Time Picker - Below buttons */}
      {activeTimePicker && (
        <View style={styles.pickerContainer}>
          <Controller
            name={activeTimePicker === "start" ? "startTime" : "endTime"}
            control={control}
            render={({ field: { value } }) => (
              <DateTimePicker
                value={timePickerValue}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(e, selectedTime) => {
                  if (selectedTime) {
                    // Wert in Picker-UI updaten
                    setTimePickerValue(selectedTime);
                    // Deinen zentralen Start/End-Handler aufrufen
                    if (activeTimePicker === "start") {
                      onStartTimeChange(e, selectedTime);
                    } else {
                      onEndTimeChange(e, selectedTime);
                    }
                  }
                  // Android: Picker nach Auswahl schließen
                  if (Platform.OS === "android") {
                    onToggleTimePicker(activeTimePicker);
                  }
                }}
                accentColor={theme.primary[6]}
                locale="de-DE"
              />
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = {
  container: {
    width: "100%" as const,
  },
  timeRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    gap: 0,
    marginBottom: Spacing.sm,
  },
  timeInputContainer: {
    flex: 1,
  },
  label: {
    ...TextStyles.label,
    marginBottom: Spacing.xs,
    marginTop: Spacing.xs,
  },
  inputButton: {
    flexDirection: "row" as const,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: Spacing.md,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: BorderRadius.sm,
    minHeight: 48,
  },
  resetContainer: {
    marginBottom: Spacing.sm,
  },
  resetButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    padding: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  pickerContainer: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: "#f8f9fa",
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
};
