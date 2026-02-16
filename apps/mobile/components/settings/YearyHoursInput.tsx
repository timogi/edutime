import React, { useState } from 'react';
import { StyleSheet, View, TextInput } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

interface YearlyHoursInputProps {
  initialValue?: number;
  onChange?: (value: number) => void;
  onBlur?: () => void;
  placeholder?: string;
}

export const YearlyHoursInput: React.FC<YearlyHoursInputProps> = ({
  initialValue = 1890,
  onChange,
  onBlur,
  placeholder
}) => {
  const [value, setValue] = useState(initialValue);
  const [inputValue, setInputValue] = useState(initialValue.toFixed(2));
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const commit = (num: number) => {
    setValue(num);
    setInputValue(num.toFixed(2));
    onChange?.(num);
  };

  const handleBlur = () => {
    if (inputValue === '' || isNaN(parseFloat(inputValue))) {
      commit(0);
    } else {
      const num = parseFloat(inputValue);
      commit(num);
    }
    onBlur?.();
  };

  const handleChange = (text: string) => {
    const regex = /^\d*(\.\d{0,2})?$/;
    if (regex.test(text)) {
      setInputValue(text);
      const num = parseFloat(text);
      if (!isNaN(num)) {
        setValue(num);
      } else if (text === '') {
        setValue(0);
      }
    }
  };

  return (
    <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
      <TextInput
        style={[styles.input, isDark && styles.inputDark]}
        value={inputValue}
        onChangeText={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor={isDark ? '#888' : '#666'}
        keyboardType="decimal-pad"
        textAlign="left"
        selectTextOnFocus
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect={false}
        inputMode="decimal"
        returnKeyType="done"
        maxLength={7}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: 'white',
    marginVertical: 4,
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
  }
});
