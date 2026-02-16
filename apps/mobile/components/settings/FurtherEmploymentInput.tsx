import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import {
  Card,
  Text,
  VStack,
  Button,
  ButtonText
} from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { CategoryModal } from './CategoryModal';
import { EmploymentCategory } from '@/lib/types';
import { useColorScheme } from '@/hooks/useColorScheme';

interface FurtherEmploymentInputProps {
  userCategories: EmploymentCategory[];
  onEditCategory: (category: EmploymentCategory) => Promise<void>;
  onCreateCategory: (category: EmploymentCategory) => Promise<void>;
  onDeleteCategory: (categoryId: number) => Promise<void>;
}

export const FurtherEmploymentInput: React.FC<FurtherEmploymentInputProps> = ({
  userCategories,
  onEditCategory,
  onCreateCategory,
  onDeleteCategory
}) => {
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<EmploymentCategory | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const cardStyle = {
    ...styles.card,
    backgroundColor: isDark ? '#1A1B1E' : 'white'
  };

  const textStyle = {
    color: isDark ? 'white' : 'black'
  };

  const handleCategoryPress = (category: EmploymentCategory) => {
    setSelectedCategory(category);
    setModalVisible(true);
  };

  const handleCreatePress = () => {
    setSelectedCategory(null);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedCategory(null);
  };

  const handleModalSave = (category: EmploymentCategory) => {
    if (selectedCategory) {
      onEditCategory(category);
    } else {
      onCreateCategory(category);
    }
    setModalVisible(false);
    setSelectedCategory(null);
  };

  return (
    <Card style={cardStyle} variant="outline">
      <VStack space="md" style={styles.container}>
        <Text size="xl" style={textStyle}>{t('Settings.furtherEmployment')}</Text>

        {userCategories.length > 0 && (
          <View style={styles.tableContainer}>
            <View style={[styles.tableHeader, isDark && styles.tableHeaderDark]}>
              <View style={styles.columnTitle}>
                <Text style={[styles.headerCell, textStyle]}>{t('Settings.title')}</Text>
              </View>
              <View style={styles.columnColor}>
                <Text style={[styles.headerCell, textStyle]}>{t('Settings.color')}</Text>
              </View>
              <View style={styles.columnWorkload}>
                <Text style={[styles.headerCell, textStyle]}>{t('Settings.workload')}</Text>
              </View>
            </View>

            <View>
              {userCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => handleCategoryPress(category)}
                  style={[styles.tableRow, isDark && styles.tableRowDark]}
                >
                  <View style={styles.columnTitle}>
                    <Text numberOfLines={1} style={[styles.cell, textStyle]}>{category.title}</Text>
                  </View>
                  <View style={styles.columnColor}>
                    <View style={[styles.colorCell, { backgroundColor: category.color || '#000' }]} />
                  </View>
                  <View style={styles.columnWorkload}>
                    <Text style={[styles.cell, textStyle]}>{category.workload}%</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <Button
          onPress={handleCreatePress}
          style={styles.button}
        >
          <IconSymbol name="plus" size={20} color="white" />
          <ButtonText>{t('Settings.createEmployment')}</ButtonText>
        </Button>

        <CategoryModal
          isOpen={modalVisible}
          category={selectedCategory || {
            id: 0,
            title: '',
            subtitle: '',
            workload: 20,
            color: 'rgb(104, 240, 113)',
          }}
          onClose={handleModalClose}
          onSave={handleModalSave}
          onDelete={onDeleteCategory}
        />
      </VStack>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    padding: 12,
    width: '100%'
  },
  container: {
    width: '100%',
  },
  tableContainer: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 8,
  },
  tableHeaderDark: {
    borderBottomColor: '#333',
  },
  headerCell: {
    fontWeight: 'bold',
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 8,
  },
  tableRowDark: {
    borderBottomColor: '#333',
  },
  columnTitle: {
    flex: 2,
    paddingHorizontal: 8,
  },
  columnColor: {
    width: 100,
    alignItems: 'center',
  },
  columnWorkload: {
    width: 100,
    alignItems: 'center',
  },
  cell: {
    paddingHorizontal: 8,
  },
  colorCell: {
    width: 16,
    height: 16,
    borderRadius: 8,
    opacity: 0.5,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
