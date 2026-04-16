import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Card, VStack, HStack, Text, Box } from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { useUser } from '@/contexts/UserContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { themeForScheme } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { getMemberships, getOrganizations } from '@/lib/database/organization';
import {
  getUserEntitlements,
  visibleUserEntitlements,
  Entitlement,
  EntitlementKind,
  EntitlementStatus,
} from '@edutime/shared';
import type { TFunction } from 'i18next';

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

function resolveOrganizationNamesFromEntitlements(
  list: Entitlement[],
  userId: string,
  userEmail: string | null,
): Promise<Record<number, string>> {
  const orgIds = Array.from(
    new Set(
      list
        .filter((e) => e.kind === 'org_seat' && e.organization_id != null)
        .map((e) => e.organization_id as number),
    ),
  );
  if (orgIds.length === 0) {
    return Promise.resolve({});
  }
  return (async () => {
    const orgNames: Record<number, string> = {};
    try {
      const [memberships, adminOrganizations] = await Promise.all([
        userEmail ? getMemberships(userEmail) : Promise.resolve([]),
        getOrganizations(userId),
      ]);
      memberships.forEach((m) => {
        if (orgIds.includes(m.id)) {
          orgNames[m.id] = m.name;
        }
      });
      adminOrganizations.forEach((o) => {
        if (orgIds.includes(o.id)) {
          orgNames[o.id] = o.name;
        }
      });
    } catch (error) {
      console.error('Error resolving organization names for licenses:', error);
    }
    return orgNames;
  })();
}

function getLicenseKindTitle(
  entitlement: Entitlement,
  orgNamesById: Record<number, string>,
  t: TFunction,
): string {
  if (entitlement.kind === 'org_seat' && entitlement.organization_id != null) {
    const name = orgNamesById[entitlement.organization_id];
    if (name) {
      return t('Settings.licenseOrgSeatProvidedBy', { organization: name });
    }
    return t('Settings.licenseOrgSeatProvidedByIdOnly', {
      id: entitlement.organization_id,
    });
  }
  return t(kindTranslationKey[entitlement.kind]);
}

export default function LicenseOverview() {
  const { t } = useTranslation();
  const { user, userEmail } = useUser();
  const colorScheme = useColorScheme();
  const theme = themeForScheme(colorScheme);
  const isDark = colorScheme === 'dark';
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [organizationNamesById, setOrganizationNamesById] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadEntitlements = async () => {
      if (!user?.user_id) return;
      setIsLoading(true);
      try {
        const data = await getUserEntitlements(supabase, user.user_id);
        if (!isMounted) return;
        setEntitlements(data);
        const orgNames = await resolveOrganizationNamesFromEntitlements(
          data,
          user.user_id,
          userEmail,
        );
        if (isMounted) {
          setOrganizationNamesById(orgNames);
        }
      } catch (error) {
        console.error('Error loading entitlements:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadEntitlements();

    return () => {
      isMounted = false;
    };
  }, [user?.user_id, userEmail]);

  const visibleEntitlements = useMemo(
    () => visibleUserEntitlements(entitlements),
    [entitlements],
  );

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
        ) : visibleEntitlements.length === 0 ? (
          <Text style={metaTextStyle}>{t('Settings.noLicenses')}</Text>
        ) : (
          <VStack space="sm">
            {visibleEntitlements.map((entitlement) => (
              <VStack key={entitlement.id} space="xs" style={itemStyle}>
                <HStack style={styles.headerRow}>
                  <Text style={[styles.kindText, titleStyle]} flexShrink={1}>
                    {getLicenseKindTitle(entitlement, organizationNamesById, t)}
                  </Text>
                  <Box
                    flexShrink={0}
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
                <Text size="sm" style={[styles.metaLine, metaTextStyle]}>
                  {t('Settings.licenseValidFrom')}: {formatDate(entitlement.valid_from)}
                </Text>
                <Text size="sm" style={[styles.metaLine, metaTextStyle]}>
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
    padding: 12,
    width: '100%',
    maxWidth: '100%',
    alignSelf: 'stretch',
    borderWidth: 1,
  },
  container: {
    width: '100%',
    maxWidth: '100%',
  },
  item: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    maxWidth: '100%',
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    width: '100%',
    maxWidth: '100%',
    gap: 8,
  },
  kindText: {
    fontSize: 16,
    fontWeight: '600',
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    paddingRight: 8,
  },
  metaLine: {
    flexShrink: 1,
    maxWidth: '100%',
  },
  statusPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 10,
    maxWidth: '100%',
  },
});
