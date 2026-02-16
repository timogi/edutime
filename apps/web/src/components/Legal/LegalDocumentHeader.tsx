import { Title, Text } from '@mantine/core'
import type { LegalDocumentMeta } from './types'

interface LegalDocumentHeaderProps {
  title: string
  meta: LegalDocumentMeta
}

export function LegalDocumentHeader({ title, meta }: LegalDocumentHeaderProps) {
  return (
    <>
      <Title mb='xs'>{title}</Title>
      <Text size='sm' c='dimmed'>
        {meta.version} — {meta.lastUpdated}
      </Text>
    </>
  )
}
