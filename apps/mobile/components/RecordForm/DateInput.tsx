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
import { ColorTheme } from "@/lib/types";
import type { RecordFormData } from "./record-form-types";

interface DateInputProps {
  control: Control<RecordFormData>;
  showDatePicker: boolean;
  onToggleDatePicker: () => void;
  onDateChange: (
    event: DateTimePickerEvent,
    selectedDate: Date | undefined
  ) => void;
  colorScheme: string | null | undefined;
  theme: ColorTheme;
}

export function DateInput({
  control,
  showDatePicker,
  onToggleDatePicker,
  onDateChange,
  colorScheme,
  theme,
}: DateInputProps) {
  const { t } = useTranslation();
  const date = useWatch({ control, name: "date" });

  const formatDateDisplay = (value: Date): string => {
    return value.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <View>
      <Text style={[styles.label, colorScheme === "dark" && { color: "white" }]}>
        {t("Index.date")}
      </Text>
      <TouchableOpacity
        onPress={onToggleDatePicker}
        style={[
          styles.inputButton,
          {
            backgroundColor:
              colorScheme === "dark" ? theme.gray[8] : "#f5f5f5",
            borderColor: showDatePicker
              ? theme.primary[6]
              : colorScheme === "dark"
                ? theme.gray[6]
                : "#ddd",
            borderWidth: showDatePicker ? 2 : 1,
          },
        ]}
      >
        <View style={styles.buttonContent}>
          <Text style={colorScheme === "dark" && { color: "white" }}>
            {date ? formatDateDisplay(date) : ""}
          </Text>
          {showDatePicker ? (
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

      {showDatePicker && (
        <View style={styles.pickerContainer}>
          <Controller
            name="date"
            control={control}
            render={({ field: { value } }) => (
              <DateTimePicker
                value={value instanceof Date ? value : new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onDateChange}
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
