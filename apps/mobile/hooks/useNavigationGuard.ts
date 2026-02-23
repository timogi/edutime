import { useRef, useCallback, useState } from 'react';
import { useRouter } from 'expo-router';

/**
 * Custom hook to prevent multiple rapid navigation calls
 * Provides debouncing and loading state management for navigation
 */
export const useNavigationGuard = (debounceMs: number = 300) => {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigateWithGuard = useCallback(
    (navigationFn: () => void) => {
      // If already navigating, ignore the call
      if (isNavigating) {
        return;
      }

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set navigating flag
      setIsNavigating(true);

      // Execute navigation immediately
      navigationFn();

      // Reset navigating flag after debounce period
      timeoutRef.current = setTimeout(() => {
        setIsNavigating(false);
      }, debounceMs);
    },
    [isNavigating, debounceMs]
  );

  const navigateToRecordForm = useCallback(
    (params: { date: string; title: string; record?: string; stopwatchSessionId?: string; startTime?: string; description?: string; category?: string }) => {
      navigateWithGuard(() => {
        router.push({
          pathname: '/record-form',
          params
        });
      });
    },
    [navigateWithGuard, router]
  );

  const navigateBack = useCallback(() => {
    navigateWithGuard(() => {
      router.back();
    });
  }, [navigateWithGuard, router]);

  const navigateToSettings = useCallback(() => {
    navigateWithGuard(() => {
      router.push('/settings');
    });
  }, [navigateWithGuard, router]);

  const navigateToStatistics = useCallback(() => {
    navigateWithGuard(() => {
      router.push('/statistics');
    });
  }, [navigateWithGuard, router]);

  return {
    navigateToRecordForm,
    navigateBack,
    navigateToSettings,
    navigateToStatistics,
    isNavigating,
  };
};
