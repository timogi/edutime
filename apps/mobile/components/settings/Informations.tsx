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

const DOCUMENT_LINKS = {
  privacy: 'https://edutime.ch/docs/privacy',
  terms: 'https://edutime.ch/docs/terms',
  agb: 'https://edutime.ch/docs/agb',
  imprint: 'https://edutime.ch/docs/imprint',
} as const;

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

  const openExternalUrl = (url: string) => {
    Linking.openURL(url).catch((error: unknown) => {
      console.error('Failed to open external URL:', error);
    });
  };

  const handleEmailPress = () => {
    openExternalUrl(
      `mailto:info@edutime.ch?body=\n\n\n------------------\nApp Information:\nPlatform: ${Platform.OS}\nVersion: ${Constants.expoConfig?.version}`
    );
  };

  const handlePrivacyPress = () => {
    openExternalUrl(DOCUMENT_LINKS.privacy);
  };

  const handleTermsPress = () => {
    openExternalUrl(DOCUMENT_LINKS.terms);
  };

  const handleAgbPress = () => {
    openExternalUrl(DOCUMENT_LINKS.agb);
  };

  const handleImprintPress = () => {
    openExternalUrl(DOCUMENT_LINKS.imprint);
  };

  return (
    <Card style={cardStyle} variant="outline">
      <VStack space="md" style={styles.container}>
        <Text size="xl" style={textStyle}>{t('Settings.information')}</Text>

        <TouchableOpacity onPress={handlePrivacyPress}>
          <HStack space="sm" style={styles.row}>
            <IconSymbol name="shield" size={20} color={iconColor} />
            <Text style={textStyle}>{t('Settings.privacy')}</Text>
          </HStack>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleTermsPress}>
          <HStack space="sm" style={styles.row}>
            <IconSymbol name="doc.text" size={20} color={iconColor} />
            <Text style={textStyle}>{t('Settings.termsOfService')}</Text>
          </HStack>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleAgbPress}>
          <HStack space="sm" style={styles.row}>
            <IconSymbol name="doc.text" size={20} color={iconColor} />
            <Text style={textStyle}>{t('Settings.agb')}</Text>
          </HStack>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleImprintPress}>
          <HStack space="sm" style={styles.row}>
            <IconSymbol name="doc.text" size={20} color={iconColor} />
            <Text style={textStyle}>{t('Settings.imprint')}</Text>
          </HStack>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleEmailPress}>
          <HStack space="sm" style={styles.row}>
            <IconSymbol name="envelope" size={20} color={iconColor} />
            <Text style={textStyle}>{t('Settings.contact')}</Text>
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
