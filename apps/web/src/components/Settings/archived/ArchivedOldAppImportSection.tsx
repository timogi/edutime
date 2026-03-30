/**
 * ARCHIVED — not rendered anywhere.
 *
 * Previously shown on Settings when `configMode === 'default' && canton === 'BE'`: card
 * "Daten importieren" with a button opening the legacy-app CSV import flow.
 *
 * Pair with {@link ./ImportModal} (same folder). To restore: add `useDisclosure` in
 * `Settings.tsx`, render this card and `<ImportModal opened={...} onClose={...} ... />`.
 */

import { Card, Stack, Text, Group, Button } from '@mantine/core'
import { IconTableImport } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'

export interface ArchivedOldAppImportSectionProps {
  isSmallScreen: boolean
  onStartImport: () => void
}

export function ArchivedOldAppImportSection({ isSmallScreen, onStartImport }: ArchivedOldAppImportSectionProps) {
  const t = useTranslations('Index')

  return (
    <Card radius='md' withBorder p={isSmallScreen ? 'sm' : 'md'}>
      <Stack gap='sm'>
        <Text size='xl'>{t('importData')}</Text>
        <Text>{t('importDataInfo')}</Text>
        <Group justify='flex-start'>
          <Button onClick={onStartImport} leftSection={<IconTableImport />}>
            {t('startImport')}
          </Button>
        </Group>
      </Stack>
    </Card>
  )
}
