import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { Controller } from 'react-hook-form';
import DateTimePicker from "@react-native-community/datetimepicker";
import { Text } from "@gluestack-ui/themed";
import { TouchableOpacity } from "react-native";
import { TextStyles, Spacing, BorderRadius } from "@/constants/Styles";
import { useTranslation } from "react-i18next";

interface DateInputProps {
  control: any;
  showDatePicker: boolean;
  onToggleDatePicker: () => void;
  onDateChange: (event: any, selectedDate: Date | undefined) => void;
  colorScheme: string | null | undefined;
  theme: any;
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

  const formatDateDisplay = (date: Date): string => {
    return date.toLocaleDateString("de-DE", {
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
            borderColor: colorScheme === "dark" ? theme.gray[6] : "#ddd",
          },
        ]}
      >
        <Text style={colorScheme === "dark" && { color: "white" }}>
          {formatDateDisplay(control._formValues.date)}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <View style={styles.pickerContainer}>
          <Controller
            name="date"
            control={control}
            render={({ field: { value } }) => (
              <DateTimePicker
                value={value}
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
  pickerContainer: {
    marginTop: 8,
  },
});
