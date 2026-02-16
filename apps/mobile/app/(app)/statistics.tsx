import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useUser } from '@/contexts/UserContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { CategoryStatsTable } from '@/components/statistics/CategoryStatsTable';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ActivityIndicator } from 'react-native';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { Colors } from '@/constants/Colors';
import { Button, ButtonText } from '@gluestack-ui/themed';
import { getCategoryStatisticsData, getRemainingCategoryStatisticsData } from '@/lib/database/statistics';
import { CategoryStatistics, RemainingCategoryStatisticsProps } from '@/lib/database/statistics';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAllCategories } from '@/lib/database/categories';
import { Spacing, BorderRadius, LayoutStyles, TextStyles } from '@/constants/Styles';
import { useDateRange } from '@/contexts/DateRangeContext';

export default function Statistics() {
  const { user, cantonData, refreshUserData } = useUser();
  const { t, i18n } = useTranslation();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  const [categoryStatistics, setCategoryStatistics] = useState<CategoryStatistics | null>(null);
  const [remainingCategoryStatistics, setRemainingCategoryStatistics] = useState<RemainingCategoryStatisticsProps[] | null>(null);
  
  // Use global date range context
  const { startDate, endDate, setStartDate, setEndDate, setDateRange } = useDateRange();

  const loadCategoryStatistics = async () => {
    if (!cantonData || !user?.user_id) return;
    
    try {
      const categories = await getAllCategories({ canton_code: user.canton_code, user_id: user.user_id });
      const statistics = await getCategoryStatisticsData(startDate, endDate, user.user_id, categories, cantonData, user, t);
      setCategoryStatistics(statistics);
    } catch (error) {
      console.error('Error fetching category statistics:', error);
    }

    try {
      const categories = await getAllCategories({ canton_code: user.canton_code, user_id: user.user_id });
      const remainingStats = await getRemainingCategoryStatisticsData(startDate, endDate, user.user_id, categories, cantonData, user, t);
      setRemainingCategoryStatistics(remainingStats.rows);
    } catch (error) {
      console.error('Error fetching remaining category statistics:', error);
    }
  };

  useEffect(() => {
    loadCategoryStatistics();
  }, [cantonData, startDate, endDate, user, t]);


  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: t('Index.statistics') }} />
      <View style={[styles.stickyDateContainer, { top: insets.top }]}>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onRangeChange={setDateRange}
          compact={true}
          style={styles.dateContainer}
        />
      </View>
      <View style={styles.graySpacer} />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

        <ThemedView>
          {categoryStatistics ? (
            <CategoryStatsTable 
              data={categoryStatistics.rows} 
              isWorkingHoursDisabled={cantonData?.is_working_hours_disabled ?? false}
            />
          ) : (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" />
            </View>
          )}
        </ThemedView>

        <ThemedText style={styles.subtitle}>
          {t('Categories.furtherEmployment')}:
        </ThemedText>

        <ThemedView>
          {remainingCategoryStatistics ? (
            <CategoryStatsTable 
              data={remainingCategoryStatistics} 
              isWorkingHoursDisabled={cantonData?.is_working_hours_disabled ?? false}
            />
          ) : (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" />
            </View>
          )}
        </ThemedView>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    ...LayoutStyles.container,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    backgroundColor: '#f3f3f3',
  },
  contentContainer: {
    padding: Spacing.md,
    paddingTop: 80, // Add padding to account for date picker height
    paddingBottom: Spacing.xxl,
  },
  graySpacer: {
    height: 20,
    backgroundColor: '#f3f3f3',
  },
  stickyDateContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
    elevation: 10,
    backgroundColor: 'white',
  },
  dateContainer: {
    paddingVertical: 0,
    width: '100%',
  },
  dateButton: {
    padding: Spacing.sm,
  },
  subtitle: {
    ...TextStyles.subtitle,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  loaderContainer: {
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    ...TextStyles.body,
  },
});
