import React, { useSyncExternalStore } from 'react'
import {
  Container,
  Title,
  Text,
  Card,
  Stack,
  Button,
  Flex,
  Group,
  ActionIcon,
  Tooltip,
} from '@mantine/core'
import { useTranslations } from 'next-intl'
import { showNotification } from '@mantine/notifications'
import { IconMail, IconBrandWhatsapp, IconCopy, IconShare } from '@tabler/icons-react'
import classes from './ShareWithSchool.module.css'

const emptySubscribe = () => () => {}
const getCanShare = () => typeof navigator !== 'undefined' && !!navigator.share
const getCanShareServer = () => false

export function ShareWithSchool() {
  const t = useTranslations('DemoSection')
  const canUseNativeShare = useSyncExternalStore(emptySubscribe, getCanShare, getCanShareServer)

  const shareUrl = 'https://edutime.ch'
  const shareText = t('emailBody') // Full email body text
  const shareTitle = t('emailSubject')

  const handleShareEmail = () => {
    const subject = encodeURIComponent(t('emailSubject'))
    const body = encodeURIComponent(t('emailBody'))
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`${shareTitle}\n\n${shareText}\n\n${shareUrl}`)
    const url = `https://wa.me/?text=${text}`
    window.open(url, '_blank')
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      showNotification({
        title: t('linkCopied') || 'Link copied',
        message: t('linkCopiedMessage') || 'The link has been copied to your clipboard',
        color: 'green',
      })
    } catch (err) {
      console.error('Failed to copy:', err)
      showNotification({
        title: t('error') || 'Error',
        message: t('copyFailed') || 'Failed to copy link',
        color: 'red',
      })
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        })
      } catch (err) {
        // User cancelled or error occurred
        console.error('Error sharing:', err)
      }
    }
  }

  return (
    <div className={classes.wrapper}>
      <Container size={1200} className={classes.inner}>
        <Flex justify='center' w='100%'>
          <Card
            className={classes.card}
            padding='xl'
            radius='md'
            withBorder
            style={{ maxWidth: 600, width: '100%' }}
          >
            <Stack gap='md' align='center'>
              <IconShare size={48} stroke={1.5} color='var(--mantine-color-violet-6)' />
              <Title order={4}>{t('shareWithSchool')}</Title>
              <Text size='sm' c='dimmed' ta='center'>
                {t('shareDescription')}
              </Text>

              {canUseNativeShare ? (
                <Button
                  onClick={handleNativeShare}
                  variant='outline'
                  size='md'
                  leftSection={<IconShare size={18} />}
                  fullWidth
                >
                  {t('shareButton')}
                </Button>
              ) : (
                <Group gap='sm' justify='center' w='100%'>
                  <Tooltip label='Email' withArrow>
                    <ActionIcon
                      variant='light'
                      size='lg'
                      onClick={handleShareEmail}
                      aria-label='Share via Email'
                    >
                      <IconMail size={20} />
                    </ActionIcon>
                  </Tooltip>

                  <Tooltip label='WhatsApp' withArrow>
                    <ActionIcon
                      variant='light'
                      size='lg'
                      onClick={handleShareWhatsApp}
                      aria-label='Share on WhatsApp'
                      color='green'
                    >
                      <IconBrandWhatsapp size={20} />
                    </ActionIcon>
                  </Tooltip>

                  <Tooltip label='Copy Link' withArrow>
                    <ActionIcon
                      variant='light'
                      size='lg'
                      onClick={handleCopyLink}
                      aria-label='Copy link'
                    >
                      <IconCopy size={20} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              )}
            </Stack>
          </Card>
        </Flex>
      </Container>
    </div>
  )
}
