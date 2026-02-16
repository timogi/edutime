import React, { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useUser } from '@/contexts/UserContext';

interface AuthRefreshWrapperProps {
  children: React.ReactNode;
}

export const AuthRefreshWrapper: React.FC<AuthRefreshWrapperProps> = ({ children }) => {
  const { user, refreshAuth } = useUser();
  const appState = useRef(AppState.currentState);
  const lastActiveTime = useRef(Date.now());

  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      try {
        if (
          appState.current === 'background' && 
          nextAppState === 'active' && 
          user
        ) {
          // App has come to foreground after being in background
          const timeInBackground = Date.now() - lastActiveTime.current;
          
          // If app was in background for more than 1 hour, refresh auth
          if (timeInBackground > 60 * 60 * 1000) {
            await refreshAuth();
          }
        }
        
        appState.current = nextAppState;
        lastActiveTime.current = Date.now();
      } catch (error) {
        console.error('Error handling app state change:', error);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [user, refreshAuth]);

  return <>{children}</>;
};
