import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native';
import React from 'react';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { Card } from "@gluestack-ui/themed";
import { ThemedText } from '@/components/ThemedText';
import { VStack } from "@gluestack-ui/themed";
import { HStack } from "@gluestack-ui/themed";
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { findCategory } from '@/lib/database/categories';
import { useUser } from '@/contexts/UserContext';
import { useRecordsQuery } from '@/hooks/useRecordsQuery';
import { TimeRecord } from '@/lib/types';
import { useTranslation } from "react-i18next";
import { TextStyles, Spacing, BorderRadius, ShadowStyles, LayoutStyles } from '@/constants/Styles';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';

interface RecordListProps {
  date: Date;
}

const CARD_HEIGHT = 90;

export const RecordList = ({ date }: RecordListProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const dateStr = format(date, 'yyyy-MM-dd');
  const { user, categories } = useUser();
  const { data: records = [], isLoading: loading, error } = useRecordsQuery(dateStr, user?.user_id || '');
  const { navigateToRecordForm } = useNavigationGuard();

  const cardStyle = {
    ...styles.card,
    backgroundColor: colorScheme === 'light' ? 'white' : '#1A1B1E'
  };

  const handleEditRecord = (record: TimeRecord) => {
    navigateToRecordForm({
      date: record.date,
      record: JSON.stringify(record),
      title: t('Index.edit-record')
    });
  };


  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${remainingMinutes
      .toString()
      .padStart(2, '0')}`;
  };

  const RecordItem = ({ record }: { record: TimeRecord }) => {
    const category = findCategory(record, categories);

    return (
      <View style={styles.listItemContainer}>
        <TouchableOpacity
          onPress={() => handleEditRecord(record)}
          style={styles.cardContainer}
        >
          <Card
            variant="outline"
            style={[cardStyle, styles.fixedHeightCard]}
          >
            <View style={styles.cardContent}>
              <HStack style={styles.topRow}>
                <ThemedText style={styles.duration}>
                  {formatDuration(record.duration)}
                </ThemedText>
                <HStack space="md">
                  {record.start_time && (
                    <ThemedText>
                      {formatTime(record.start_time)}
                    </ThemedText>
                  )}
                  {record.start_time && record.end_time && (
                    <ThemedText>-</ThemedText>
                  )}
                  {record.end_time && (
                    <ThemedText>
                      {formatTime(record.end_time)}
                    </ThemedText>
                  )}
                </HStack>
              </HStack>

              <HStack style={styles.bottomRow}>
                <Ionicons 
                  name="folder" 
                  size={16} 
                  color={category?.color || Colors[colorScheme ?? 'light'].text} 
                />
                <ThemedText 
                  style={styles.categoryTitle}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {category ? (category.is_further_employment || category.is_profile_category ? category.title : t('Categories.' + category.title)) : t('Index.noCategory')}
                </ThemedText>
              </HStack>
            </View>
          </Card>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Card variant="outline" style={[cardStyle, styles.fixedHeightCard]}>
          <ThemedText>{t('Index.loading')}</ThemedText>
        </Card>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Card variant="outline" style={[cardStyle, styles.fixedHeightCard]}>
          <ThemedText>{t('Index.error-loading-records')}</ThemedText>
        </Card>
      </View>
    );
  }

  if (!records || records.length === 0) {
    return (
      <View style={styles.container}>
        <Card variant="outline" style={[cardStyle, styles.fixedHeightCard]}>
          <ThemedText>{t('Index.no-records-for-this-date')}</ThemedText>
        </Card>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <FlatList
        data={records}
        renderItem={({ item }) => <RecordItem record={item} />}
        keyExtractor={(item) => item.id?.toString() ?? ''}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...LayoutStyles.container,
  },
  listItemContainer: {
    marginBottom: Spacing.sm,
  },
  cardWrapper: {
    height: CARD_HEIGHT,
    marginBottom: Spacing.sm,
  },
  cardContainer: {
    backgroundColor: 'transparent',
  },
  card: {
    marginHorizontal: Spacing.md,
    padding: Spacing.md,
  },
  fixedHeightCard: {
    height: CARD_HEIGHT,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  topRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 24,
  },
  bottomRow: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 36,
  },
  duration: {
    ...TextStyles.body,
    fontWeight: '600',
  },
  description: {
    ...TextStyles.caption,
    color: '#666',
  },
  deleteText: {
    fontWeight: '600',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryTitle: {
    ...TextStyles.caption,
    fontWeight: '500',
    flex: 1,
    flexShrink: 1,
    marginLeft: Spacing.md,
    maxHeight: 32,
    textAlignVertical: 'center',
  },
  syncStatus: {
    ...TextStyles.small,
    color: '#666',
    fontStyle: 'italic'
  }
});