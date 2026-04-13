import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { GetStaticPropsContext } from 'next/types'
import { Container, Paper, Stack, Text, Title, Button, ThemeIcon, Loader } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { IconCircleCheck, IconCircleX } from '@tabler/icons-react'
import { supabase } from '@/utils/supabase/client'

type CheckoutStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'expired'
  | 'unknown'

const POLL_INTERVAL_MS = 2000
const MAX_POLL_ATTEMPTS = 45
const REDIRECT_DELAY_MS = 1600

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const t = useTranslations('Checkout')
  const [status, setStatus] = useState<CheckoutStatus>('pending')
  const [hasActiveEntitlement, setHasActiveEntitlement] = useState(false)
  const [isPolling, setIsPolling] = useState(true)

  const referenceId = useMemo(
    () => (typeof router.query.ref === 'string' ? router.query.ref : null),
    [router.query.ref],
  )

  const postCheckoutPath = useMemo(() => {
    const plan = typeof router.query.plan === 'string' ? router.query.plan : ''
    return plan === 'org' ? '/app/members' : '/app'
  }, [router.query.plan])

  const fetchStatus = useCallback(async (): Promise<{
    stopPolling: boolean
    status: CheckoutStatus
    hasActiveEntitlement: boolean
  }> => {
    if (!referenceId) {
      return { stopPolling: true, status: 'unknown', hasActiveEntitlement: false }
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const headers: HeadersInit = {}
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`
      }

      const response = await fetch(
        `/api/checkout/status?ref=${encodeURIComponent(referenceId)}`,
        { credentials: 'include', headers },
      )
      if (!response.ok) {
        return { stopPolling: false, status: 'unknown', hasActiveEntitlement: false }
      }

      const data = (await response.json()) as {
        status?: CheckoutStatus
        hasActiveEntitlement?: boolean
      }

      const nextStatus = data.status || 'unknown'
      const entitled = Boolean(data.hasActiveEntitlement)
      const terminalFailure =
        nextStatus === 'failed' || nextStatus === 'cancelled' || nextStatus === 'expired'

      return {
        stopPolling: entitled || terminalFailure,
        status: nextStatus,
        hasActiveEntitlement: entitled,
      }
    } catch (error) {
      console.error('Failed to check checkout status:', error)
      return { stopPolling: false, status: 'unknown', hasActiveEntitlement: false }
    }
  }, [referenceId])

  useEffect(() => {
    if (!router.isReady || !referenceId) {
      if (router.isReady && !referenceId) {
        setIsPolling(false)
      }
      return
    }

    let cancelled = false
    let attempts = 0
    let intervalId: number | undefined
    let inFlight = false

    const tick = async () => {
      if (cancelled || inFlight) return
      inFlight = true
      attempts += 1

      const result = await fetchStatus()
      if (cancelled) {
        inFlight = false
        return
      }

      setStatus(result.status)
      setHasActiveEntitlement(result.hasActiveEntitlement)

      const done =
        result.stopPolling || attempts >= MAX_POLL_ATTEMPTS || cancelled

      if (done) {
        if (intervalId !== undefined) {
          window.clearInterval(intervalId)
          intervalId = undefined
        }
        setIsPolling(false)
      }

      inFlight = false
    }

    setIsPolling(true)
    void tick()
    intervalId = window.setInterval(() => void tick(), POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      if (intervalId !== undefined) {
        window.clearInterval(intervalId)
      }
    }
  }, [router.isReady, referenceId, fetchStatus])

  useEffect(() => {
    if (!hasActiveEntitlement) return
    const id = window.setTimeout(() => {
      void router.replace(postCheckoutPath)
    }, REDIRECT_DELAY_MS)
    return () => {
      window.clearTimeout(id)
    }
  }, [hasActiveEntitlement, router, postCheckoutPath])

  const isActivated = hasActiveEntitlement
  const isFailure = status === 'failed' || status === 'cancelled' || status === 'expired'

  const title = isFailure
    ? t('failedTitle')
    : isActivated
      ? t('successTitle')
      : t('activationPendingTitle')
  const description = isFailure
    ? t('failedDescription')
    : isActivated
      ? t('successDescription')
      : t('activationPendingDescription')
  const note = isFailure
    ? t('activationFailedNote')
    : isActivated
      ? t('successNote')
      : t('activationPendingNote')

  return (
    <Container size={480} my={40}>
      <Paper withBorder p={30} radius='md'>
        <Stack gap='lg' align='center'>
          <ThemeIcon
            size={64}
            radius='xl'
            color={isFailure ? 'red' : 'green'}
            variant='light'
          >
            {isFailure ? <IconCircleX size={40} /> : <IconCircleCheck size={40} />}
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

          {isPolling && !isActivated && !isFailure && <Loader size='sm' />}

          <Button
            onClick={() => void router.push(postCheckoutPath)}
            variant='filled'
            fullWidth
            mt='md'
          >
            {postCheckoutPath === '/app/members' ? t('goToMembers') : t('goToApp')}
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
