import { Dialog, Group, Button, Text } from '@mantine/core'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { useDisclosure, useLocalStorage } from '@mantine/hooks'
import { GetStaticPropsContext } from 'next'

export const CookieDialog = () => {
  const router = useRouter()
  const t = useTranslations('Index')
  const [opened, { open, close }] = useDisclosure(false)
  const [cookieShown, setCookieShown] = useLocalStorage({
    key: 'cookie-shown',
    defaultValue: false,
  })

  useEffect(() => {
    if (!cookieShown) {
      open()
    }
  }, [cookieShown, open])

  const handleAccept = () => {
    setCookieShown(true)
    close()
  }

  if (cookieShown) {
    return null
  }

  return (
    <Dialog
      opened={opened}
      shadow='xl'
      withCloseButton
      onClose={handleAccept}
      size='lg'
      radius='md'
      withBorder
    >
      <Text size='xl' fw={500} mb='sm'>
        {t('cookies')}
      </Text>
      <Text size='sm' mb='xs' fw={500}>
        {t('cookieMessage')}
      </Text>
      <Group justify='flex-end'>
        <Button variant='outline' onClick={() => router.push('/docs/privacy')}>
          {t('cookieMoreInfo')}
        </Button>
        <Button onClick={handleAccept}>{t('cookieAccept')}</Button>
      </Group>
    </Dialog>
  )
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../../messages/${locale}.json`)).default,
    },
  }
}
