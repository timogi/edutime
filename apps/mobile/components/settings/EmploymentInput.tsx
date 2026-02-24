import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import {
  Card,
  Text,
  Button,
  ButtonText,
  VStack,
  HStack,
} from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { CantonPicker } from './CantonPicker';
import { showErrorToast } from '@/components/ui/Toast';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { CantonData } from '@/lib/types';
import { WorkloadInput } from './WorkloadInput';
import { PercentageInput } from './PercentageInput';
import { YearlyHoursInput } from './YearyHoursInput';
import { ClassSizeInput } from './ClassSizeInput';
import { EducationLevelInput } from './EducationLevelInput';
import { TeacherReliefInput } from './TeacherReliefInput';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ProfileCategoryModal } from './ProfileCategoryModal';
import { Database, ConfigMode, ConfigProfileData, ProfileCategoryData } from '@edutime/shared';

interface EmploymentInputProps {
  onSave: (workload: number, canton: string, customWorkHours?: number, userPercentages?: {[key: number]: number}, classSize?: number | null, educationLevel?: Database["public"]["Enums"]["education_level"] | null, teacherRelief?: number | null) => void;
  onCantonChange: (canton: string) => void;
  onSaveCustom?: (annualWorkHours: number, workload: number) => void;
  onActivateCustomMode?: () => void;
  onDeactivateCustomMode?: () => void;
  cantonData: CantonData;
  userData?: Database["public"]["Tables"]["users"]["Row"] | null;
  configMode?: ConfigMode;
  configProfile?: ConfigProfileData | null;
  profileCategories?: ProfileCategoryData[];
  onCreateProfileCategory?: (category: Omit<ProfileCategoryData, 'id' | 'config_profile_id'>) => Promise<void>;
  onEditProfileCategory?: (id: string, updates: Partial<ProfileCategoryData>) => Promise<void>;
  onDeleteProfileCategory?: (id: string) => Promise<void>;
}

export const EmploymentInput: React.FC<EmploymentInputProps> = ({
  onSave,
  onCantonChange,
  onSaveCustom,
  onActivateCustomMode,
  onDeactivateCustomMode,
  cantonData,
  userData,
  configMode = 'default',
  configProfile,
  profileCategories = [],
  onCreateProfileCategory,
  onEditProfileCategory,
  onDeleteProfileCategory,
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  const [workload, setWorkload] = useState<number>(userData?.workload ?? 0);
  const [customWorkHours, setCustomWorkHours] = useState<number>(userData?.custom_work_hours ?? 1890);
  const [canton, setCanton] = useState<string>(userData?.canton_code ?? '');
  const [userPercentages, setUserPercentages] = useState<{[key: number]: number | ''}>({});
  const [classSize, setClassSize] = useState<number | null>(userData?.class_size ?? null);
  const [educationLevel, setEducationLevel] = useState<Database["public"]["Enums"]["education_level"] | null>(userData?.education_level ?? null);
  const [teacherRelief, setTeacherRelief] = useState<number | null>(userData?.teacher_relief ?? null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [customAnnualHours, setCustomAnnualHours] = useState<number>(configProfile?.annual_work_hours ?? 1930);
  const [profileCatModalVisible, setProfileCatModalVisible] = useState(false);
  const [selectedProfileCategory, setSelectedProfileCategory] = useState<ProfileCategoryData | null>(null);

  const isCustom = configMode === 'custom';

  const cardStyle = {
    ...styles.card,
    backgroundColor: isDark ? '#1A1B1E' : 'white'
  };

  const textStyle = {
    color: isDark ? 'white' : undefined
  };

  const initializeUserPercentages = (data: CantonData) => {
    const initialPercentages: { [key: number]: number | '' } = {};
    data.category_sets.forEach((categorySet) => {
      initialPercentages[categorySet.id] = categorySet.user_percentage ?? '';
    });
    setUserPercentages(initialPercentages);
  };

  useEffect(() => {
    setWorkload(userData?.workload ?? 0);
    setCanton(userData?.canton_code ?? '');
    setClassSize(userData?.class_size ?? null);
    setEducationLevel(userData?.education_level ?? null);
    setTeacherRelief(userData?.teacher_relief ?? null);
  }, [userData]);

  useEffect(() => {
    if (configProfile) {
      setCustomAnnualHours(configProfile.annual_work_hours);
    }
  }, [configProfile]);

  useEffect(() => {
    if (cantonData) {
      initializeUserPercentages(cantonData);
    }
  }, [cantonData]);

  useEffect(() => {
    if (isCustom) {
      const isWorkloadChanged = workload !== (userData?.workload ?? 0);
      const isCustomAnnualChanged = customAnnualHours !== (configProfile?.annual_work_hours ?? 1930);
      setHasUnsavedChanges(isWorkloadChanged || isCustomAnnualChanged);
      return;
    }

    const isWorkloadChanged = workload !== (userData?.workload ?? 0);
    const isCustomWorkHoursChanged = customWorkHours !== (userData?.custom_work_hours ?? 1890);
    const isClassSizeChanged = classSize !== (userData?.class_size ?? null);
    const isEducationLevelChanged = educationLevel !== (userData?.education_level ?? null);
    const isTeacherReliefChanged = teacherRelief !== (userData?.teacher_relief ?? null);
    
    let isUserPercentagesChanged = false;
    if (cantonData?.is_configurable) {
      const currentPercentages = cantonData.category_sets.reduce((acc, categorySet) => {
        acc[categorySet.id] = categorySet.user_percentage ?? '';
        return acc;
      }, {} as {[key: number]: number | ''});
      
      const currentString = JSON.stringify(currentPercentages);
      const userString = JSON.stringify(userPercentages);
      isUserPercentagesChanged = currentString !== userString;
    }
    
    setHasUnsavedChanges(isWorkloadChanged || isCustomWorkHoursChanged || isUserPercentagesChanged || isClassSizeChanged || isEducationLevelChanged || isTeacherReliefChanged);
  }, [workload, userData?.workload, customWorkHours, userData?.custom_work_hours, userPercentages, cantonData, classSize, userData?.class_size, educationLevel, userData?.education_level, teacherRelief, userData?.teacher_relief, isCustom, customAnnualHours, configProfile?.annual_work_hours]);

  const calculateActualWorkload = () => {
    return ((workload / 100) * customWorkHours).toFixed(2);
  };

  const handleWorkloadChange = (value: number) => {
    setWorkload(value);
  };

  const handleCantonChange = (newCanton: string) => {
    setCanton(newCanton);
    if (cantonData?.is_configurable) {
      initializeUserPercentages(cantonData);
    }
    onCantonChange(newCanton);
  };

  const handleCustomWorkHoursChange = (value: number) => {
    setCustomWorkHours(value);
  };

  const handlePercentageChange = (categorySetId: number, value: number | '') => {
    setUserPercentages(prev => ({
      ...prev,
      [categorySetId]: value !== undefined && value !== null ? value : '',
    }));
  };

  const handleClassSizeChange = (value: number | null) => {
    setClassSize(value);
  };

  const handleEducationLevelChange = (value: Database["public"]["Enums"]["education_level"] | null) => {
    setEducationLevel(value);
  };

  const handleTeacherReliefChange = (value: number | null) => {
    setTeacherRelief(value);
  };

  const calculateTotalPercentage = () => {
    return Object.values(userPercentages).reduce((sum: number, value: number | '') => {
      if (typeof value === 'number') {
        return sum + value;
      }
      return sum;
    }, 0);
  };

  const handleModeSwitch = (mode: ConfigMode) => {
    if (mode === 'custom' && configMode !== 'custom') {
      onActivateCustomMode?.();
    } else if (mode === 'default' && configMode === 'custom') {
      onDeactivateCustomMode?.();
    }
  };

  const handleSave = () => {
    if (isCustom) {
      onSaveCustom?.(customAnnualHours, workload);
      setHasUnsavedChanges(false);
      return;
    }

    if (cantonData?.is_configurable) {
      const total = calculateTotalPercentage();
      if (Math.abs(total - 100) > 0.01) {
        showErrorToast(t('Index.error'), t('Settings.percentages_must_sum_to_100'));
        return;
      }
    }
    const numericUserPercentages: {[key: number]: number} = {};
    Object.entries(userPercentages).forEach(([key, value]) => {
      if (typeof value === 'number') {
        numericUserPercentages[Number(key)] = value;
      }
    });
    
    onSave(
      workload, 
      canton, 
      cantonData?.use_custom_work_hours ? customWorkHours : undefined, 
      cantonData?.is_configurable ? numericUserPercentages : undefined,
      canton === 'TG_S' ? classSize : undefined,
      canton === 'TG_S' ? educationLevel : undefined,
      canton === 'TG_S' ? teacherRelief : undefined
    );
    setHasUnsavedChanges(false);
  };

  const handleProfileCategoryPress = (category: ProfileCategoryData) => {
    setSelectedProfileCategory(category);
    setProfileCatModalVisible(true);
  };

  const handleCreateProfileCategoryPress = () => {
    setSelectedProfileCategory(null);
    setProfileCatModalVisible(true);
  };

  const handleProfileCategoryModalClose = () => {
    setProfileCatModalVisible(false);
    setSelectedProfileCategory(null);
  };

  const handleProfileCategoryModalSave = async (category: ProfileCategoryData) => {
    if (selectedProfileCategory) {
      await onEditProfileCategory?.(selectedProfileCategory.id, {
        title: category.title,
        color: category.color,
        weight: category.weight,
        order: category.order,
      });
    } else {
      await onCreateProfileCategory?.({
        title: category.title,
        color: category.color,
        weight: category.weight,
        order: category.order,
      });
    }
    setProfileCatModalVisible(false);
    setSelectedProfileCategory(null);
  };

  const handleProfileCategoryDelete = async (id: string) => {
    await onDeleteProfileCategory?.(id);
    setProfileCatModalVisible(false);
    setSelectedProfileCategory(null);
  };

  const totalProfileWeight = profileCategories.reduce((sum, cat) => sum + cat.weight, 0);

  return (
    <Card style={cardStyle} variant="outline">
      <VStack space="md" style={styles.container}>
        <HStack space="sm" style={styles.headerContainer}>
          <Text size="xl" style={textStyle}>{t('Settings.employment')}</Text>
          {hasUnsavedChanges && (
            <Text size="sm" style={styles.unsavedIndicator}>
              {t('Settings.unsaved-changes')}
            </Text>
          )}
        </HStack>

        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              !isCustom && styles.segmentButtonActive,
              isDark && styles.segmentButtonDark,
              !isCustom && isDark && styles.segmentButtonActiveDark,
            ]}
            onPress={() => handleModeSwitch('default')}
          >
            <Text style={[
              styles.segmentText,
              !isCustom && styles.segmentTextActive,
              isDark && styles.segmentTextDark,
            ]}>
              {t('Settings.cantonMode')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              isCustom && styles.segmentButtonActive,
              isDark && styles.segmentButtonDark,
              isCustom && isDark && styles.segmentButtonActiveDark,
            ]}
            onPress={() => handleModeSwitch('custom')}
          >
            <Text style={[
              styles.segmentText,
              isCustom && styles.segmentTextActive,
              isDark && styles.segmentTextDark,
            ]}>
              {t('Settings.customMode')}
            </Text>
          </TouchableOpacity>
        </View>

        <Text size="sm" style={textStyle}>{t('Settings.workload')}</Text>
        <WorkloadInput
          initialValue={workload}
          onChange={handleWorkloadChange}
        />

        {isCustom ? (
          <VStack space="sm">
            <Text size="sm" style={textStyle}>{t('Settings.annualWorkHours')}</Text>
            <YearlyHoursInput
              initialValue={customAnnualHours}
              onChange={(value) => setCustomAnnualHours(value)}
              placeholder={t('Settings.annualWorkHours')}
            />

            <Card style={[styles.profileCategoryCard, isDark && styles.profileCategoryCardDark]}>
              <VStack space="md">
                <Text size="lg" bold style={textStyle}>{t('Settings.customCategoriesTitle')}</Text>
                <Text size="sm" style={{ color: theme.gray[6] }}>
                  {t('Settings.customCategoriesInfo')}
                </Text>

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
                          onPress={() => handleProfileCategoryPress(category)}
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
                      <View style={[styles.tableRow, isDark && styles.tableRowDark]}>
                        <View style={styles.columnTitle}>
                          <Text style={[styles.cell, styles.totalCell, textStyle]}>{t('Settings.total')}</Text>
                        </View>
                        <View style={styles.columnColor} />
                        <View style={styles.columnWeight}>
                          <Text
                            style={[
                              styles.cell,
                              styles.totalCell,
                              { color: Math.abs(totalProfileWeight - 100) > 0.01 ? '#FF9800' : textStyle.color },
                            ]}
                          >
                            {totalProfileWeight.toFixed(0)}%
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                <Button onPress={handleCreateProfileCategoryPress} style={styles.addCategoryButton}>
                  <IconSymbol name="plus" size={20} color="white" />
                  <ButtonText>{t('Settings.createCategory')}</ButtonText>
                </Button>
              </VStack>
            </Card>

            <ProfileCategoryModal
              isOpen={profileCatModalVisible}
              category={selectedProfileCategory}
              onClose={handleProfileCategoryModalClose}
              onSave={handleProfileCategoryModalSave}
              onDelete={selectedProfileCategory ? () => handleProfileCategoryDelete(selectedProfileCategory.id) : undefined}
            />
          </VStack>
        ) : (
          <>
            <CantonPicker
              selectedCanton={canton}
              onCantonChange={handleCantonChange}
            />

            {cantonData?.use_custom_work_hours && (
              <VStack space="sm">
                <YearlyHoursInput
                  initialValue={customWorkHours}
                  onChange={handleCustomWorkHoursChange}
                  placeholder={t('Settings.custom_work_hours')}
                />
                <Text size="sm" style={textStyle}>
                  {t('Settings.actual_workload')}: {calculateActualWorkload()} {t('Settings.hours')}
                </Text>
              </VStack>
            )}

            {canton === 'TG_S' && (
              <VStack space="sm">
                <ClassSizeInput
                  initialValue={classSize}
                  onChange={handleClassSizeChange}
                />
                <EducationLevelInput
                  initialValue={educationLevel}
                  onChange={handleEducationLevelChange}
                />
                <TeacherReliefInput
                  initialValue={teacherRelief}
                  onChange={handleTeacherReliefChange}
                />
              </VStack>
            )}

            {cantonData?.is_configurable && cantonData.category_sets && (
              <Card style={[styles.categoryCard, isDark && styles.categoryCardDark]}>
                <VStack space="md">
                  {cantonData.category_sets.map((categorySet) => (
                    <View key={categorySet.id}>
                      <Text size="sm" marginBottom={4} style={textStyle}>
                        {(() => {
                          const translationKey = `Categories.${categorySet.title}`;
                          const translatedLabel = t(translationKey);
                          return translatedLabel === translationKey ? categorySet.title : translatedLabel;
                        })()}
                      </Text>
                      <PercentageInput
                        initialValue={userPercentages[categorySet.id] !== undefined ? userPercentages[categorySet.id] : ''}
                        onChange={(value) => handlePercentageChange(categorySet.id, value)}
                        step={1}
                      />
                    </View>
                  ))}
                </VStack>
              </Card>
            )}
          </>
        )}

        <Button
          onPress={handleSave}
          style={[styles.button, hasUnsavedChanges && styles.buttonWithChanges]}
        >
          <ButtonText>{t('Settings.save')}</ButtonText>
        </Button>
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
  container: { width: '100%' },
  headerContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  segmentButtonActive: {
    backgroundColor: '#845ef7',
  },
  segmentButtonDark: {
    backgroundColor: '#2C2D30',
  },
  segmentButtonActiveDark: {
    backgroundColor: '#845ef7',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  segmentTextActive: {
    color: 'white',
  },
  segmentTextDark: {
    color: '#aaa',
  },
  button: { marginTop: 16, width: '100%' },
  buttonWithChanges: { backgroundColor: '#4CAF50' },
  unsavedIndicator: {
    color: '#FF9800',
    fontStyle: 'italic',
  },
  categoryCard: {
    marginTop: 8,
    padding: 8,
  },
  categoryCardDark: {
    backgroundColor: '#3A3B3E'
  },
  profileCategoryCard: {
    marginTop: 8,
    padding: 8,
  },
  profileCategoryCardDark: {
    backgroundColor: '#3A3B3E',
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
  totalCell: {
    fontWeight: '700',
  },
  colorCell: {
    width: 16,
    height: 16,
    borderRadius: 8,
    opacity: 0.5,
  },
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
