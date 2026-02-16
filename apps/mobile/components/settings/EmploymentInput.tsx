import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Card,
  Text,
  Button,
  ButtonText,
  VStack,
  HStack,
  Input,
  InputField,
  useToast,
  Toast,
  ToastTitle
} from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { CantonPicker } from './CantonPicker';
import { Table } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { CantonData } from '@/lib/types';
import { WorkloadInput } from './WorkloadInput';
import { PercentageInput } from './PercentageInput';
import { YearlyHoursInput } from './YearyHoursInput';
import { ClassSizeInput } from './ClassSizeInput';
import { EducationLevelInput } from './EducationLevelInput';
import { TeacherReliefInput } from './TeacherReliefInput';
import { Database } from '@/database.types';

interface EmploymentInputProps {
  onSave: (workload: number, canton: string, customWorkHours?: number, userPercentages?: {[key: number]: number}, classSize?: number | null, educationLevel?: Database["public"]["Enums"]["education_level"] | null, teacherRelief?: number | null) => void;
  onCantonChange: (canton: string) => void;
  cantonData: CantonData;
  userData?: Database["public"]["Tables"]["users"]["Row"] | null;
}

export const EmploymentInput: React.FC<EmploymentInputProps> = ({
  onSave,
  onCantonChange,
  cantonData,
  userData
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const toast = useToast();

  const [workload, setWorkload] = useState<number>(userData?.workload ?? 0);
  const [customWorkHours, setCustomWorkHours] = useState<number>(userData?.custom_work_hours ?? 1890);
  const [canton, setCanton] = useState<string>(userData?.canton_code ?? '');
  const [userPercentages, setUserPercentages] = useState<{[key: number]: number | ''}>({});
  const [classSize, setClassSize] = useState<number | null>(userData?.class_size ?? null);
  const [educationLevel, setEducationLevel] = useState<Database["public"]["Enums"]["education_level"] | null>(userData?.education_level ?? null);
  const [teacherRelief, setTeacherRelief] = useState<number | null>(userData?.teacher_relief ?? null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const isDark = colorScheme === 'dark';

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
    if (cantonData) {
      initializeUserPercentages(cantonData);
    }
  }, [cantonData]);

  useEffect(() => {
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
  }, [workload, userData?.workload, customWorkHours, userData?.custom_work_hours, userPercentages, cantonData, classSize, userData?.class_size, educationLevel, userData?.education_level, teacherRelief, userData?.teacher_relief]);

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

  const handleSave = () => {
    if (cantonData?.is_configurable) {
      const total = calculateTotalPercentage();
      if (Math.abs(total - 100) > 0.01) {
        toast.show({
          placement: "top", 
          render: () => (
            <Toast action="error" variant="outline">
              <VStack space="xs">
                <ToastTitle>{t('Settings.percentages_must_sum_to_100')}</ToastTitle>
              </VStack>
            </Toast>
          ),
        });
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

        <Text size="sm" style={textStyle}>{t('Settings.workload')}</Text>
        <WorkloadInput
          initialValue={workload}
          onChange={handleWorkloadChange}
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

        <CantonPicker
          selectedCanton={canton}
          onCantonChange={handleCantonChange}
        />

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
  workloadContainer: { width: '100%' },
  button: { marginTop: 16, width: '100%' },
  buttonWithChanges: { backgroundColor: '#4CAF50' },
  adjustButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  }
});
