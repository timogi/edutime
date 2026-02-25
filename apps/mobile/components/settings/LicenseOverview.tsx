import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Card, VStack, HStack, Text, Box } from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { useUser } from '@/contexts/UserContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import {
  getUserEntitlements,
  Entitlement,
  EntitlementKind,
  EntitlementStatus,
} from '@edutime/shared';

const kindTranslationKey: Record<EntitlementKind, string> = {
  trial: 'Settings.licenseKindTrial',
  personal: 'Settings.licenseKindPersonal',
  org_seat: 'Settings.licenseKindOrgSeat',
  student: 'Settings.licenseKindStudent',
};

const statusTranslationKey: Record<EntitlementStatus, string> = {
  pending: 'Settings.licenseStatusPending',
  active: 'Settings.licenseStatusActive',
  revoked: 'Settings.licenseStatusRevoked',
  expired: 'Settings.licenseStatusExpired',
};

const statusColorToken: Record<EntitlementStatus, string> = {
  pending: '$warning500',
  active: '$success500',
  revoked: '$error500',
  expired: '$secondary500',
};

export default function LicenseOverview() {
  const { t } = useTranslation();
  const { user } = useUser();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadEntitlements = async () => {
      if (!user?.user_id) return;
      setIsLoading(true);
      try {
        const data = await getUserEntitlements(supabase, user.user_id);
        if (isMounted) {
          setEntitlements(data);
        }
      } catch (error) {
        console.error('Error loading entitlements:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadEntitlements();

    return () => {
      isMounted = false;
    };
  }, [user?.user_id]);

  const cardStyle = useMemo(
    () => ({
      ...styles.card,
      backgroundColor: isDark ? theme.gray[9] : theme.background,
      borderColor: isDark ? theme.gray[7] : theme.gray[3],
    }),
    [isDark, theme],
  );

  const titleStyle = useMemo(
    () => ({
      color: theme.text,
    }),
    [theme],
  );

  const metaTextStyle = useMemo(
    () => ({
      color: theme.gray[6],
    }),
    [theme],
  );

  const itemStyle = useMemo(
    () => ({
      ...styles.item,
      borderColor: isDark ? theme.gray[7] : theme.gray[3],
      backgroundColor: isDark ? theme.background : theme.gray[0],
    }),
    [isDark, theme],
  );

  const formatDate = (value: string) => new Date(value).toLocaleDateString();

  return (
    <Card style={cardStyle} variant="outline">
      <VStack space="md" style={styles.container}>
        <Text size="xl" style={titleStyle}>
          {t('Settings.license')}
        </Text>

        {isLoading ? (
          <Text style={metaTextStyle}>{t('Settings.loading')}</Text>
        ) : entitlements.length === 0 ? (
          <Text style={metaTextStyle}>{t('Settings.noLicenses')}</Text>
        ) : (
          <VStack space="sm">
            {entitlements.map((entitlement) => (
              <VStack key={entitlement.id} space="xs" style={itemStyle}>
                <HStack style={styles.headerRow}>
                  <Text style={[styles.kindText, titleStyle]}>
                    {t(kindTranslationKey[entitlement.kind])}
                  </Text>
                  <Box
                    style={[
                      styles.statusPill,
                      {
                        borderColor: theme.gray[4],
                      },
                    ]}
                  >
                    <Text size="xs" color={statusColorToken[entitlement.status]}>
                      {t(statusTranslationKey[entitlement.status])}
                    </Text>
                  </Box>
                </HStack>
                <Text size="sm" style={metaTextStyle}>
                  {t('Settings.licenseValidFrom')}: {formatDate(entitlement.valid_from)}
                </Text>
                <Text size="sm" style={metaTextStyle}>
                  {t('Settings.licenseValidUntil')}:{' '}
                  {entitlement.valid_until ? formatDate(entitlement.valid_until) : t('Settings.licenseUnlimited')}
                </Text>
              </VStack>
            ))}
          </VStack>
        )}
      </VStack>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    padding: 12,
    width: '100%',
    borderWidth: 1,
  },
  container: {
    width: '100%',
  },
  item: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  headerRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kindText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    paddingRight: 8,
  },
  statusPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
});
