import React from 'react'
import { Alert } from '@mantine/core'
import { IconDeviceMobile } from '@tabler/icons-react'
import { useRouter } from 'next/router'
import { useLocalStorage } from '@mantine/hooks'
import { useTranslations } from 'next-intl'

interface MobileBetaAlertProps {
  onClose?: () => void
}

export function MobileBetaAlert({ onClose }: MobileBetaAlertProps) {
  const router = useRouter()
  const t = useTranslations()
  const [mobileAlertShown, setMobileAlertShown] = useLocalStorage({
    key: 'mobile-alert-shown',
    defaultValue: false,
  })

  if (mobileAlertShown) {
    return null
  }

  return (
    <Alert
      icon={<IconDeviceMobile size='1rem' />}
      variant='light'
      styles={{
        root: { borderRadius: 0 },
      }}
      onClick={(e: React.MouseEvent) => {
        // Only redirect if not clicking the close button
        if (!(e.target as HTMLElement).closest('.mantine-Alert-closeButton')) {
          router.push('/mobile-preview')
        }
      }}
      style={{ cursor: 'pointer' }}
      onClose={() => {
        setMobileAlertShown(true)
        onClose?.()
      }}
      withCloseButton
    >
      {t('Index.mobile-beta-alert')}
    </Alert>
  )
}
