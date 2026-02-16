import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, TextInput } from 'react-native';
import { HStack } from '@gluestack-ui/themed';
import { Minus, Plus } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

interface WorkloadInputProps {
  initialValue?: number;
  onChange?: (value: number) => void;
  onBlur?: () => void;
  min?: number;
  max?: number;
  step?: number;
}

export const WorkloadInput: React.FC<WorkloadInputProps> = ({
  initialValue = 100,
  onChange,
  onBlur,
  min = 0,
  max = 500,
  step = 5
}) => {
  const [value, setValue] = useState(initialValue);
  const [inputValue, setInputValue] = useState(initialValue.toFixed(2));
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const commit = (num: number) => {
    const clamped = Math.min(Math.max(num, min), max);
    setValue(clamped);
    setInputValue(clamped.toFixed(2));
    onChange?.(clamped);
  };

  const handleBlur = () => {
    const num = parseFloat(inputValue || '0');
    if (!isNaN(num)) commit(num);
    else commit(0);
    onBlur?.();
  };

  const increment = () => commit(value + step);
  const decrement = () => commit(value - step);

  const handleChange = (text: string) => {
    const regex = /^\d*(\.\d{0,2})?$/;
    if (regex.test(text)) {
      setInputValue(text);
      const num = parseFloat(text);
      if (!isNaN(num)) setValue(num);
    }
  };

  return (
    <HStack space="sm" style={styles.workloadContainer}>
      <TouchableOpacity 
        style={[styles.adjustButton, isDark && styles.adjustButtonDark]} 
        onPress={decrement}
      >
        <Minus size={20} color={isDark ? 'white' : 'black'} />
      </TouchableOpacity>

      <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
        <TextInput
          style={[styles.input, isDark && styles.inputDark]}
          value={inputValue}
          onChangeText={handleChange}
          onBlur={handleBlur}
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
        onPress={increment}
      >
        <Plus size={20} color={isDark ? 'white' : 'black'} />
      </TouchableOpacity>
    </HStack>
  );
};

const styles = StyleSheet.create({
  workloadContainer: { 
    width: '100%' 
  },
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
    height: 42,
    width: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adjustButtonDark: {
    backgroundColor: '#2A2B2E'
  }
});
