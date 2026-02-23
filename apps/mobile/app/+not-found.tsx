import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TextStyles, Spacing, LayoutStyles } from '@/constants/Styles';

export default function NotFoundScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t('Index.oops') }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">{t('Index.screenNotFound')}</ThemedText>
        <Link href="/" style={styles.link}>
          <ThemedText type="link">{t('Index.goHome')}</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    ...LayoutStyles.centered,
    padding: Spacing.lg,
  },
  link: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
  },
});
