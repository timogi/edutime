import React, { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { 
  Box, 
  Button, 
  ButtonText, 
  HStack, 
  VStack, 
  Text,
  Pressable,
  Input,
  InputField
} from '@gluestack-ui/themed';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { de, en, fr } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { HapticFeedback } from '@/lib/haptics';
import { Spacing, TextStyles } from '@/constants/Styles';

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  onRangeChange?: (startDate: Date, endDate: Date) => void;
  style?: any;
  compact?: boolean;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onRangeChange,
  style,
  compact = false
}) => {
  const { t, i18n } = useTranslation();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  
  // Validate dates and provide fallbacks
  const safeStartDate = startDate && !isNaN(startDate.getTime()) ? startDate : new Date();
  const safeEndDate = endDate && !isNaN(endDate.getTime()) ? endDate : new Date();
  

  const getLocale = () => {
    switch (i18n.language) {
      case 'de': return de;
      case 'fr': return fr;
      default: return en;
    }
  };

  const formatDate = (date: Date) => {
    return format(date, 'dd.MM.yyyy', { locale: getLocale() });
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      HapticFeedback.light();
      onStartDateChange(selectedDate);
      if (onRangeChange) {
        onRangeChange(selectedDate, safeEndDate);
      }
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      HapticFeedback.light();
      onEndDateChange(selectedDate);
      if (onRangeChange) {
        onRangeChange(safeStartDate, selectedDate);
      }
    }
  };


  if (compact) {
    return (
      <View style={[styles.compactContainer, style]}>
        <HStack space="lg" alignItems="center" justifyContent="space-between" style={styles.compactContent}>
          <VStack space="md" flex={1} alignItems="center">
            <DateTimePicker
              value={safeStartDate}
              mode="date"
              locale={i18n.language}
              onChange={handleStartDateChange}
              accentColor={theme.primary[6]}
              style={styles.compactPicker}
            />
          </VStack>
          
          <Ionicons 
            name="arrow-forward" 
            size={18} 
            color={theme.gray[6]} 
            style={styles.compactArrow}
          />
          
          <VStack space="md" flex={1} alignItems="center">
            <DateTimePicker
              value={safeEndDate}
              mode="date"
              locale={i18n.language}
              onChange={handleEndDateChange}
              accentColor={theme.primary[6]}
              style={styles.compactPicker}
            />
          </VStack>
        </HStack>
      </View>
    );
  }

  return (
    <Box style={[styles.container, style]}>
      <VStack space="md">
        <Text style={[styles.label, { color: theme.text }]}>
          {t('Index.dateRange')}
        </Text>
        
        <HStack space="lg" alignItems="flex-end" justifyContent="space-between">
          <VStack space="xs" flex={1} minWidth={120}>
            <Text style={[styles.fieldLabel, { color: theme.gray[6] }]}>
              {t('Index.startDate')}
            </Text>
                  <DateTimePicker
                    value={safeStartDate}
                    mode="date"
                    locale={i18n.language}
                    onChange={handleStartDateChange}
                    accentColor={theme.primary[6]}
                    style={styles.picker}
                  />
          </VStack>

          <Ionicons 
            name="arrow-forward" 
            size={18} 
            color={theme.gray[6]} 
            style={styles.arrow}
          />

          <VStack space="xs" flex={1} minWidth={120}>
            <Text style={[styles.fieldLabel, { color: theme.gray[6] }]}>
              {t('Index.endDate')}
            </Text>
                  <DateTimePicker
                    value={safeEndDate}
                    mode="date"
                    locale={i18n.language}
                    onChange={handleEndDateChange}
                    accentColor={theme.primary[6]}
                    style={styles.picker}
                  />
          </VStack>
        </HStack>
      </VStack>
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
  },
  compactContainer: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  compactContent: {
    paddingVertical: Spacing.md,
  },
  label: {
    ...TextStyles.subtitle,
    fontWeight: '600',
  },
  fieldLabel: {
    ...TextStyles.caption,
    fontWeight: '500',
  },
  picker: {
    alignSelf: 'center',
  },
  compactPicker: {
    alignSelf: 'center',
    // Remove scale transform to make it full size like in index.tsx
  },
  arrow: {
    marginHorizontal: Spacing.sm,
  },
  compactArrow: {
    marginHorizontal: Spacing.xs,
    opacity: 0.8,
  },
});
