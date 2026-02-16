import React from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { getMinVersion } from '@/lib/database/version';

export interface VersionCheckResult {
  isValid: boolean | null;
  isLoading: boolean;
  error?: string;
}

export const useVersionCheck = (): VersionCheckResult => {
  const [result, setResult] = React.useState<VersionCheckResult>({
    isValid: null,
    isLoading: true,
  });

  React.useEffect(() => {
    const checkVersion = async () => {
      try {
        const platform = Platform.OS;
        const minVersion = await getMinVersion(platform);
        const currentVersion = Constants.expoConfig?.version || "0.0.0";
        
        if (!minVersion) {
          setResult({ isValid: true, isLoading: false });
          return;
        }
        
        if (currentVersion) {
          const isValid = currentVersion >= minVersion;
          setResult({ isValid, isLoading: false });
        }
      } catch (error) {
        console.error("Error checking version:", error);
        setResult({ 
          isValid: true, 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    };

    checkVersion();
  }, []);

  return result;
};
