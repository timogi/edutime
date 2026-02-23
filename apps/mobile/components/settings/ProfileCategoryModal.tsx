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
  Text,
} from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import ColorPicker from 'react-native-wheel-color-picker';
import { StyleSheet, View, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { ProfileCategoryData } from '@edutime/shared';
import { useColorScheme } from '@/hooks/useColorScheme';

const rgbToHex = (rgb: string): string => {
  const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!match) return rgb.startsWith('#') ? rgb : '#845ef7';
  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgb(${r},${g},${b})`;
};

interface ProfileCategoryModalProps {
  category: ProfileCategoryData | null;
  onSave: (category: ProfileCategoryData) => void;
  onDelete?: () => void;
  onClose: () => void;
  isOpen: boolean;
}

const DEFAULT_CATEGORY: ProfileCategoryData = {
  id: '',
  title: '',
  subtitle: '',
  color: '#845ef7',
  weight: 0,
  order: null,
  config_profile_id: '',
};

export const ProfileCategoryModal: React.FC<ProfileCategoryModalProps> = ({
  category,
  onSave,
  onDelete,
  onClose,
  isOpen,
}) => {
  const [local, setLocal] = useState<ProfileCategoryData>(category ?? DEFAULT_CATEGORY);
  const { t } = useTranslation();
  const [titleError, setTitleError] = useState('');
  const [weightInput, setWeightInput] = useState('0');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    const cat = category ?? DEFAULT_CATEGORY;
    setLocal(cat);
    setWeightInput(cat.weight.toFixed(1));
    setTitleError('');
  }, [category]);

  const commitWeight = (num: number) => {
    const clamped = Math.min(Math.max(num, 0), 100);
    setLocal({ ...local, weight: clamped });
    setWeightInput(clamped.toFixed(1));
  };

  const handleSave = () => {
    if (local.title.length < 1) {
      setTitleError(t('Settings.TitleRequired'));
      return;
    }
    onSave(local);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent style={[styles.modalContent, isDark && styles.modalContentDark]}>
        <ModalHeader>
          <Text size="lg" color={isDark ? 'white' : 'black'}>
            {category ? t('Settings.editCategory') : t('Settings.createCategory')}
          </Text>
          <ModalCloseButton />
        </ModalHeader>

        <ModalBody>
          <VStack space="md" style={styles.modalBody}>
            <Input>
              <InputField
                value={local.title}
                onChangeText={(v) => {
                  setLocal({ ...local, title: v });
                  setTitleError(v.length < 1 ? t('Settings.TitleRequired') : '');
                }}
                placeholder={t('Settings.title')}
                color={isDark ? 'white' : 'black'}
                placeholderTextColor={isDark ? '#666' : '#999'}
              />
            </Input>
            {titleError ? <Text color="red">{titleError}</Text> : null}

            <Input>
              <InputField
                value={local.subtitle}
                onChangeText={(v) => setLocal({ ...local, subtitle: v })}
                placeholder={t('Settings.subtitle')}
                color={isDark ? 'white' : 'black'}
                placeholderTextColor={isDark ? '#666' : '#999'}
              />
            </Input>

            <VStack space="sm">
              <Text color={isDark ? 'white' : 'black'}>{t('Settings.weight')} (%)</Text>
              <HStack space="sm" style={styles.workloadContainer}>
                <TouchableOpacity
                  style={[styles.adjustButton, isDark && styles.adjustButtonDark]}
                  onPress={() => commitWeight(local.weight - 5)}
                >
                  <Minus size={20} color={isDark ? 'white' : 'black'} />
                </TouchableOpacity>

                <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
                  <TextInput
                    style={[styles.input, isDark && styles.inputDark]}
                    value={weightInput}
                    onChangeText={(text) => {
                      if (/^\d*(\.\d{0,1})?$/.test(text)) {
                        setWeightInput(text);
                        const num = parseFloat(text);
                        if (!isNaN(num)) setLocal({ ...local, weight: num });
                      }
                    }}
                    onBlur={() => {
                      const num = parseFloat(weightInput || '0');
                      commitWeight(isNaN(num) ? 0 : num);
                    }}
                    keyboardType="decimal-pad"
                    textAlign="center"
                    selectTextOnFocus
                  />
                </View>

                <TouchableOpacity
                  style={[styles.adjustButton, isDark && styles.adjustButtonDark]}
                  onPress={() => commitWeight(local.weight + 5)}
                >
                  <Plus size={20} color={isDark ? 'white' : 'black'} />
                </TouchableOpacity>
              </HStack>
            </VStack>

            <View style={styles.colorPickerContainer}>
              <ColorPicker
                color={rgbToHex(local.color || '#845ef7')}
                onColorChangeComplete={(color) => {
                  setLocal({ ...local, color: hexToRgb(color) });
                }}
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
            {onDelete && (
              <Button action="negative" onPress={onDelete}>
                <ButtonText>{t('Settings.delete')}</ButtonText>
              </Button>
            )}
            <Button action="primary" onPress={handleSave}>
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
    margin: 20,
  },
  modalContentDark: {
    backgroundColor: '#1A1B1E',
  },
  modalBody: {
    maxHeight: Dimensions.get('window').height * 0.6,
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
    backgroundColor: '#2A2B2E',
  },
  input: {
    height: 40,
    paddingHorizontal: 8,
    fontSize: 16,
    color: 'black',
  },
  inputDark: {
    color: 'white',
  },
  adjustButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adjustButtonDark: {
    backgroundColor: '#2A2B2E',
  },
  colorPickerContainer: {
    height: 300,
    width: '100%',
  },
});
