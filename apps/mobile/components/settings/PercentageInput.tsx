import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, TextInput } from 'react-native';
import { HStack } from '@gluestack-ui/themed';
import { Minus, Plus } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

interface PercentageInputProps {
  initialValue?: number | '';
  onChange?: (value: number | '') => void;
  onBlur?: () => void;
  min?: number;
  max?: number;
  step?: number;
}

export const PercentageInput: React.FC<PercentageInputProps> = ({
  initialValue = '',
  onChange,
  onBlur,
  min = 0,
  max = 100,
  step = 1
}) => {
  const [value, setValue] = useState<number | ''>(initialValue);
  const [inputValue, setInputValue] = useState(initialValue === '' ? '' : initialValue.toFixed(2));
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    setValue(initialValue);
    setInputValue(initialValue === '' ? '' : initialValue.toFixed(2));
  }, [initialValue]);

  const commit = (num: number | '') => {
    if (num === '') {
      setValue('');
      setInputValue('');
      onChange?.('');
    } else {
      const clamped = Math.min(Math.max(num, min), max);
      setValue(clamped);
      setInputValue(clamped.toFixed(2));
      onChange?.(clamped);
    }
  };

  const handleBlur = () => {
    if (inputValue === '') {
      commit('');
    } else {
      const num = parseFloat(inputValue);
      if (!isNaN(num)) commit(num);
      else commit('');
    }
    onBlur?.();
  };

  const increment = () => {
    if (typeof value === 'number') {
      commit(value + step);
    } else {
      commit(step);
    }
  };

  const decrement = () => {
    if (typeof value === 'number') {
      commit(value - step);
    } else {
      commit(step);
    }
  };

  const handleChange = (text: string) => {
    const regex = /^\d*(\.\d{0,2})?$/;
    if (regex.test(text)) {
      setInputValue(text);
      if (text === '') {
        setValue('');
      } else {
        const num = parseFloat(text);
        if (!isNaN(num)) setValue(num);
      }
    }
  };

  return (
    <HStack space="sm" style={styles.percentageContainer}>
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
          placeholder=""
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
  percentageContainer: { 
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