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
    const withTimeout = <T,>(promise: PromiseLike<T>, ms: number, label: string): Promise<T> =>
      new Promise((resolve, reject) => {
        const id = setTimeout(() => {
          reject(new Error(`${label} timed out after ${ms}ms`));
        }, ms);

        promise.then(
          (value) => {
            clearTimeout(id);
            resolve(value);
          },
          (error: unknown) => {
            clearTimeout(id);
            reject(error instanceof Error ? error : new Error(String(error)));
          }
        );
      });

    const checkVersion = async () => {
      try {
        const platform = Platform.OS;
        const minVersion = await withTimeout(getMinVersion(platform), 10_000, 'getMinVersion');
        const currentVersion = Constants.expoConfig?.version || "0.0.0";

        if (!minVersion) {
          setResult({ isValid: true, isLoading: false });
          return;
        }

        const isValid = currentVersion >= minVersion;
        setResult({ isValid, isLoading: false });
      } catch (error) {
        console.error("Error checking version:", error);
        setResult({
          isValid: true,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    };

    void checkVersion();
  }, []);

  return result;
};
