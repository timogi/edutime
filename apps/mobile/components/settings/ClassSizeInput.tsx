import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import {
  VStack,
  Text,
  Input,
  InputField,
} from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ClassSizeInputProps {
  initialValue?: number | null;
  onChange: (value: number | null) => void;
}

export const ClassSizeInput: React.FC<ClassSizeInputProps> = ({
  initialValue,
  onChange
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const [value, setValue] = useState<string>(initialValue?.toString() ?? '');

  const isDark = colorScheme === 'dark';

  const textStyle = {
    color: isDark ? 'white' : undefined
  };

  useEffect(() => {
    setValue(initialValue?.toString() ?? '');
  }, [initialValue]);

  const handleChange = (text: string) => {
    setValue(text);
    const numericValue = text === '' ? null : parseInt(text, 10);
    if (numericValue !== null && !isNaN(numericValue) && numericValue > 0) {
      onChange(numericValue);
    } else if (text === '') {
      onChange(null);
    }
  };

  return (
    <VStack space="xs">
      <Text size="sm" style={textStyle}>{t('Settings.class_size')}</Text>
      <Input
        variant="outline"
        size="md"
        isInvalid={false}
        isDisabled={false}
      >
        <InputField
          value={value}
          onChangeText={handleChange}
          placeholder={t('Settings.class_size')}
          keyboardType="numeric"
          style={textStyle}
        />
      </Input>
    </VStack>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
