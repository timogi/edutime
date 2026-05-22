import React from "react";
import { View, Platform, StyleSheet } from "react-native";
import { Control, useWatch } from "react-hook-form";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Text } from "@gluestack-ui/themed";
import { TouchableOpacity } from "react-native";
import { TextStyles, Spacing, BorderRadius } from "@/constants/Styles";
import { useTranslation } from "react-i18next";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ColorTheme } from "@/lib/types";
import type { RecordFormData } from "./record-form-types";
import { formatTimeDisplay } from "./record-form-time";

interface TimeInputProps {
  control: Control<RecordFormData>;
  activeTimePicker: "start" | "end" | null;
  onToggleTimePicker: (type: "start" | "end") => void;
  onStartTimeChange: (event: DateTimePickerEvent, selectedTime?: Date) => void;
  onEndTimeChange: (event: DateTimePickerEvent, selectedTime?: Date) => void;
  onResetTime: () => void;
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
  colorScheme,
  theme,
}: TimeInputProps) {
  const { t } = useTranslation();
  const startTime = useWatch({ control, name: "startTime" });
  const endTime = useWatch({ control, name: "endTime" });

  const inputBorder = (active: boolean) => ({
    borderColor: active
      ? theme.primary[6]
      : colorScheme === "dark"
        ? theme.gray[6]
        : "#ddd",
    borderWidth: active ? 2 : 1,
  });

  return (
    <View style={styles.container}>
      <View style={styles.timeRow}>
        <View style={styles.timeInputContainer}>
          <Text
            style={[styles.label, colorScheme === "dark" && { color: "white" }]}
          >
            {t("Index.start")}
          </Text>
          <TouchableOpacity
            style={[
              styles.inputButton,
              styles.inputButtonStart,
              {
                backgroundColor:
                  colorScheme === "dark" ? theme.gray[8] : "#f5f5f5",
                ...inputBorder(activeTimePicker === "start"),
              },
            ]}
            onPress={() => onToggleTimePicker("start")}
          >
            <Text style={colorScheme === "dark" && { color: "white" }}>
              {formatTimeDisplay(startTime)}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.timeInputContainer}>
          <Text
            style={[styles.label, colorScheme === "dark" && { color: "white" }]}
          >
            {t("Index.end")}
          </Text>
          <TouchableOpacity
            style={[
              styles.inputButton,
              styles.inputButtonEnd,
              {
                backgroundColor:
                  colorScheme === "dark" ? theme.gray[8] : "#f5f5f5",
                ...inputBorder(activeTimePicker === "end"),
              },
            ]}
            onPress={() => onToggleTimePicker("end")}
          >
            <Text style={colorScheme === "dark" && { color: "white" }}>
              {formatTimeDisplay(endTime)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {(startTime || endTime) && (
        <View style={styles.resetContainer}>
          <TouchableOpacity
            onPress={onResetTime}
            style={[
              styles.resetButton,
              {
                backgroundColor:
                  colorScheme === "dark" ? theme.gray[7] : "#f8f9fa",
                borderColor: colorScheme === "dark" ? theme.gray[5] : "#e9ecef",
              },
            ]}
          >
            <IconSymbol
              name="clock.badge.xmark"
              size={16}
              color={
                colorScheme === "dark" ? theme.primary[3] : theme.primary[6]
              }
            />
            <Text
              style={[
                styles.resetButtonText,
                {
                  color:
                    colorScheme === "dark"
                      ? theme.primary[3]
                      : theme.primary[6],
                },
              ]}
            >
              {t("Index.resetTimes")}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {activeTimePicker && (
        <View
          style={[
            styles.pickerContainer,
            {
              backgroundColor:
                colorScheme === "dark" ? theme.gray[8] : "#f8f9fa",
              borderColor: colorScheme === "dark" ? theme.gray[6] : "#e9ecef",
            },
          ]}
        >
          <DateTimePicker
            key={activeTimePicker}
            value={
              activeTimePicker === "start"
                ? startTime ?? new Date()
                : endTime ?? new Date()
            }
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedTime) => {
              if (!selectedTime) return;
              if (activeTimePicker === "start") {
                onStartTimeChange(event, selectedTime);
              } else {
                onEndTimeChange(event, selectedTime);
              }
              if (Platform.OS === "android") {
                onToggleTimePicker(activeTimePicker);
              }
            }}
            accentColor={theme.primary[6]}
            locale="de-DE"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  timeRow: {
    flexDirection: "row",
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
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    minHeight: 48,
  },
  inputButtonStart: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  inputButtonEnd: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  resetContainer: {
    marginBottom: Spacing.sm,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  pickerContainer: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
});
