import React from "react";
import { TouchableOpacity, View, Platform } from "react-native";
import { Controller } from "react-hook-form";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { Text, FormControl, FormControlLabel, FormControlLabelText, Pressable, HStack } from "@gluestack-ui/themed";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react-native";

interface DateInputProps {
  control: any;
  showDatePicker: boolean;
  toggleDatePicker: () => void;
  handleDateChange: (event: any, selectedDate?: Date) => void;
  styles: any;
}

function formatDateDisplay(date: Date, language: string): string {
  return date.toLocaleDateString(language, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function DateInput({
  control,
  showDatePicker,
  toggleDatePicker,
  handleDateChange,
  styles,
}: DateInputProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { t, i18n } = useTranslation();

  return (
    <FormControl>
      <FormControlLabel>
        <FormControlLabelText style={colorScheme === 'dark' && { color: 'white' }}>{t('Index.date')}</FormControlLabelText>
      </FormControlLabel>
      <Controller
        name="date"
        control={control}
        render={({ field: { value } }) => (
          <>
            <Pressable
              style={[
                styles.inputButton,
                {
                  backgroundColor: colorScheme === 'dark' ? theme.gray[8] : '#f5f5f5',
                  borderColor: showDatePicker 
                    ? theme.primary[6]
                    : colorScheme === 'dark' ? theme.gray[6] : '#ddd',
                  borderWidth: showDatePicker ? 2 : 1
                }
              ]}
              onPress={toggleDatePicker}
            >
              <HStack space="lg" alignItems="center" justifyContent="space-between" style={{ width: '100%' }}>
                <Text style={colorScheme === 'dark' && { color: 'white' }}>{formatDateDisplay(value, i18n.language)}</Text>
                {showDatePicker ? (
                  <ChevronUpIcon
                    color={colorScheme === 'dark' ? theme.primary[3] : theme.primary[6]}
                    size={20}
                  />
                ) : (
                  <ChevronDownIcon
                    color={colorScheme === 'dark' ? theme.primary[3] : theme.primary[6]}
                    size={20}
                  />
                )}
              </HStack>
            </Pressable>

            {showDatePicker && (
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={value}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleDateChange}
                  accentColor={theme.primary[6]}
                  locale={i18n.language}
                />
              </View>
            )}
          </>
        )}
      />
    </FormControl>
  );
}
