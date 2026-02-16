import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  ButtonText,
  VStack,
  HStack,
  Input,
  InputField,
  Text
} from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import ColorPicker from 'react-native-wheel-color-picker';
import { StyleSheet, View, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { EmploymentCategory } from '@/lib/types';
import { useColorScheme } from '@/hooks/useColorScheme';

// Helper functions for color conversion
const rgbToHex = (rgb: string): string => {
  const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!match) return '#000000';
  
  const r = parseInt(match[1]);
  const g = parseInt(match[2]); 
  const b = parseInt(match[3]);

  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return 'rgb(0,0,0)';
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `rgb(${r},${g},${b})`;
};

interface CategoryModalProps {
  category: EmploymentCategory;
  onSave: (category: EmploymentCategory) => void;
  onDelete: (categoryId: number) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  category,
  onSave,
  onDelete,
  onClose,
  isOpen
}) => {
  const [localCategory, setLocalCategory] = useState<EmploymentCategory>(category);
  const { t } = useTranslation();
  const [titleError, setTitleError] = useState('');
  const [workloadInput, setWorkloadInput] = useState(localCategory.workload.toFixed(2));
  const colorScheme = useColorScheme();

  const isDark = colorScheme === 'dark';

  useEffect(() => {
    setLocalCategory(category);
    setWorkloadInput(category.workload.toFixed(2));
  }, [category]);

  const handleCategoryChange = (field: keyof EmploymentCategory, value: string) => {
    setLocalCategory({ ...localCategory, [field]: value });
  };

  const handleTitleChange = (value: string) => {
    if (value.length < 1) {
      setTitleError(t('Settings.TitleRequired'));
    } else {
      setTitleError('');
    }
    setLocalCategory({ ...localCategory, title: value });
  };

  const commit = (num: number) => {
    const clamped = Math.min(Math.max(num, 0), 500);
    setLocalCategory({ ...localCategory, workload: clamped });
    setWorkloadInput(clamped.toFixed(2));
  };

  const handleWorkloadBlur = () => {
    const num = parseFloat(workloadInput || '0');
    if (!isNaN(num)) commit(num);
    else commit(0);
  };

  const incrementWorkload = () => commit(localCategory.workload + 5);
  const decrementWorkload = () => commit(localCategory.workload - 5);

  const handleWorkloadChange = (text: string) => {
    const regex = /^\d*(\.\d{0,2})?$/;
    if (regex.test(text)) {
      setWorkloadInput(text);
      const num = parseFloat(text);
      if (!isNaN(num)) {
        setLocalCategory({ ...localCategory, workload: num });
      }
    }
  };

  const handleColorChangeComplete = (color: string) => {
    const rgbColor = hexToRgb(color);
    handleCategoryChange('color', rgbColor);
  };

  const handleSave = () => {
    if (localCategory.title.length < 1) {
      setTitleError(t('Settings.TitleRequired'));
      return;
    }
    onSave(localCategory);
  };

  const handleDelete = async (categoryId: number) => {
    onDelete(categoryId);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent style={[styles.modalContent, isDark && styles.modalContentDark]}>
        <ModalHeader>
          <Text size="lg" color={isDark ? 'white' : 'black'}>
            {localCategory.id ? t('Settings.editEmployment') : t('Settings.createEmployment')}
          </Text>
          <ModalCloseButton />
        </ModalHeader>

        <ModalBody>
          <VStack space="md" style={styles.modalBody}>
            <Input>
              <InputField
                value={localCategory.title}
                onChangeText={handleTitleChange}
                placeholder={t('Settings.title')}
                color={isDark ? 'white' : 'black'}
                placeholderTextColor={isDark ? '#666' : '#999'}
              />
            </Input>
            {titleError && <Text color="red">{titleError}</Text>}

            <Input>
              <InputField
                value={localCategory.subtitle}
                onChangeText={(value) => handleCategoryChange('subtitle', value)}
                placeholder={t('Settings.subtitle')}
                color={isDark ? 'white' : 'black'}
                placeholderTextColor={isDark ? '#666' : '#999'}
              />
            </Input>

            <VStack space="sm">
              <Text color={isDark ? 'white' : 'black'}>{t('Settings.workload')}</Text>
              <HStack space="sm" style={styles.workloadContainer}>
                <TouchableOpacity 
                  style={[styles.adjustButton, isDark && styles.adjustButtonDark]} 
                  onPress={decrementWorkload}
                >
                  <Minus size={20} color={isDark ? 'white' : 'black'} />
                </TouchableOpacity>

                <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
                  <TextInput
                    style={[styles.input, isDark && styles.inputDark]}
                    value={workloadInput}
                    onChangeText={handleWorkloadChange}
                    onBlur={handleWorkloadBlur}
                    keyboardType="decimal-pad"
                    textAlign="center"
                    selectTextOnFocus
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect={false}
                    inputMode="decimal"
                    returnKeyType="done"
                    maxLength={7}
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.adjustButton, isDark && styles.adjustButtonDark]} 
                  onPress={incrementWorkload}
                >
                  <Plus size={20} color={isDark ? 'white' : 'black'} />
                </TouchableOpacity>
              </HStack>
            </VStack>

            <View style={styles.colorPickerContainer}>
              <ColorPicker
                color={rgbToHex(localCategory.color || 'rgb(0,0,0)')}
                onColorChangeComplete={handleColorChangeComplete}
                thumbSize={30}
                sliderSize={30}
                noSnap={true}
                row={false}
                swatches={true}
                discrete={true}
              />
            </View>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack space="md" justifyContent="flex-end" width="100%">
            {!!localCategory.id && (
              <Button
                action="negative"
                onPress={() => handleDelete(localCategory.id)}
              >
                <ButtonText>{t('Settings.delete')}</ButtonText>
              </Button>
            )}
            <Button
              action="primary"
              onPress={handleSave}
            >
              <ButtonText>{t('Settings.save')}</ButtonText>
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: 'white',
    maxHeight: Dimensions.get('window').height * 0.9,
    width: Dimensions.get('window').width * 0.9,
    margin: 20
  },
  modalContentDark: {
    backgroundColor: '#1A1B1E'
  },
  modalBody: {
    maxHeight: Dimensions.get('window').height * 0.6
  },
  workloadContainer: { width: '100%' },
  inputWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  inputWrapperDark: {
    borderColor: '#333',
    backgroundColor: '#2A2B2E'
  },
  input: {
    height: 40,
    paddingHorizontal: 8,
    fontSize: 16,
    color: 'black'
  },
  inputDark: {
    color: 'white'
  },
  adjustButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adjustButtonDark: {
    backgroundColor: '#2A2B2E'
  },
  colorPickerContainer: {
    height: 300,
    width: '100%'
  }
});
