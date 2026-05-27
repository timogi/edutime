import { useEffect, useState } from 'react'
import Head from 'next/head'
import { GetStaticPropsContext } from 'next/types'
import { useRouter } from 'next/router'
import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Divider,
  Group,
  PasswordInput,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { IconAlertCircle, IconCheck, IconLock } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'
import { supabase } from '@/utils/supabase/client'
import {
  BILLING_LAB_PASSWORD,
  isBillingLabUnlocked,
  setBillingLabUnlocked,
} from '@/utils/billingLab'
import pricingClasses from '@/components/Main/Pricing.module.css'

export default function BillingLabPage() {
  const t = useTranslations('BillingLab')
  const tPricing = useTranslations('Pricing')
  const tNoLicense = useTranslations('NoLicense')
  const router = useRouter()

  const [unlocked, setUnlocked] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    setUnlocked(isBillingLabUnlocked())
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(Boolean(session))
    })
  }, [])

  const handleUnlock = (event: React.FormEvent) => {
    event.preventDefault()
    if (passwordInput !== BILLING_LAB_PASSWORD) {
      setPasswordError(t('wrongPassword'))
      return
    }
    setBillingLabUnlocked(true)
    setUnlocked(true)
    setPasswordError(null)
    setPasswordInput('')
  }

  const handleLock = () => {
    setBillingLabUnlocked(false)
    setUnlocked(false)
    setPasswordInput('')
    setPasswordError(null)
  }

  const handleStartDailyTestCheckout = () => {
    void router.push('/checkout?plan=annual&billingCycle=daily_test')
  }

  if (!unlocked) {
    return (
      <>
        <Head>
          <title>{t('pageTitle')}</title>
          <meta name='robots' content='noindex, nofollow' />
        </Head>
        <Container size={420} py='xl'>
          <Card withBorder padding='xl' radius='md'>
            <form onSubmit={handleUnlock}>
              <Stack gap='md'>
                <Group gap='xs'>
                  <IconLock size={20} />
                  <Title order={3}>{t('unlockTitle')}</Title>
                </Group>
                <PasswordInput
                  label={t('passwordLabel')}
                  value={passwordInput}
                  onChange={(event) => {
                    setPasswordInput(event.currentTarget.value)
                    if (passwordError) setPasswordError(null)
                  }}
                  error={passwordError}
                  autoComplete='off'
                />
                <Button type='submit' fullWidth>
                  {t('unlockButton')}
                </Button>
              </Stack>
            </form>
          </Card>
        </Container>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{t('pageTitle')}</title>
        <meta name='robots' content='noindex, nofollow' />
      </Head>
      <Container size={480} py='xl'>
        <Stack gap='md'>
          <Group justify='flex-end'>
            <Button variant='subtle' size='xs' onClick={handleLock}>
              {t('lockButton')}
            </Button>
          </Group>

          {isLoggedIn === false ? (
            <Alert icon={<IconAlertCircle size={16} />} color='orange' variant='light'>
              <Stack gap='xs'>
                <Text size='sm'>{t('loginRequired')}</Text>
                <Button
                  variant='light'
                  size='sm'
                  onClick={() => void router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`)}
                >
                  {t('loginButton')}
                </Button>
              </Stack>
            </Alert>
          ) : null}

          <Card withBorder padding='xl' radius='md' className={pricingClasses.pricingCard}>
            <Stack gap='lg'>
              <div>
                <Badge size='lg' variant='light' color='violet' mb='sm'>
                  {tPricing('testRenewBadge')}
                </Badge>
                <Title order={3} className={pricingClasses.planTitle}>
                  {tPricing('testRenewTitle')}
                </Title>
                <Text size='sm' c='dimmed' mt='xs'>
                  {tPricing('testRenewSubtitle')}
                </Text>
              </div>

              <Group gap='xs' justify='center'>
                <Text size='3rem' fw={700} className={pricingClasses.price} lh={1}>
                  1
                </Text>
                <Text size='lg' c='dimmed' mt='md' lh={1}>
                  CHF
                </Text>
              </Group>
              <Text size='sm' c='dimmed' ta='center'>
                {tPricing('testRenewPerDay')}
              </Text>

              <Divider />

              <Stack gap='sm'>
                <Group gap='sm' align='flex-start'>
                  <IconCheck size={20} className={pricingClasses.checkIcon} />
                  <Text size='sm'>{tPricing('testRenewFeature1')}</Text>
                </Group>
                <Group gap='sm' align='flex-start'>
                  <IconCheck size={20} className={pricingClasses.checkIcon} />
                  <Text size='sm'>{tPricing('testRenewFeature2')}</Text>
                </Group>
                <Group gap='sm' align='flex-start'>
                  <IconCheck size={20} className={pricingClasses.checkIcon} />
                  <Text size='sm'>{tPricing('testRenewFeature3')}</Text>
                </Group>
                <Group gap='sm' align='flex-start'>
                  <IconCheck size={20} className={pricingClasses.checkIcon} />
                  <Text size='sm'>{tPricing('testRenewFeature4')}</Text>
                </Group>
              </Stack>

              <Button
                size='lg'
                fullWidth
                onClick={handleStartDailyTestCheckout}
                disabled={isLoggedIn === false}
              >
                {tNoLicense('start-test-renew')}
              </Button>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </>
  )
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../../messages/${locale}.json`)).default,
    },
  }
}
