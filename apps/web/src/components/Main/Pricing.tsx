import React, { useState } from 'react'
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
} from '@mantine/core'
import { useTranslations } from 'next-intl'
import { IconCheck } from '@tabler/icons-react'
import { useRouter } from 'next/router'
import { supabase } from '@/utils/supabase/client'
import { showNotification } from '@mantine/notifications'
import { OrgPriceCalculatorModal } from './OrgPriceCalculatorModal'
import { INDIVIDUAL_ANNUAL_PRICE_CHF } from '@/utils/payments/pricing'
import { useUser } from '@/contexts/UserProvider'
import { hasEverHadTrial } from '@edutime/shared'
import classes from './Pricing.module.css'

export function Pricing() {
  return <PricingCards />
}

type PricingCardsProps = {
  embedded?: boolean
  hideDemoCard?: boolean
  onDemoClick?: () => void | Promise<void>
  onStandardClick?: () => void
  onOrganizationClick?: () => void
  demoButtonLabel?: string
  standardButtonLabel?: string
  organizationButtonLabel?: string
}

export function PricingCards({
  embedded = false,
  hideDemoCard = false,
  onDemoClick,
  onStandardClick,
  onOrganizationClick,
  demoButtonLabel,
  standardButtonLabel,
  organizationButtonLabel,
}: PricingCardsProps) {
  const t = useTranslations('Pricing')
  const tDemo = useTranslations('DemoSection')
  const tIndex = useTranslations('Index')
  const tNoLicense = useTranslations('NoLicense')
  const router = useRouter()
  const { user, hasActiveSubscription } = useUser()
  const [orgModalOpened, setOrgModalOpened] = useState(false)
  const isLoggedIn = Boolean(user)
  const showOnlyOrganizationOption = isLoggedIn && hasActiveSubscription

  const handleDemoClickDefault = async () => {
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

        if (user?.user_id) {
          const alreadyHadTrial = await hasEverHadTrial(supabase, user.user_id)
          if (alreadyHadTrial) {
            showNotification({
              title: tNoLicense('demo-already-used'),
              message: tNoLicense('demo-already-used-message'),
              color: 'orange',
            })
            return
          }
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

        const data = (await response.json()) as {
          error?: string
          entitlement?: { valid_from: string }
        }

        if (!response.ok) {
          throw new Error(data.error || 'Failed to start demo')
        }

        if (data.entitlement) {
          const validFrom = new Date(data.entitlement.valid_from)
          const secondsSinceCreation = (Date.now() - validFrom.getTime()) / 1000
          if (secondsSinceCreation > 5) {
            showNotification({
              title: tNoLicense('demo-already-used'),
              message: tNoLicense('demo-already-used-message'),
              color: 'orange',
            })
            return
          }
        }

        showNotification({
          title: tIndex('success') || 'Erfolg',
          message: tNoLicense('demo-started-message'),
          color: 'green',
        })

        // Redirect to app
        router.push('/app')
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to start demo'
        showNotification({
          title: tIndex('error') || 'Fehler',
          message,
          color: 'red',
        })
      }
    } else {
      // Redirect to register with demo intent
      router.push('/register?intent=demo')
    }
  }

  const handleStandardClickDefault = () => {
    if (isLoggedIn) {
      router.push('/checkout?plan=annual')
    } else {
      router.push('/register?intent=annual')
    }
  }

  const handleDemoClick = onDemoClick ?? handleDemoClickDefault
  const handleStandardClick = onStandardClick ?? handleStandardClickDefault
  const handleOrganizationClick = onOrganizationClick ?? (() => setOrgModalOpened(true))

  const mdPricingCols = showOnlyOrganizationOption ? 1 : hideDemoCard ? 2 : 3

  const content = (
    <Stack gap='xl' align='center'>
      {!embedded ? (
        <div className={classes.header}>
          <Title order={2} className={classes.title} ta='center'>
            {t('title')}
          </Title>
          <Text size='lg' className={classes.description} ta='center' maw={600}>
            {t('description')}
          </Text>
        </div>
      ) : null}

      <SimpleGrid
        cols={{ base: 1, md: mdPricingCols }}
        spacing='lg'
        w='100%'
        maw={embedded && hideDemoCard && !showOnlyOrganizationOption ? 900 : undefined}
        mx={embedded && hideDemoCard && !showOnlyOrganizationOption ? 'auto' : undefined}
        className={classes.grid}
      >
        {!showOnlyOrganizationOption ? (
          <>
            {/* Demo Card */}
            {!hideDemoCard ? (
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
                    <Group gap='sm' align='flex-start' wrap='nowrap' className={classes.featureRow}>
                      <IconCheck size={20} className={classes.checkIcon} />
                      <Text size='sm' className={classes.featureText}>
                        {t('demoFeature1')}
                      </Text>
                    </Group>
                    <Group gap='sm' align='flex-start' wrap='nowrap' className={classes.featureRow}>
                      <IconCheck size={20} className={classes.checkIcon} />
                      <Text size='sm' className={classes.featureText}>
                        {t('demoFeature2')}
                      </Text>
                    </Group>
                    <Group gap='sm' align='flex-start' wrap='nowrap' className={classes.featureRow}>
                      <IconCheck size={20} className={classes.checkIcon} />
                      <Text size='sm' className={classes.featureText}>
                        {t('demoFeature4')}
                      </Text>
                    </Group>
                  </Stack>

                  <Button onClick={handleDemoClick} size='lg' variant='filled' fullWidth mt='auto'>
                    {demoButtonLabel ?? tDemo('startDemo')}
                  </Button>
                </Stack>
              </Card>
            ) : null}

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
                  <Group gap='sm' align='flex-start' wrap='nowrap' className={classes.featureRow}>
                    <IconCheck size={20} className={classes.checkIcon} />
                    <Text size='sm' className={classes.featureText}>
                      {t('feature1')}
                    </Text>
                  </Group>
                  <Group gap='sm' align='flex-start' wrap='nowrap' className={classes.featureRow}>
                    <IconCheck size={20} className={classes.checkIcon} />
                    <Text size='sm' className={classes.featureText}>
                      {t('feature2')}
                    </Text>
                  </Group>
                  <Group gap='sm' align='flex-start' wrap='nowrap' className={classes.featureRow}>
                    <IconCheck size={20} className={classes.checkIcon} />
                    <Text size='sm' className={classes.featureText}>
                      {t('feature3')}
                    </Text>
                  </Group>
                  <Group gap='sm' align='flex-start' wrap='nowrap' className={classes.featureRow}>
                    <IconCheck size={20} className={classes.checkIcon} />
                    <Text size='sm' className={classes.featureText}>
                      {t('feature4')}
                    </Text>
                  </Group>
                </Stack>

                <Button onClick={handleStandardClick} size='lg' variant='filled' fullWidth mt='auto'>
                  {standardButtonLabel ?? t('getStarted')}
                </Button>
              </Stack>
            </Card>
          </>
        ) : null}

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
              <Group gap='sm' align='flex-start' wrap='nowrap' className={classes.featureRow}>
                <IconCheck size={20} className={classes.checkIcon} />
                <Text size='sm' className={classes.featureText}>
                  {t('multipleFeature1')}
                </Text>
              </Group>
              <Group gap='sm' align='flex-start' wrap='nowrap' className={classes.featureRow}>
                <IconCheck size={20} className={classes.checkIcon} />
                <Text size='sm' className={classes.featureText}>
                  {t('multipleFeature2')}
                </Text>
              </Group>
              <Group gap='sm' align='flex-start' wrap='nowrap' className={classes.featureRow}>
                <IconCheck size={20} className={classes.checkIcon} />
                <Text size='sm' className={classes.featureText}>
                  {t('multipleFeature3')}
                </Text>
              </Group>
              <Group gap='sm' align='flex-start' wrap='nowrap' className={classes.featureRow}>
                <IconCheck size={20} className={classes.checkIcon} />
                <Text size='sm' className={classes.featureText}>
                  {t('multipleFeature4')}
                </Text>
              </Group>
            </Stack>

            <Button onClick={handleOrganizationClick} size='lg' variant='filled' fullWidth mt='auto'>
              {organizationButtonLabel ?? t('requestQuote')}
            </Button>
          </Stack>
        </Card>
      </SimpleGrid>
    </Stack>
  )

  return (
    <>
      <OrgPriceCalculatorModal opened={orgModalOpened} onClose={() => setOrgModalOpened(false)} />
      {embedded ? (
        content
      ) : (
        <div className={classes.wrapper}>
          <Container size={1200} className={classes.inner}>
            {content}
          </Container>
        </div>
      )}
    </>
  )
}
