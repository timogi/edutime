import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { 
  Box, 
  HStack, 
  VStack, 
  Text,
} from '@gluestack-ui/themed';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { de, en, fr } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { HapticFeedback } from '@/lib/haptics';
import { Spacing, TextStyles, BorderRadius } from '@/constants/Styles';

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
  
  // DateTimePicker must only be rendered when the user explicitly opens it.
  // On Android it renders as a native modal dialog that opens immediately on mount.
  // Never render it unconditionally — always gate on this state.
  const [activePicker, setActivePicker] = useState<'start' | 'end' | null>(null);
  
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

  const handleDateChange = (event: any, selectedDate?: Date) => {
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
      <View style={[styles.compactContainer, style]}>
        <HStack space="lg" alignItems="center" justifyContent="space-between" style={styles.compactContent}>
          <VStack space="md" flex={1} alignItems="center">
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setActivePicker('start')}
            >
              <Text style={[styles.dateText, { color: theme.primary[6] }]}>
                {formatDate(safeStartDate)}
              </Text>
            </TouchableOpacity>
          </VStack>
          
          <Ionicons 
            name="arrow-forward" 
            size={18} 
            color={theme.gray[6]} 
            style={styles.compactArrow}
          />
          
          <VStack space="md" flex={1} alignItems="center">
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setActivePicker('end')}
            >
              <Text style={[styles.dateText, { color: theme.primary[6] }]}>
                {formatDate(safeEndDate)}
              </Text>
            </TouchableOpacity>
          </VStack>
        </HStack>

        {activePicker && (
          <DateTimePicker
            value={activePicker === 'start' ? safeStartDate : safeEndDate}
            mode="date"
            locale={i18n.language}
            onChange={handleDateChange}
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
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setActivePicker('start')}
            >
              <Text style={[styles.dateText, { color: theme.primary[6] }]}>
                {formatDate(safeStartDate)}
              </Text>
            </TouchableOpacity>
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
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setActivePicker('end')}
            >
              <Text style={[styles.dateText, { color: theme.primary[6] }]}>
                {formatDate(safeEndDate)}
              </Text>
            </TouchableOpacity>
          </VStack>
        </HStack>

        {activePicker && (
          <DateTimePicker
            value={activePicker === 'start' ? safeStartDate : safeEndDate}
            mode="date"
            locale={i18n.language}
            onChange={handleDateChange}
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
  dateButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
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
