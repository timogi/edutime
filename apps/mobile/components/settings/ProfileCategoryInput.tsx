import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import {
  Card,
  Text,
  VStack,
  HStack,
  Button,
  ButtonText,
  Input,
  InputField,
} from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ProfileCategoryData } from '@edutime/shared';
import { ProfileCategoryModal } from './ProfileCategoryModal';

interface ProfileCategoryInputProps {
  profileCategories: ProfileCategoryData[];
  onCreateCategory: (category: Omit<ProfileCategoryData, 'id' | 'config_profile_id'>) => Promise<void>;
  onEditCategory: (id: string, updates: Partial<ProfileCategoryData>) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

export const ProfileCategoryInput: React.FC<ProfileCategoryInputProps> = ({
  profileCategories,
  onCreateCategory,
  onEditCategory,
  onDeleteCategory,
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProfileCategoryData | null>(null);

  const cardStyle = {
    ...styles.card,
    backgroundColor: isDark ? '#1A1B1E' : 'white',
  };

  const textStyle = {
    color: isDark ? 'white' : 'black',
  };

  const handleCategoryPress = (category: ProfileCategoryData) => {
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

  const handleModalSave = async (category: ProfileCategoryData) => {
    if (selectedCategory) {
      await onEditCategory(selectedCategory.id, {
        title: category.title,
        color: category.color,
        weight: category.weight,
        order: category.order,
      });
    } else {
      await onCreateCategory({
        title: category.title,
        color: category.color,
        weight: category.weight,
        order: category.order,
      });
    }
    setModalVisible(false);
    setSelectedCategory(null);
  };

  const handleDelete = async (id: string) => {
    await onDeleteCategory(id);
    setModalVisible(false);
    setSelectedCategory(null);
  };

  const totalWeight = profileCategories.reduce((sum, cat) => sum + cat.weight, 0);

  return (
    <Card style={cardStyle} variant="outline">
      <VStack space="md" style={styles.container}>
        <HStack space="sm" style={styles.headerContainer}>
          <Text size="xl" style={textStyle}>{t('Settings.customCategories')}</Text>
          <Text size="sm" style={{ color: Math.abs(totalWeight - 100) > 0.01 ? '#FF9800' : theme.gray[6] }}>
            {totalWeight.toFixed(0)}%
          </Text>
        </HStack>

        {profileCategories.length > 0 && (
          <View style={styles.tableContainer}>
            <View style={[styles.tableHeader, isDark && styles.tableHeaderDark]}>
              <View style={styles.columnTitle}>
                <Text style={[styles.headerCell, textStyle]}>{t('Settings.title')}</Text>
              </View>
              <View style={styles.columnColor}>
                <Text style={[styles.headerCell, textStyle]}>{t('Settings.color')}</Text>
              </View>
              <View style={styles.columnWeight}>
                <Text style={[styles.headerCell, textStyle]}>{t('Settings.weight')}</Text>
              </View>
            </View>

            <View>
              {profileCategories.map((category) => (
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
                  <View style={styles.columnWeight}>
                    <Text style={[styles.cell, textStyle]}>{category.weight}%</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <Button onPress={handleCreatePress} style={styles.button}>
          <IconSymbol name="plus" size={20} color="white" />
          <ButtonText>{t('Settings.createCategory')}</ButtonText>
        </Button>

        <ProfileCategoryModal
          isOpen={modalVisible}
          category={selectedCategory}
          onClose={handleModalClose}
          onSave={handleModalSave}
          onDelete={selectedCategory ? () => handleDelete(selectedCategory.id) : undefined}
        />
      </VStack>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    padding: 12,
    width: '100%',
  },
  container: {
    width: '100%',
  },
  headerContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
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
    width: 80,
    alignItems: 'center',
  },
  columnWeight: {
    width: 80,
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
