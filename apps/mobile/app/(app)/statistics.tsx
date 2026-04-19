import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { Colors, themeForScheme } from '@/constants/Colors';
import { Button, ButtonText } from '@gluestack-ui/themed';
import { getConfigMode, type ConfigProfileData } from '@edutime/shared';
import { getCategoryStatisticsData, getRemainingCategoryStatisticsData, getCustomCategoryStatisticsData, getCustomRemainingStatisticsData } from '@/lib/database/statistics';
import {
  CategoryStatistics,
  RemainingCategoryStatisticsProps,
} from '@/lib/database/statistics';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAllCategories } from '@/lib/database/categories';
import { Spacing, BorderRadius, LayoutStyles, TextStyles } from '@/constants/Styles';
import { useDateRange } from '@/contexts/DateRangeContext';

const EMPTY_MAIN_CATEGORY_STATS: CategoryStatistics = {
  rows: [],
  noCategoryDuration: 0,
  totalEffectiveDuration: 0,
  totalTargetDuration: 0,
};

/** Coalesce rapid UserContext updates (e.g. after saving a profile category) before loading stats. */
const STATS_RELOAD_DEBOUNCE_MS = 100;

export default function Statistics() {
  const { user, cantonData, configProfile, profileCategories } = useUser();
  const { t, i18n } = useTranslation();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  const [categoryStatistics, setCategoryStatistics] = useState<CategoryStatistics | null>(null);
  const [remainingCategoryStatistics, setRemainingCategoryStatistics] = useState<RemainingCategoryStatisticsProps[] | null>(null);
  const mainStatsGenerationRef = useRef(0);
  const remainingStatsGenerationRef = useRef(0);

  // Use global date range context
  const { startDate, endDate, setStartDate, setEndDate, setDateRange } = useDateRange();

  const modeFromUser = !user ? 'default' : getConfigMode(user);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
    const u = user;
    const cd = cantonData;
    const profile = configProfile;
    const profCats = profileCategories;

    if (!u?.user_id) {
      mainStatsGenerationRef.current += 1;
      remainingStatsGenerationRef.current += 1;
      setCategoryStatistics(null);
      setRemainingCategoryStatistics(null);
      return;
    }

    const mode = getConfigMode(u);
    const cantonDataMatchesUser = Boolean(
      cd && u.canton_code && cd.canton_code === u.canton_code,
    );

    if (mode === 'custom' && profile) {
      const mainId = ++mainStatsGenerationRef.current;
      const remId = ++remainingStatsGenerationRef.current;
      void (async () => {
        try {
          const statistics = await getCustomCategoryStatisticsData(
            startDate,
            endDate,
            u.user_id,
            profCats,
            profile,
            u,
            t,
          );
          if (mainId !== mainStatsGenerationRef.current) return;
          setCategoryStatistics(statistics);
        } catch (error) {
          console.error('Error fetching custom main statistics:', error);
          if (mainId !== mainStatsGenerationRef.current) return;
          // Keep previous main stats on transient failures.
        }
      })();

      void (async () => {
        try {
          const remainingStats = await getCustomRemainingStatisticsData(
            startDate,
            endDate,
            u.user_id,
            profCats,
            profile,
            t,
          );
          if (remId !== remainingStatsGenerationRef.current) return;
          setRemainingCategoryStatistics(remainingStats.rows);
        } catch (error) {
          console.error('Error fetching custom additional-task statistics:', error);
          if (remId !== remainingStatsGenerationRef.current) return;
          // Keep previous additional-task stats on transient failures.
        }
      })();
      return;
    }

    if (mode === 'custom' && !profile) {
      mainStatsGenerationRef.current += 1;
      setCategoryStatistics(EMPTY_MAIN_CATEGORY_STATS);

      const remId = ++remainingStatsGenerationRef.current;
      void (async () => {
        try {
          const pseudoProfile: ConfigProfileData = {
            id: '__pending__',
            title: '',
            annual_work_hours: cd?.annual_work_hours ?? 1930,
          };
          const remainingStats = await getCustomRemainingStatisticsData(
            startDate,
            endDate,
            u.user_id,
            profCats,
            pseudoProfile,
            t,
          );
          if (remId !== remainingStatsGenerationRef.current) return;
          setRemainingCategoryStatistics(remainingStats.rows);
        } catch (error) {
          console.error('Error fetching additional tasks (custom, profile pending):', error);
          if (remId !== remainingStatsGenerationRef.current) return;
          // Keep previous additional-task stats while profile is settling.
        }
      })();
      return;
    }

    if (mode === 'default' && cantonDataMatchesUser && cd) {
      const mainId = ++mainStatsGenerationRef.current;
      const remId = ++remainingStatsGenerationRef.current;
      void (async () => {
        try {
          const categories = await getAllCategories({ canton_code: u.canton_code, user_id: u.user_id });
          if (mainId !== mainStatsGenerationRef.current) return;
          const statistics = await getCategoryStatisticsData(
            startDate,
            endDate,
            u.user_id,
            categories,
            cd,
            u,
            t,
          );
          if (mainId !== mainStatsGenerationRef.current) return;
          setCategoryStatistics(statistics);
        } catch (error) {
          console.error('Error fetching canton main statistics:', error);
          if (mainId !== mainStatsGenerationRef.current) return;
          // Keep previous main stats on transient failures.
        }
      })();

      void (async () => {
        try {
          const categories = await getAllCategories({ canton_code: u.canton_code, user_id: u.user_id });
          if (remId !== remainingStatsGenerationRef.current) return;
          const remainingStats = await getRemainingCategoryStatisticsData(
            startDate,
            endDate,
            u.user_id,
            categories,
            cd,
            u,
            t,
          );
          if (remId !== remainingStatsGenerationRef.current) return;
          setRemainingCategoryStatistics(remainingStats.rows);
        } catch (error) {
          console.error('Error fetching canton additional-task statistics:', error);
          if (remId !== remainingStatsGenerationRef.current) return;
          // Keep previous additional-task stats on transient failures.
        }
      })();
      return;
    }

    if (mode === 'default' && u.canton_code && (!cd || cd.canton_code !== u.canton_code)) {
      return;
    }

    mainStatsGenerationRef.current += 1;
    setCategoryStatistics(null);
    /**
     * Avoid clearing "Zusätzliche Aufgaben" during transient inconsistency:
     * e.g. `user` row briefly default while `configProfile` is still from custom (or vice versa),
     * which would skip all branches above and previously wiped both tables.
     */
    if (!profile && !u.active_config_profile_id) {
      remainingStatsGenerationRef.current += 1;
      setRemainingCategoryStatistics(null);
    }
    }, STATS_RELOAD_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [cantonData, startDate, endDate, user, t, configProfile, profileCategories, user?.canton_code, user?.active_config_profile_id]);


  const theme = themeForScheme(colorScheme);

  const totalProfileWeight = useMemo(
    () => profileCategories.reduce((sum, cat) => sum + cat.weight, 0),
    [profileCategories],
  );
  const customCategoriesInvalid =
    modeFromUser === 'custom' &&
    (profileCategories.length === 0 || Math.abs(totalProfileWeight - 100) > 0.01);

  const hideTargetFromCantonHours =
    modeFromUser !== 'custom' && (cantonData?.is_working_hours_disabled ?? false);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: t('Index.statistics') }} />
      <View style={[styles.stickyDateContainer, { top: insets.top, backgroundColor: theme.background }]}>
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
      <View style={[styles.graySpacer, { backgroundColor: colorScheme === 'dark' ? theme.gray[9] : theme.gray[0] }]} />
      <ScrollView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? theme.gray[9] : theme.gray[0] }]} contentContainerStyle={styles.contentContainer}>

        {customCategoriesInvalid ? (
          <View
            style={[
              styles.customCategoriesBanner,
              {
                borderLeftColor: theme.primary[5],
                backgroundColor: colorScheme === 'dark' ? theme.gray[8] : theme.primary[0],
              },
            ]}
          >
            <ThemedText style={[styles.customCategoriesBannerText, { color: theme.text }]}>
              {profileCategories.length === 0
                ? t('Settings.customCategoriesWarningNoCategories')
                : t('Settings.customCategoriesWarningTotal')}
            </ThemedText>
          </View>
        ) : null}

        <ThemedView>
          {categoryStatistics ? (
            <CategoryStatsTable 
              data={categoryStatistics.rows} 
              isWorkingHoursDisabled={hideTargetFromCantonHours}
            />
          ) : (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" />
            </View>
          )}
        </ThemedView>

        <ThemedText style={styles.subtitle}>
          {t('Statistics.otherEmployments')}:
        </ThemedText>

        <ThemedView>
          {remainingCategoryStatistics ? (
            <CategoryStatsTable 
              data={remainingCategoryStatistics} 
              isWorkingHoursDisabled={hideTargetFromCantonHours}
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
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.md,
    paddingTop: 80, // Add padding to account for date picker height
    paddingBottom: Spacing.xxl,
  },
  customCategoriesBanner: {
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
  },
  customCategoriesBannerText: {
    fontSize: 14,
    lineHeight: 20,
  },
  graySpacer: {
    height: 20,
  },
  stickyDateContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
    elevation: 10,
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
