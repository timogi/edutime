import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Platform, StyleProp, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { 
  Box, 
  HStack, 
  VStack, 
  Text,
} from '@gluestack-ui/themed';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { de, enUS, fr } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { HapticFeedback } from '@/lib/haptics';
import { Spacing, TextStyles, BorderRadius } from '@/constants/Styles';

const isIOS = Platform.OS === 'ios';

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  onRangeChange?: (startDate: Date, endDate: Date) => void;
  style?: StyleProp<ViewStyle>;
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
  
  // Android: DateTimePicker opens a native modal dialog immediately on mount.
  // Gate behind state — never render unconditionally.
  // iOS: Not needed — compact picker is always rendered inline.
  const [activePicker, setActivePicker] = useState<'start' | 'end' | null>(null);
  
  const safeStartDate = startDate && !isNaN(startDate.getTime()) ? startDate : new Date();
  const safeEndDate = endDate && !isNaN(endDate.getTime()) ? endDate : new Date();

  const getLocale = () => {
    switch (i18n.language) {
      case 'de': return de;
      case 'fr': return fr;
      default: return enUS;
    }
  };

  const formatDate = (date: Date) => {
    return format(date, 'dd.MM.yyyy', { locale: getLocale() });
  };

  const handleStartDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (!isIOS) setActivePicker(null);
    if (selectedDate) {
      HapticFeedback.light();
      onStartDateChange(selectedDate);
      if (onRangeChange) onRangeChange(selectedDate, safeEndDate);
    }
  };

  const handleEndDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (!isIOS) setActivePicker(null);
    if (selectedDate) {
      HapticFeedback.light();
      onEndDateChange(selectedDate);
      if (onRangeChange) onRangeChange(safeStartDate, selectedDate);
    }
  };

  // Android: legacy toggle-based date pickers
  const handleAndroidDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    const picker = activePicker;
    setActivePicker(null);

    if (selectedDate) {
      HapticFeedback.light();
      if (picker === 'start') {
        onStartDateChange(selectedDate);
        if (onRangeChange) onRangeChange(selectedDate, safeEndDate);
      } else if (picker === 'end') {
        onEndDateChange(selectedDate);
        if (onRangeChange) onRangeChange(safeStartDate, selectedDate);
      }
    }
  };

  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: theme.background, borderBottomColor: theme.gray[2] }, style]}>
        <HStack space="lg" alignItems="center" justifyContent="space-between" style={styles.compactContent}>
          <VStack space="md" flex={1} alignItems="center">
            {isIOS ? (
              <DateTimePicker
                value={safeStartDate}
                mode="date"
                display="compact"
                locale={i18n.language}
                onChange={handleStartDateChange}
                accentColor={theme.primary[6]}
              />
            ) : (
              <TouchableOpacity
                style={[styles.dateButton, { backgroundColor: theme.gray[0], borderColor: theme.gray[3] }]}
                onPress={() => setActivePicker('start')}
              >
                <Text style={[styles.dateText, { color: theme.primary[6] }]}>
                  {formatDate(safeStartDate)}
                </Text>
              </TouchableOpacity>
            )}
          </VStack>
          
          <Ionicons 
            name="arrow-forward" 
            size={18} 
            color={theme.gray[6]} 
            style={styles.compactArrow}
          />
          
          <VStack space="md" flex={1} alignItems="center">
            {isIOS ? (
              <DateTimePicker
                value={safeEndDate}
                mode="date"
                display="compact"
                locale={i18n.language}
                onChange={handleEndDateChange}
                accentColor={theme.primary[6]}
              />
            ) : (
              <TouchableOpacity
                style={[styles.dateButton, { backgroundColor: theme.gray[0], borderColor: theme.gray[3] }]}
                onPress={() => setActivePicker('end')}
              >
                <Text style={[styles.dateText, { color: theme.primary[6] }]}>
                  {formatDate(safeEndDate)}
                </Text>
              </TouchableOpacity>
            )}
          </VStack>
        </HStack>

        {!isIOS && activePicker && (
          <DateTimePicker
            value={activePicker === 'start' ? safeStartDate : safeEndDate}
            mode="date"
            locale={i18n.language}
            onChange={handleAndroidDateChange}
            accentColor={theme.primary[6]}
          />
        )}
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
            {isIOS ? (
              <DateTimePicker
                value={safeStartDate}
                mode="date"
                display="compact"
                locale={i18n.language}
                onChange={handleStartDateChange}
                accentColor={theme.primary[6]}
              />
            ) : (
              <TouchableOpacity
                style={[styles.dateButton, { backgroundColor: theme.gray[0], borderColor: theme.gray[3] }]}
                onPress={() => setActivePicker('start')}
              >
                <Text style={[styles.dateText, { color: theme.primary[6] }]}>
                  {formatDate(safeStartDate)}
                </Text>
              </TouchableOpacity>
            )}
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
            {isIOS ? (
              <DateTimePicker
                value={safeEndDate}
                mode="date"
                display="compact"
                locale={i18n.language}
                onChange={handleEndDateChange}
                accentColor={theme.primary[6]}
              />
            ) : (
              <TouchableOpacity
                style={[styles.dateButton, { backgroundColor: theme.gray[0], borderColor: theme.gray[3] }]}
                onPress={() => setActivePicker('end')}
              >
                <Text style={[styles.dateText, { color: theme.primary[6] }]}>
                  {formatDate(safeEndDate)}
                </Text>
              </TouchableOpacity>
            )}
          </VStack>
        </HStack>

        {!isIOS && activePicker && (
          <DateTimePicker
            value={activePicker === 'start' ? safeStartDate : safeEndDate}
            mode="date"
            locale={i18n.language}
            onChange={handleAndroidDateChange}
            accentColor={theme.primary[6]}
          />
        )}
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
    borderBottomWidth: 1,
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
  dateButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  dateText: {
    ...TextStyles.body,
    fontWeight: '500',
  },
  arrow: {
    marginHorizontal: Spacing.sm,
  },
  compactArrow: {
    marginHorizontal: Spacing.xs,
    opacity: 0.8,
  },
});
