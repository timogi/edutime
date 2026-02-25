import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { GetStaticPropsContext } from 'next/types'
import { Container, Paper, Stack, Text, Title, Button, ThemeIcon, Loader } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { IconCircleCheck } from '@tabler/icons-react'

type CheckoutStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'expired'
  | 'unknown'

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const t = useTranslations('Checkout')
  const [status, setStatus] = useState<CheckoutStatus>('pending')
  const [hasActiveEntitlement, setHasActiveEntitlement] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  const referenceId = useMemo(
    () => (typeof router.query.ref === 'string' ? router.query.ref : null),
    [router.query.ref],
  )

  const checkStatus = useCallback(async () => {
    if (!referenceId) {
      setIsChecking(false)
      return
    }

    try {
      const response = await fetch(`/api/checkout/status?ref=${encodeURIComponent(referenceId)}`)
      if (!response.ok) {
        setStatus('unknown')
        return
      }

      const data = (await response.json()) as {
        status?: CheckoutStatus
        hasActiveEntitlement?: boolean
      }

      setStatus(data.status || 'unknown')
      setHasActiveEntitlement(Boolean(data.hasActiveEntitlement))
    } catch (error) {
      console.error('Failed to check checkout status:', error)
      setStatus('unknown')
    } finally {
      setIsChecking(false)
    }
  }, [referenceId])

  useEffect(() => {
    if (!router.isReady || !referenceId) {
      return
    }

    let attempts = 0
    const maxAttempts = 20

    const poll = async () => {
      attempts += 1
      await checkStatus()

      if (attempts >= maxAttempts) {
        window.clearInterval(intervalId)
      }
    }

    const intervalId = window.setInterval(poll, 3000)
    void poll()

    return () => {
      window.clearInterval(intervalId)
    }
  }, [router.isReady, referenceId, checkStatus])

  const isActivated = hasActiveEntitlement
  const isFailure = status === 'failed' || status === 'cancelled' || status === 'expired'

  const title = isActivated ? t('successTitle') : t('activationPendingTitle')
  const description = isActivated ? t('successDescription') : t('activationPendingDescription')
  const note = isFailure ? t('activationFailedNote') : t('activationPendingNote')

  return (
    <Container size={480} my={40}>
      <Paper withBorder p={30} radius='md'>
        <Stack gap='lg' align='center'>
          <ThemeIcon size={64} radius='xl' color='green' variant='light'>
            <IconCircleCheck size={40} />
          </ThemeIcon>

          <Title order={2} ta='center'>
            {title}
          </Title>

          <Text c='dimmed' ta='center' size='sm'>
            {description}
          </Text>

          <Text c='dimmed' ta='center' size='xs'>
            {note}
          </Text>

          {isChecking && <Loader size='sm' />}

          <Button
            onClick={() => router.push(isActivated ? '/app' : '/app/no-license?checkout=pending')}
            variant='filled'
            fullWidth
            mt='md'
          >
            {isActivated ? t('goToApp') : t('goToNoLicense')}
          </Button>

          <Button onClick={checkStatus} variant='light' fullWidth>
            {t('refreshStatus')}
          </Button>
        </Stack>
      </Paper>
    </Container>
  )
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../../messages/${locale}.json`)).default,
    },
  }
}
