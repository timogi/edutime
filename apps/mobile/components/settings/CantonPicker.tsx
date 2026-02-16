import React from 'react';
import { StyleSheet } from 'react-native';
import { 
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  SelectItem
} from '@gluestack-ui/themed';
import { ChevronDownIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface CantonPickerProps {
  selectedCanton: string;
  onCantonChange: (canton: string) => void;
}

const cantons = [
  'BE', 'SG', 'AG', 'TG_S'
];

export const CantonPicker: React.FC<CantonPickerProps> = ({ selectedCanton, onCantonChange }) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const textStyle = {
    color: colorScheme === 'dark' ? 'white' : undefined
  };

  return (
    <Select
      selectedValue={selectedCanton}
      onValueChange={onCantonChange}
      style={styles.select}
      borderColor={colorScheme === 'dark' ? theme.gray[2] : undefined}
    >
      <SelectTrigger>
        <SelectInput 
          placeholder={t('Settings.select-canton')}
          value={selectedCanton ? t(`Cantons.${selectedCanton}`) : undefined}
          style={textStyle}
        />
        <SelectIcon 
          as={ChevronDownIcon} 
          color={colorScheme === 'dark' ? 'white' : undefined}
          marginRight={10}
        />
      </SelectTrigger>
      <SelectPortal>
        <SelectBackdrop />
        <SelectContent>
          <SelectDragIndicatorWrapper>
            <SelectDragIndicator />
          </SelectDragIndicatorWrapper>
          {cantons.map((canton) => (
            <SelectItem
              key={canton}
              label={t(`Cantons.${canton}`)}
              value={canton}
            />
          ))}
        </SelectContent>
      </SelectPortal>
    </Select>
  );
};

const styles = StyleSheet.create({
  select: {
    width: '100%',
    marginVertical: 10,
  }
});
