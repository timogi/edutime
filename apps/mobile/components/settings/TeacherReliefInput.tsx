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

interface TeacherReliefInputProps {
  initialValue?: number | null;
  onChange: (value: number | null) => void;
}

export const TeacherReliefInput: React.FC<TeacherReliefInputProps> = ({
  initialValue,
  onChange
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const [selectedValue, setSelectedValue] = useState<string>(initialValue?.toString() ?? '');
  
  const isDark = colorScheme === 'dark';

  const textStyle = {
    color: isDark ? 'white' : undefined
  };

  // Options: 0.5, 1, 1.5, 2 (stored as numbers)
  const teacherReliefOptions = [
    { value: 0.5, label: t('Settings.teacher_relief_half') },
    { value: 1, label: t('Settings.teacher_relief_one') },
    { value: 1.5, label: t('Settings.teacher_relief_one_half') },
    { value: 2, label: t('Settings.teacher_relief_two') },
  ];

  useEffect(() => {
    setSelectedValue(initialValue?.toString() ?? '');
  }, [initialValue]);

  const handleValueChange = (value: string) => {
    setSelectedValue(value);
    onChange(value === '' ? null : parseFloat(value));
  };

  const getDisplayValue = () => {
    if (!selectedValue) return '';
    const option = teacherReliefOptions.find(opt => opt.value.toString() === selectedValue);
    return option ? option.label : '';
  };

  return (
    <VStack space="xs">
      <Text size="sm" style={textStyle}>{t('Settings.teacher_relief')}</Text>
      <Select
        selectedValue={selectedValue}
        onValueChange={handleValueChange}
      >
        <SelectTrigger variant="outline" size="md">
          <SelectInput
            placeholder={t('Settings.teacher_relief_placeholder')}
            value={getDisplayValue()}
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
              label={t('Settings.teacher_relief_placeholder')}
              value=""
            />
            {teacherReliefOptions.map((option) => (
              <SelectItem
                key={option.value.toString()}
                label={option.label}
                value={option.value.toString()}
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
