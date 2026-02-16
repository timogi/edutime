import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Provides haptic feedback with consistent behavior across platforms
 */
export const HapticFeedback = {
  /**
   * Light impact feedback for button presses and selections
   */
  light: () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  },

  /**
   * Medium impact feedback for more significant interactions
   */
  medium: () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  },

  /**
   * Heavy impact feedback for important actions
   */
  heavy: () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  },

  /**
   * Selection feedback for picker changes and similar interactions
   */
  selection: () => {
    if (Platform.OS === 'ios') {
      Haptics.selectionAsync();
    }
  },

  /**
   * Success notification feedback
   */
  success: () => {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  },

  /**
   * Warning notification feedback
   */
  warning: () => {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  },

  /**
   * Error notification feedback
   */
  error: () => {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  },
};
