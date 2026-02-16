import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Text } from '@gluestack-ui/themed';
import { CategoryStatisticsProps, RemainingCategoryStatisticsProps } from '@/lib/database/statistics';
import { Ionicons } from '@expo/vector-icons';
import { convertMinutesToHoursAndMinutes } from '@/lib/helpers';
import { Card } from '@gluestack-ui/themed';

interface CategoryStatsTableProps {
  data: CategoryStatisticsProps[] | RemainingCategoryStatisticsProps[];
  isWorkingHoursDisabled?: boolean;
}

export const CategoryStatsTable: React.FC<CategoryStatsTableProps> = ({ data, isWorkingHoursDisabled = false }) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const adjustColorBrightness = (color: string | null | undefined) => {
    if (!color) return '#808080';
    return color;
  };

  const isCategoryStatistics = (item: any): item is CategoryStatisticsProps => {
    return 'effectiveWorkload' in item;
  };

  const cardStyle = {
    ...styles.card,
    backgroundColor: colorScheme === 'light' ? 'white' : '#1A1B1E'
  };

  const subcategoryRowStyle = {
    ...styles.subcategoryRow,
    backgroundColor: colorScheme === 'light' ? '#f5f5f5' : '#2C2E33'
  };

  const textStyle = {
    color: colorScheme === 'dark' ? 'white' : undefined
  };


  return (
    <ScrollView style={styles.scrollView}>
      {data.map((row) => (
        <Card key={row.title} style={cardStyle} variant='outline'>
            <View style={styles.headerRow}>
              <Ionicons 
                name="folder" 
                size={20}
                color={adjustColorBrightness(row.color) || Colors[colorScheme ?? 'light'].text}
              />
              <Text style={[styles.categoryText, textStyle]}>{row.title}</Text>
            </View>

          <View style={styles.statsRow}>
            <View style={styles.statsColumn}>
              <Text style={[styles.label, textStyle]}>{t('Index.effective')}</Text>
              <Text style={[styles.value, textStyle]}>{convertMinutesToHoursAndMinutes(row.effectiveDuration)}</Text>
              {isCategoryStatistics(row) && (
                <Text style={[styles.percentage, textStyle]}>{row.effectiveWorkload}%</Text>
              )}
            </View>

            {!isWorkingHoursDisabled && (
              <View style={styles.statsColumn}>
                <Text style={[styles.label, textStyle]}>{t('Index.target')}</Text>
                <Text style={[styles.value, textStyle]}>{convertMinutesToHoursAndMinutes(row.targetDuration)}</Text>
                {isCategoryStatistics(row) && (
                  <Text style={[styles.percentage, textStyle]}>{row.targetWorkload}%</Text>
                )}
              </View>
            )}
          </View>

          {isCategoryStatistics(row) && row.subcategories?.map((subcategory) => (
            <View key={subcategory.title} style={subcategoryRowStyle}>
              <View style={styles.subcategoryHeader}>
                <Ionicons 
                  name="folder" 
                  size={16}
                  color={adjustColorBrightness(subcategory.color) || Colors[colorScheme ?? 'light'].text}
                />
                <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.subcategoryText, textStyle, styles.subcategoryTitle]}>
                  {subcategory.title}
                </Text>
              </View>
              <Text style={[textStyle, styles.subcategoryDuration]}>
                {convertMinutesToHoursAndMinutes(subcategory.duration)}
              </Text>
            </View>
          ))}
          </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 6,
    padding: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statsColumn: {
    flex: 1,
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  percentage: {
    fontSize: 16,
    fontWeight: '500',
  },
  subcategoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 6,
    borderRadius: 8,
  },
  subcategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  subcategoryText: {
    opacity: 0.8,
  },
  subcategoryTitle: {
    flex: 1,
    marginLeft: 8,
  },
  subcategoryDuration: {
    minWidth: 70,
    textAlign: 'right',
  },
});
