import React, { useState, useEffect } from 'react'
import {
  Container,
  Title,
  Text,
  Card,
  Stack,
  Button,
  Divider,
  Group,
  Badge,
  SimpleGrid,
  Flex,
  Center,
} from '@mantine/core'
import { useTranslations } from 'next-intl'
import { useMediaQuery } from '@mantine/hooks'
import { IconCheck } from '@tabler/icons-react'
import { useRouter } from 'next/router'
import { supabase } from '@/utils/supabase/client'
import { showNotification } from '@mantine/notifications'
import { OrgPriceCalculatorModal } from './OrgPriceCalculatorModal'
import { INDIVIDUAL_ANNUAL_PRICE_CHF } from '@/utils/payments/pricing'
import classes from './Pricing.module.css'

export function Pricing() {
  const t = useTranslations('Pricing')
  const tDemo = useTranslations('DemoSection')
  const tIndex = useTranslations('Index')
  const router = useRouter()
  const [orgModalOpened, setOrgModalOpened] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const isSmallScreen = useMediaQuery('(max-width: 768px)')

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
    }
    checkAuth()
  }, [])

  const handleDemoClick = async () => {
    if (isLoggedIn) {
      // Start demo for logged in user
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session?.access_token) {
          showNotification({
            title: tIndex('error') || 'Fehler',
            message: 'Unauthorized - Please log in again',
            color: 'red',
          })
          return
        }

        const response = await fetch('/api/users/start-demo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          credentials: 'include',
          body: JSON.stringify({ user_id: session.user.id }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to start demo')
        }

        showNotification({
          title: tIndex('success') || 'Erfolg',
          message: tIndex('demo-started-message') || 'Demo wurde gestartet',
          color: 'green',
        })

        // Redirect to app
        router.push('/app')
      } catch (error: any) {
        showNotification({
          title: tIndex('error') || 'Fehler',
          message: error.message || 'Failed to start demo',
          color: 'red',
        })
      }
    } else {
      // Redirect to register with demo intent
      router.push('/register?intent=demo')
    }
  }

  const handleStandardClick = () => {
    if (isLoggedIn) {
      router.push('/checkout?plan=annual')
    } else {
      router.push('/register?intent=annual')
    }
  }

  return (
    <>
      <OrgPriceCalculatorModal opened={orgModalOpened} onClose={() => setOrgModalOpened(false)} />

      <div className={classes.wrapper}>
        <Container size={1200} className={classes.inner}>
          <Stack gap='xl' align='center'>
            <div className={classes.header}>
              <Title order={2} className={classes.title} ta='center'>
                {t('title')}
              </Title>
              <Text size='lg' className={classes.description} ta='center' maw={600}>
                {t('description')}
              </Text>
            </div>

            <SimpleGrid cols={{ base: 1, md: 3 }} spacing='lg' w='100%' className={classes.grid}>
              {/* Demo Card */}
              <Card
                className={classes.pricingCard}
                padding='xl'
                radius='md'
                withBorder
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}
              >
                <Stack gap='lg' h='100%' justify='space-between' style={{ flex: 1 }}>
                  <div>
                    <Badge size='lg' variant='light' color='violet' mb='sm'>
                      Demo
                    </Badge>
                    <Title order={3} className={classes.planTitle}>
                      {t('demoTitle')}
                    </Title>
                    <Text size='sm' c='dimmed' mt='xs'>
                      {t('demoSubtitle')}
                    </Text>
                  </div>

                  <Divider />

                  <Stack gap='sm' className={classes.features} style={{ flex: 1 }}>
                    <Group gap='sm' align='flex-start'>
                      <IconCheck size={20} className={classes.checkIcon} />
                      <Text size='sm'>{t('demoFeature1')}</Text>
                    </Group>
                    <Group gap='sm' align='flex-start'>
                      <IconCheck size={20} className={classes.checkIcon} />
                      <Text size='sm'>{t('demoFeature2')}</Text>
                    </Group>
                    <Group gap='sm' align='flex-start'>
                      <IconCheck size={20} className={classes.checkIcon} />
                      <Text size='sm'>{t('demoFeature3')}</Text>
                    </Group>
                    <Group gap='sm' align='flex-start'>
                      <IconCheck size={20} className={classes.checkIcon} />
                      <Text size='sm'>{t('demoFeature4')}</Text>
                    </Group>
                  </Stack>

                  <Button onClick={handleDemoClick} size='lg' variant='filled' fullWidth mt='auto'>
                    {tDemo('startDemo')}
                  </Button>
                </Stack>
              </Card>

              {/* Standard Pricing Card - Most Popular */}
              <Card
                className={`${classes.pricingCard} ${classes.popularCard}`}
                padding='xl'
                radius='lg'
                withBorder
                shadow='xl'
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}
              >
                <Stack gap='lg' h='100%' justify='space-between' style={{ flex: 1 }}>
                  <div>
                    <Badge size='lg' variant='filled' color='violet' mb='sm'>
                      {t('mostPopular')}
                    </Badge>
                    <Title order={3} className={classes.planTitle}>
                      {t('planName')}
                    </Title>
                  </div>

                  <div className={classes.priceSection}>
                    <Group gap='xs' align='flex-start' justify='center' wrap='nowrap'>
                      <Text size='3.5rem' fw={700} className={classes.price} lh={1}>
                        {INDIVIDUAL_ANNUAL_PRICE_CHF}
                      </Text>
                      <Text size='lg' c='dimmed' mt='md' lh={1}>
                        CHF
                      </Text>
                    </Group>
                    <Text size='sm' c='dimmed' mt='xs' ta='center'>
                      {t('perYear')}
                    </Text>
                  </div>

                  <Divider />

                  <Stack gap='sm' className={classes.features}>
                    <Group gap='sm' align='flex-start'>
                      <IconCheck size={20} className={classes.checkIcon} />
                      <Text size='sm'>{t('feature1')}</Text>
                    </Group>
                    <Group gap='sm' align='flex-start'>
                      <IconCheck size={20} className={classes.checkIcon} />
                      <Text size='sm'>{t('feature2')}</Text>
                    </Group>
                    <Group gap='sm' align='flex-start'>
                      <IconCheck size={20} className={classes.checkIcon} />
                      <Text size='sm'>{t('feature3')}</Text>
                    </Group>
                    <Group gap='sm' align='flex-start'>
                      <IconCheck size={20} className={classes.checkIcon} />
                      <Text size='sm'>{t('feature4')}</Text>
                    </Group>
                  </Stack>

                  <Button
                    onClick={handleStandardClick}
                    size='lg'
                    variant='filled'
                    fullWidth
                    mt='auto'
                  >
                    {t('getStarted')}
                  </Button>
                </Stack>
              </Card>

              {/* Multiple Licenses Card */}
              <Card
                className={classes.pricingCard}
                padding='xl'
                radius='md'
                withBorder
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}
              >
                <Stack gap='lg' h='100%' justify='space-between' style={{ flex: 1 }}>
                  <div>
                    <Badge size='lg' variant='light' color='violet' mb='sm'>
                      {t('multipleLicenses')}
                    </Badge>
                    <Title order={3} className={classes.planTitle}>
                      {t('multipleLicensesTitle')}
                    </Title>
                  </div>

                  <div className={classes.priceSection}>
                    <Group gap='xs' align='flex-start' justify='center' wrap='nowrap'>
                      <Text size='3rem' fw={700} className={classes.price} lh={1}>
                        3+
                      </Text>
                      <Text size='lg' c='dimmed' mt='md' lh={1}>
                        {t('licenses')}
                      </Text>
                    </Group>
                  </div>

                  <Divider />

                  <Stack gap='sm' className={classes.features}>
                    <Group gap='sm' align='flex-start'>
                      <IconCheck size={20} className={classes.checkIcon} />
                      <Text size='sm'>{t('multipleFeature1')}</Text>
                    </Group>
                    <Group gap='sm' align='flex-start'>
                      <IconCheck size={20} className={classes.checkIcon} />
                      <Text size='sm'>{t('multipleFeature2')}</Text>
                    </Group>
                    <Group gap='sm' align='flex-start'>
                      <IconCheck size={20} className={classes.checkIcon} />
                      <Text size='sm'>{t('multipleFeature3')}</Text>
                    </Group>
                    <Group gap='sm' align='flex-start'>
                      <IconCheck size={20} className={classes.checkIcon} />
                      <Text size='sm'>{t('multipleFeature4')}</Text>
                    </Group>
                  </Stack>

                  <Button
                    onClick={() => setOrgModalOpened(true)}
                    size='lg'
                    variant='filled'
                    fullWidth
                    mt='auto'
                  >
                    {t('requestQuote')}
                  </Button>
                </Stack>
              </Card>
            </SimpleGrid>

            {/* Social Proof
            <Center mt='xl' className={classes.socialProof}>
              <Stack gap='xs' align='center' maw={600}>
                <Text size='sm' fw={600} className={classes.socialProofText}>
                  {t('socialProof1')}
                </Text>
                <Text size='xs' className={classes.socialProofText} ta='center'>
                  {t('socialProof2')}
                </Text>
              </Stack>
            </Center> */}
          </Stack>
        </Container>
      </div>
    </>
  )
}
