import { StyleSheet, Platform } from 'react-native';
import { Colors } from './Colors';

// Common text styles for consistency
export const TextStyles = {
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
};

// Common spacing values
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Common border radius values
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
};

// Common shadow styles
export const ShadowStyles = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  android: {
    elevation: 4,
  },
});

// Common card styles
export const CardStyles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...ShadowStyles,
  },
  elevated: {
    backgroundColor: 'white',
    ...ShadowStyles,
  },
});

// Common button styles
export const ButtonStyles = StyleSheet.create({
  primary: {
    backgroundColor: Colors.light.primary[6],
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.light.primary[6],
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  destructive: {
    backgroundColor: Colors.light.red[6],
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
});

// Common input styles
export const InputStyles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: Colors.light.gray[4],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: 'white',
  },
  focused: {
    borderColor: Colors.light.primary[6],
    borderWidth: 2,
  },
  error: {
    borderColor: Colors.light.red[6],
    borderWidth: 2,
  },
});

// Common layout styles
export const LayoutStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  column: {
    flexDirection: 'column' as const,
  },
  spaceBetween: {
    justifyContent: 'space-between' as const,
  },
  spaceAround: {
    justifyContent: 'space-around' as const,
  },
  spaceEvenly: {
    justifyContent: 'space-evenly' as const,
  },
});
