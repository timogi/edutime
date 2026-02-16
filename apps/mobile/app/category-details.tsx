import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Text } from '@gluestack-ui/themed';
import { Database } from '@/database.types';
import { convertMinutesToHoursAndMinutes } from '@/lib/helpers';
import { format } from 'date-fns';
import { de, en, fr } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@gluestack-ui/themed';
import { Spacing, TextStyles } from '@/constants/Styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HapticFeedback } from '@/lib/haptics';
import { useCategoryRecordsQuery } from '@/hooks/useCategoryRecordsQuery';
import { useUser } from '@/contexts/UserContext';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { useDateRange } from '@/contexts/DateRangeContext';

type TimeRecord = Database['public']['Tables']['records']['Row'];

export default function CategoryDetails() {
  const { t, i18n } = useTranslation();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { user } = useUser();
  const { startDate, endDate, setStartDate, setEndDate, setDateRange } = useDateRange();
  
  // Get parameters from navigation
  const params = useLocalSearchParams();
  const categoryId = params.categoryId ? Number(params.categoryId) : null;
  const isUserCategory = params.isUserCategory === 'true';
  const categoryTitle = params.categoryTitle as string;
  const userId = params.userId as string;
  const categoryIds = params.categoryIds ? JSON.parse(params.categoryIds as string) : null;
  
  // Use React Query hook for data fetching
  const { data: records = [], isLoading: loading, error } = useCategoryRecordsQuery({
    startDate,
    endDate,
    categoryTitle,
    categoryId,
    isUserCategory,
    categoryIds,
    enabled: !!userId && !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())
  });

  // Group records by date
  const groupedRecords = records.reduce((acc, record) => {
    const dateKey = record.date;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(record);
    return acc;
  }, {} as { [date: string]: TimeRecord[] });

  const getLocale = () => {
    switch (i18n.language) {
      case 'de': return de;
      case 'fr': return fr;
      default: return en;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd.MM.yyyy', { locale: getLocale() });
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '-';
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  const handleRecordPress = (record: TimeRecord) => {
    HapticFeedback.light();
    
    // Navigate to main timesheet with the specific date
    router.push({
      pathname: '/(app)',
      params: {
        date: record.date, // Pass the date as parameter
      }
    });
  };

  const getCategoryColor = (record: TimeRecord) => {
    // Records now come with categoryColor already set from the hook
    return (record as any).categoryColor || '#000000';
  };

  const getSortedDates = () => {
    return Object.keys(groupedRecords).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime(); // Newest first
    });
  };

  const cardStyle = {
    ...styles.card,
    backgroundColor: colorScheme === 'light' ? 'white' : '#1A1B1E'
  };

  const textStyle = {
    color: colorScheme === 'dark' ? 'white' : undefined
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: categoryTitle,
          headerBackTitle: t('Index.back'),
          headerTintColor: colorScheme === 'dark' ? 'white' : 'black',
          headerStyle: {
            backgroundColor: colorScheme === 'dark' ? theme.background : 'white',
          },
        }} 
      />
      
      <View style={styles.stickyDateContainer}>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onRangeChange={setDateRange}
          compact={true}
          style={styles.dateRangeContainer}
        />
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary[5]} />
            <Text style={[styles.loadingText, textStyle]}>{t('Index.loading')}...</Text>
          </View>
        ) : records.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={48} color={theme.gray[4]} />
            <Text style={[styles.emptyText, textStyle]}>{t('Index.noRecords')}</Text>
          </View>
        ) : (
          getSortedDates().map((dateKey) => {
            const dayRecords = groupedRecords[dateKey];
            
            return (
              <View key={dateKey} style={styles.dateGroup}>
                <Text style={[styles.dateHeader, textStyle]}>
                  {formatDate(dateKey)}
                </Text>
                <Card style={[cardStyle, { padding: 0 }]} variant="outline">
                  {dayRecords.map((record, index) => {
                    const categoryColor = getCategoryColor(record);
                    return (
                      <TouchableOpacity 
                        key={record.id} 
                        onPress={() => handleRecordPress(record)}
                        activeOpacity={0.7}
                        style={[
                          styles.recordItem,
                          { borderLeftColor: categoryColor, borderLeftWidth: 4 },
                          index < dayRecords.length - 1 && styles.recordItemWithBorder,
                          // Handle single record (fully rounded)
                          dayRecords.length === 1 && styles.recordItemOnly,
                          // Handle multiple records (only first and last rounded)
                          dayRecords.length > 1 && index === 0 && styles.recordItemFirst,
                          dayRecords.length > 1 && index === dayRecords.length - 1 && styles.recordItemLast
                        ]}
                      >
                        <View style={styles.recordContent}>
                          <View style={styles.recordLeft}>
                            <Text style={[styles.recordTime, textStyle]}>
                              {formatTime(record.start_time)} - {formatTime(record.end_time)}
                            </Text>
                            {/* Display subcategory for canton categories */}
                            {!record.is_user_category && record.categories?.subtitle && (
                              <Text style={[styles.recordSubcategory, textStyle]} numberOfLines={1}>
                                {t(`Categories.${record.categories.subtitle}`) || record.categories.subtitle}
                              </Text>
                            )}
                            {/* Display subcategory for user categories */}
                            {record.is_user_category && record.user_categories?.subtitle && (
                              <Text style={[styles.recordSubcategory, textStyle]} numberOfLines={1}>
                                {t(`Categories.${record.user_categories.subtitle}`) || record.user_categories.subtitle}
                              </Text>
                            )}
                            {record.description && (
                              <Text style={[styles.recordDescription, textStyle]} numberOfLines={2}>
                                {record.description}
                              </Text>
                            )}
                          </View>
                          <View style={styles.recordRight}>
                            <Text style={[styles.recordDuration, textStyle]}>
                              {convertMinutesToHoursAndMinutes(record.duration)}
                            </Text>
                            <Ionicons 
                              name="chevron-forward" 
                              size={16} 
                              color={theme.gray[6]} 
                              style={styles.chevron}
                            />
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </Card>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stickyDateContainer: {
    position: 'absolute',
    top: 0, // Back to top position
    left: 0,
    right: 0,
    zIndex: 10,
    elevation: 10,
    pointerEvents: 'box-none', // Allow header touches to pass through
  },
  dateRangeContainer: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  scrollView: {
    flex: 1,
    paddingTop: 60, // Add padding to account for sticky date picker
  },
  scrollContent: {
    padding: Spacing.md,
  },
  card: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  dateGroup: {
    marginBottom: Spacing.lg,
  },
  dateHeader: {
    ...TextStyles.subtitle,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  recordItem: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    overflow: 'hidden',
  },
  recordItemWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  recordItemFirst: {
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  recordItemLast: {
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  recordItemOnly: {
    borderRadius: 6,
  },
  recordContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recordLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  recordRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  recordTime: {
    ...TextStyles.caption,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  recordDuration: {
    ...TextStyles.body,
    fontWeight: '600',
    color: '#007AFF',
  },
  recordSubcategory: {
    ...TextStyles.small,
    color: '#007AFF',
    marginTop: 2,
    fontWeight: '500',
  },
  recordDescription: {
    ...TextStyles.body,
    opacity: 0.8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    ...TextStyles.body,
    marginTop: Spacing.md,
    opacity: 0.7,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  loadingText: {
    ...TextStyles.body,
    marginTop: Spacing.md,
    opacity: 0.7,
  },
  chevron: {
    marginLeft: Spacing.xs,
  },
});
