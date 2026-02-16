import React from 'react';
import { StyleSheet } from 'react-native';
import {
  Button,
  ButtonText,
  Card,
  VStack,
  Text
} from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { useUser } from '@/contexts/UserContext';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';

export const LogoutButton = () => {
  const { t } = useTranslation();
  const { logout, userEmail } = useUser();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const cardStyle = {
    ...styles.card,
    backgroundColor: isDark ? '#1A1B1E' : 'white'
  };

  const textStyle = {
    ...styles.email,
    color: isDark ? 'white' : 'black'
  };

  const handleSignOut = async () => {
    await logout();
  };

  return (
    <Card style={cardStyle} variant="outline">
      <VStack space="md" style={styles.container}>
        <Text size="sm" style={textStyle}>{userEmail}</Text>
        <Button
          size="lg"
          variant="solid"
          action="secondary"
          onPress={handleSignOut}
          style={styles.button}
        >
          <IconSymbol name="power" size={20} color="white" />
          <ButtonText>{t('Index.logout')}</ButtonText>
        </Button>
      </VStack>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    padding: 12,
    width: '100%'
  },
  container: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  email: {
    opacity: 0.7,
    fontSize: 14,
  }
});
