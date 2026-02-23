import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { HapticFeedback } from '@/lib/haptics';
import { Button, ButtonText } from '@gluestack-ui/themed';

import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { WeekdayPicker } from '@/components/WeekdayPicker';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { StopWatchButton } from '@/components/StopWatchButton';
import { RecordList } from '@/components/RecordList';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import { TextStyles, Spacing, BorderRadius, LayoutStyles } from '@/constants/Styles';

export default function TimesheetScreen() {
  const { t, i18n } = useTranslation();
  const params = useLocalSearchParams();
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === 'ios');
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const { navigateToRecordForm } = useNavigationGuard();
  const lastClickRef = useRef<number>(0);

  // Handle date parameter from navigation
  useEffect(() => {
    if (params.date && typeof params.date === 'string') {
      const newDate = new Date(params.date);
      if (!isNaN(newDate.getTime())) {
        setDate(newDate);
      }
    }
  }, [params.date]);

  const handleAddRecord = () => {
    const now = Date.now();
    const timeSinceLastClick = now - lastClickRef.current;
    
    // Debounce: Ignore clicks within 300ms
    if (timeSinceLastClick < 300) {
      return;
    }
    
    lastClickRef.current = now;
    
    HapticFeedback.light();
    const formattedDate = format(date, 'yyyy-MM-dd');
    navigateToRecordForm({
      date: formattedDate,
      title: t('Index.createEntry')
    });
  };

  const handleDateChange = (_event: unknown, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={[styles.dateContainer, { marginTop: insets.top }]}>
        {Platform.OS === 'ios' ? (
          <DateTimePicker
            value={date}
            mode="date"
            locale={i18n.language}
            style={{ alignSelf: 'center' }}
            onChange={handleDateChange}
            accentColor={Colors[colorScheme ?? 'light'].primary[6]}
          />
        ) : (
          <>
            <Button
              action="secondary"
              onPress={() => setShowDatePicker(true)}
              size="sm"
              padding={8}
            >
              <ButtonText>{format(date, 'dd.MM.yyyy')}</ButtonText>
            </Button>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                locale={i18n.language}
                onChange={handleDateChange}
                accentColor={Colors[colorScheme ?? 'light'].primary[6]}
              />
            )}
          </>
        )}
      </ThemedView>

      <WeekdayPicker date={date} setDate={setDate} />

      <ThemedView style={styles.recordListContainer}>
        <RecordList date={date} />
      </ThemedView>

      <ThemedView style={[styles.buttonContainer, { marginBottom: Platform.OS === 'ios' ? insets.bottom + 49 : 0 }]}>
        <StopWatchButton />
        <Button
          size="md"
          variant="solid"
          onPress={handleAddRecord}
          flex={1}
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          gap={8}
          android_ripple={{ color: Colors[colorScheme ?? 'light'].primary[8] }}
        >
          <IconSymbol name="plus" size={20} color="white" />
          <ButtonText color="$white">{t('Index.createEntry')}</ButtonText>
        </Button>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...LayoutStyles.container,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  recordListContainer: {
    flex: 1,
    marginTop: Spacing.md,
  },
  buttonContainer: {
    padding: Spacing.lg,
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: 'transparent',
  }
});