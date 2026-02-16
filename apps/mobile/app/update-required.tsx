import { StyleSheet, Platform, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';
import { HapticFeedback } from '@/lib/haptics';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Button, ButtonText, View, Text } from '@gluestack-ui/themed';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { TextStyles, Spacing, BorderRadius, ShadowStyles, LayoutStyles } from '@/constants/Styles';

export default function UpdateRequiredScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const version = Constants.expoConfig?.version;

  const handleUpdateApp = () => {
    HapticFeedback.light();
    
    // Open the app store for updates
    if (Platform.OS === 'ios') {
      Linking.openURL('https://apps.apple.com/app/id123456789'); // Replace with your actual App Store URL
    } else {
      Linking.openURL('https://play.google.com/store/apps/details?id=com.yourcompany.edutime'); // Replace with your actual Play Store URL
    }
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ThemedView style={styles.content}>
        <IconSymbol 
          name="exclamationmark.triangle.fill" 
          size={80} 
          color={Colors[colorScheme ?? 'light'].red[6]} 
        />
        
        <ThemedText style={styles.title}>
          {t('Index.update-required')}
        </ThemedText>
        
        <ThemedText style={styles.description}>
          {t('Index.update-required.description')}
        </ThemedText>
        
        {/* <Button
          size="lg"
          variant="solid"
          onPress={handleUpdateApp}
          style={[styles.updateButton]}
          android_ripple={{ color: Colors[colorScheme ?? 'light'].primary[8] }}>
          <IconSymbol name="arrow.down.circle.fill" size={20} color="white" />
          <ButtonText style={{ color: 'white' }}>
            {t('Index.update-required.updateNow')}
          </ButtonText>
        </Button> */}
      </ThemedView>
      <View style={styles.versionContainer}>
        <Text style={[styles.versionText, { color: Colors[colorScheme ?? 'light'].gray[6] }]}>
          v{version}
        </Text>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...LayoutStyles.container,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.lg,
  },
  title: {
    ...TextStyles.title,
    textAlign: 'center',
  },
  description: {
    ...TextStyles.body,
    textAlign: 'center',
    opacity: 0.8,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xxl,
  },
  versionContainer: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  versionText: {
    ...TextStyles.small,
    opacity: 0.8,
  },
});