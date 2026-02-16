import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useTranslation } from 'react-i18next';
import LottieView from 'lottie-react-native';
import { ThemedView } from '@/components/ThemedView';

export default function UnderConstruction() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[
        styles.container,
        {
          backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF'
        }
      ]}>
        <ThemedView style={styles.card}>
          <ThemedText style={styles.title}>
            {t('Index.coming-soon')}
          </ThemedText>
          <LottieView
            source={colorScheme === 'dark' 
              ? require('@/assets/animations/construction-dark.json')
              : require('@/assets/animations/construction-bright.json')}
            autoPlay
            loop
            style={styles.animation}
          />
          <ThemedText style={styles.message}>
            {t('Index.statistics-coming-soon')}
          </ThemedText>
        </ThemedView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  icon: {
    marginBottom: 20,
    opacity: 0.8
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 0
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
    marginBottom: 8
  },
  betaText: {
    fontSize: 14,
    opacity: 0.8
  },
  webAppText: {
    fontSize: 14,
    opacity: 0.7
  },
  animation: {
    width: 200,
    height: 200,
    marginVertical: 20
  }
});
