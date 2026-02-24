import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Text, VStack, HStack, Box } from '@gluestack-ui/themed';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { TextStyles, Spacing, BorderRadius } from '@/constants/Styles';

interface ToastProps {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastState extends ToastProps {
  id: number;
  visible: boolean;
}

let toastId = 0;
const toasts: ToastState[] = [];
const listeners: Array<() => void> = [];

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

export const showToast = ({ 
  type, 
  title, 
  message, 
  duration = 3000 
}: ToastProps) => {
  const id = ++toastId;
  const toast: ToastState = {
    id,
    type,
    title,
    message,
    duration,
    visible: true,
  };
  
  toasts.push(toast);
  notifyListeners();
  
  // Auto-hide after duration
  setTimeout(() => {
    const index = toasts.findIndex(t => t.id === id);
    if (index !== -1) {
      toasts[index].visible = false;
      notifyListeners();
      
      // Remove from array after animation
      setTimeout(() => {
        const removeIndex = toasts.findIndex(t => t.id === id);
        if (removeIndex !== -1) {
          toasts.splice(removeIndex, 1);
          notifyListeners();
        }
      }, 300);
    }
  }, duration);
};

// Success toast helper
export const showSuccessToast = (title: string, message?: string) => {
  showToast({ type: 'success', title, message });
};

// Error toast helper
export const showErrorToast = (title: string, message?: string) => {
  showToast({ type: 'error', title, message });
};

// Info toast helper
export const showInfoToast = (title: string, message?: string) => {
  showToast({ type: 'info', title, message });
};

// Warning toast helper
export const showWarningToast = (title: string, message?: string) => {
  showToast({ type: 'warning', title, message });
};

// Toast Container Component
export const ToastContainer: React.FC = () => {
  const [toastList, setToastList] = useState<ToastState[]>([]);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    const updateToasts = () => {
      setToastList([...toasts]);
    };
    
    listeners.push(updateToasts);
    
    return () => {
      const index = listeners.indexOf(updateToasts);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  if (toastList.length === 0) return null;

  return (
    <View style={styles.container}>
      {toastList.map((toast) => (
        <ToastItem key={toast.id} toast={toast} theme={theme} />
      ))}
    </View>
  );
};

const ToastItem: React.FC<{ toast: ToastState; theme: typeof Colors.light }> = ({ toast, theme }) => {
  const [opacity] = useState(new Animated.Value(0));
  const [translateY] = useState(new Animated.Value(-100));

  useEffect(() => {
    if (toast.visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [toast.visible, opacity, translateY]);

  const getToastColors = () => {
    switch (toast.type) {
      case 'success':
        return { bg: theme.primary[6], text: 'white' };
      case 'error':
        return { bg: theme.red[5], text: 'white' };
      case 'warning':
        return { bg: theme.gray[5], text: 'white' };
      case 'info':
      default:
        return { bg: theme.primary[4], text: 'white' };
    }
  };

  const colors = getToastColors();

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          opacity,
          transform: [{ translateY }],
          backgroundColor: colors.bg,
        },
      ]}
    >
      <VStack space="xs" style={styles.toastContent}>
        <Text style={[styles.toastTitle, { color: colors.text }]}>
          {toast.title}
        </Text>
        {toast.message && (
          <Text style={[styles.toastMessage, { color: colors.text }]}>
            {toast.message}
          </Text>
        )}
      </VStack>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 9999,
  },
  toast: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toastContent: {
    alignItems: 'flex-start',
  },
  toastTitle: {
    ...TextStyles.subtitle,
    fontWeight: '600',
  },
  toastMessage: {
    ...TextStyles.body,
    opacity: 0.9,
  },
});
