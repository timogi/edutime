import { Button, Group, HoverCard, Stack, Text } from '@mantine/core'
import { IconMail } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'
import { GetStaticPropsContext } from 'next/types'

export function CantonExplanation() {
  const t = useTranslations('Index')
  return (
    <Group justify='center'>
      <HoverCard width={350} shadow='md'>
        <HoverCard.Target>
          <Button variant='outline'>{t('cantonNotAvailable')}</Button>
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <Stack ta='center'>
            <Text size='sm' c='dimmed'>
              {t('cantonNotAvailableExplanation')}
            </Text>
            <Button
              component='a'
              href={'mailto:info@edutime.ch'}
              leftSection={<IconMail size='1rem' />}
            >
              {t('contact')}
            </Button>
          </Stack>
        </HoverCard.Dropdown>
      </HoverCard>
    </Group>
  )
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const messages = await import(`../../../messages/${locale}.json`)
  return {
    props: {
      messages: messages.default,
    },
  }
}
