import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import {
  VStack,
  Text,
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  SelectItem,
} from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Database } from '@/database.types';

type EducationLevel = Database["public"]["Enums"]["education_level"];

interface EducationLevelInputProps {
  initialValue?: EducationLevel | null;
  onChange: (value: EducationLevel | null) => void;
}

export const EducationLevelInput: React.FC<EducationLevelInputProps> = ({
  initialValue,
  onChange
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const [selectedValue, setSelectedValue] = useState<string>(initialValue ?? '');
  
  // Create translation mapping
  const getTranslation = (level: string) => {
    const translations: Record<string, string> = {
      'kindergarten': t('Settings.kindergarten') || 'Kindergarten',
      'foundation_stage': t('Settings.foundation_stage') || 'Basisstufe',
      'lower_primary': t('Settings.lower_primary') || 'Unterstufe',
      'grade_3_4': t('Settings.grade_3_4') || '3./4. Klasse',
      'middle_primary': t('Settings.middle_primary') || 'Mittelstufe',
      'lower_secondary': t('Settings.lower_secondary') || 'Sekundarstufe I',
      'special_class': t('Settings.special_class') || 'Sonderklasse',
      'special_school': t('Settings.special_school') || 'Sonderschule',
      'vocational_school': t('Settings.vocational_school') || 'Berufsfachschule',
      'upper_secondary': t('Settings.upper_secondary') || 'Mittelschule'
    };
    return translations[level] || level;
  };

  const isDark = colorScheme === 'dark';

  const textStyle = {
    color: isDark ? 'white' : undefined
  };

  const educationLevels: EducationLevel[] = [
    'kindergarten',
    'foundation_stage',
    'lower_primary',
    'grade_3_4',
    'middle_primary',
    'lower_secondary',
    'special_class',
    'special_school',
    'vocational_school',
    'upper_secondary'
  ];

  useEffect(() => {
    setSelectedValue(initialValue ?? '');
  }, [initialValue]);

  const handleValueChange = (value: string) => {
    setSelectedValue(value);
    onChange(value === '' ? null : value as EducationLevel);
  };

  return (
    <VStack space="xs">
      <Text size="sm" style={textStyle}>{t('Settings.education_level')}</Text>
      <Select
        selectedValue={selectedValue}
        onValueChange={handleValueChange}
      >
        <SelectTrigger variant="outline" size="md">
          <SelectInput
            placeholder={t('Settings.education_level_placeholder')}
            value={selectedValue ? getTranslation(selectedValue) : ''}
            style={textStyle}
          />
          <SelectIcon mr="$3" />
        </SelectTrigger>
        <SelectPortal>
          <SelectBackdrop />
          <SelectContent>
            <SelectDragIndicatorWrapper>
              <SelectDragIndicator />
            </SelectDragIndicatorWrapper>
            <SelectItem
              key=""
              label={t('Settings.education_level_placeholder')}
              value=""
            />
            {educationLevels.map((level) => (
              <SelectItem
                key={level}
                label={getTranslation(level)}
                value={level}
              />
            ))}
          </SelectContent>
        </SelectPortal>
      </Select>
    </VStack>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
