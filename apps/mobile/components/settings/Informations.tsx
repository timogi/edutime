import React from 'react';
import { StyleSheet, Linking, Platform } from 'react-native';
import {
  Card,
  VStack,
  HStack,
  Text
} from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { IconSymbol } from '@/components/ui/IconSymbol';
import Constants from 'expo-constants';
import { TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function Informations() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const cardStyle = {
    ...styles.card,
    backgroundColor: isDark ? '#1A1B1E' : 'white'
  };

  const textStyle = {
    color: isDark ? 'white' : 'black'
  };

  const iconColor = isDark ? '#888' : '#666';

  const handleEmailPress = () => {
    Linking.openURL(
      `mailto:info@edutime.ch?body=\n\n\n------------------\nApp Information:\nPlatform: ${Platform.OS}\nVersion: ${Constants.expoConfig?.version}`
    );
  };

  const handlePrivacyPress = () => {
    Linking.openURL("https://edutime.ch/privacy");
  };

  return (
    <Card style={cardStyle} variant="outline">
      <VStack space="md" style={styles.container}>
        <Text size="xl" style={textStyle}>{t('Settings.information')}</Text>

        <TouchableOpacity onPress={handleEmailPress}>
          <HStack space="sm" style={styles.row}>
            <IconSymbol name="envelope" size={20} color={iconColor} />
            <Text style={textStyle}>{t('Settings.contact')}</Text>
          </HStack>
        </TouchableOpacity>

        <TouchableOpacity onPress={handlePrivacyPress}>
          <HStack space="sm" style={styles.row}>
            <IconSymbol name="shield" size={20} color={iconColor} />
            <Text style={textStyle}>{t('Index.privacy')}</Text>
          </HStack>
        </TouchableOpacity>
      </VStack>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    padding: 12,
    width: '100%'
  },
  container: {
    width: '100%',
  },
  row: {
    alignItems: 'center',
    paddingVertical: 8,
  }
});
