import React from 'react'
import { Container, Text, Stack, Title, Flex } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { useMediaQuery } from '@mantine/hooks'
import { IconClockRecord, IconChartBar, IconFileText } from '@tabler/icons-react'
import { TimeRecordingDemo } from './TimeRecordingDemo'
import classes from './TimeRecordingHero.module.css'

interface Feature {
  title: string
  description: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

export function TimeRecordingHero() {
  const t = useTranslations('TimeRecordingHero')
  const isSmallScreen = useMediaQuery('(max-width: 768px)')

  const features: Feature[] = [
    {
      title: t('feature1Title') || 'Arbeitszeit einfach erfassen',
      description: t('feature1Description') || 'Direkt nach Kategorien des Berufsauftrags',
      icon: IconClockRecord,
    },
    {
      title: t('feature2Title') || 'Übersicht behalten',
      description: t('feature2Description') || 'Klare Statistiken zu allen geleisteten Stunden',
      icon: IconChartBar,
    },
    {
      title: t('feature3Title') || 'Professionell dokumentieren',
      description: t('feature3Description') || 'Für Gespräche, Planung und Transparenz',
      icon: IconFileText,
    },
  ]

  return (
    <div className={classes.wrapper}>
      <Container size={1200} className={classes.inner}>
        <Stack gap='xl' className={classes.content}>
          <Title order={1} className={classes.title}>
            {t('titlePrefix')}{' '}
            <Text
              component='span'
              variant='gradient'
              gradient={{ from: 'rgb(213,80,124)', to: 'rgb(113,61,216)' }}
              inherit
            >
              {t('titleSuffix')}
            </Text>
          </Title>
          <Flex
            direction={isSmallScreen ? 'column' : 'row'}
            gap={isSmallScreen ? 30 : 40}
            align='center'
            justify='space-between'
            className={classes.mainContent}
          >
            <div className={classes.demoSection}>
              <TimeRecordingDemo />
            </div>
            <Stack gap='xl' className={classes.textSection}>
              <dl className={classes.features}>
                {features.map((feature, index) => {
                  const IconComponent = feature.icon
                  return (
                    <div key={index} className={classes.featureItem}>
                      <div className={classes.iconChip} aria-hidden='true'>
                        <IconComponent size={20} className={classes.icon} />
                      </div>
                      <div className={classes.featureContent}>
                        <dt className={classes.featureTitle}>{feature.title}</dt>
                        <dd className={classes.featureDescription}>{feature.description}</dd>
                      </div>
                    </div>
                  )
                })}
              </dl>
            </Stack>
          </Flex>
        </Stack>
      </Container>
    </div>
  )
}
