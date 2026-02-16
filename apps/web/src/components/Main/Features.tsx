import { Container, Text, Title, Stack, Card, SimpleGrid, rem } from '@mantine/core'
import { IconHourglass, IconBriefcase, IconChartBar } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'
import { useMediaQuery } from '@mantine/hooks'
import classes from './Features.module.css'

export function Features() {
  const isSmallScreen = useMediaQuery('(max-width: 768px)')
  const t = useTranslations('Features')

  const featuresData = [
    {
      title: t('timeTracking'),
      description: t('timeTrackingDesc'),
      icon: IconHourglass,
    },
    {
      title: t('employmentConsideration'),
      description: t('employmentConsiderationDesc'),
      icon: IconBriefcase,
    },
    {
      title: t('statistics'),
      description: t('statisticsDesc'),
      icon: IconChartBar,
    },
  ]

  return (
    <div className={classes.wrapper}>
      <Container size={1100} className={classes.inner}>
        <Stack ta='center' gap={75}>
          <Title c='white'>{t('title')}</Title>
          <SimpleGrid cols={isSmallScreen ? 1 : 3} spacing='sm'>
            {featuresData.map((feature) => (
              <Card key={feature.title} shadow='md' radius='md' className={classes.card}>
                <feature.icon size='3.125rem' stroke={1.5} color='var(--mantine-color-violet-6)' />
                <Title order={4} mt='md'>
                  {feature.title}
                </Title>
                <Text size='sm' c='dimmed' mt='sm'>
                  {feature.description}
                </Text>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>
    </div>
  )
}
