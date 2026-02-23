import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button, ButtonText } from '@gluestack-ui/themed';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { TextStyles, Spacing, BorderRadius, LayoutStyles } from '@/constants/Styles';
import { useTranslation } from 'react-i18next';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // If it's a subscription error, try to clean up
    if (error.message.includes('subscribe multiple times')) {
      console.warn('Subscription error detected, attempting cleanup...');
      // Force a small delay and then retry
      setTimeout(() => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
      }, 1000);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{ error: Error; resetError: () => void }> = ({ 
  error, 
  resetError 
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>
        {t('Index.somethingWentWrong')}
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        {t('Index.restartApp')}
      </ThemedText>
      <ThemedText style={styles.errorText}>
        {error?.message || t('Index.unknownError')}
      </ThemedText>
      <Button
        variant="solid"
        size="md"
        onPress={resetError}
        style={[styles.retryButton, { backgroundColor: theme.primary[5] }]}
      >
        <ButtonText style={styles.retryText}>{t('Index.tryAgain')}</ButtonText>
      </Button>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...LayoutStyles.centered,
    padding: Spacing.lg,
  },
  title: {
    ...TextStyles.title,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...TextStyles.body,
    textAlign: 'center',
    marginBottom: Spacing.md,
    opacity: 0.8,
  },
  errorText: {
    ...TextStyles.small,
    textAlign: 'center',
    color: '#999',
    fontFamily: 'monospace',
    marginBottom: Spacing.lg,
  },
  retryButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  retryText: {
    color: 'white',
    fontWeight: '600',
  },
});
