import React from 'react'
import { Container, Title, Text, Stack, Button, Group, Card, Flex } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { useMediaQuery } from '@mantine/hooks'
import { IconMail, IconPlayerPlay } from '@tabler/icons-react'
import Link from 'next/link'
import classes from './DemoSection.module.css'

export function DemoSection() {
  const t = useTranslations('DemoSection')
  const isSmallScreen = useMediaQuery('(max-width: 768px)')

  const handleShareEmail = () => {
    const subject = encodeURIComponent(t('emailSubject'))
    const body = encodeURIComponent(t('emailBody'))
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  return (
    <div className={classes.wrapper}>
      <Container size={1100} className={classes.inner}>
        <Stack gap='xl' ta='center'>
          <div>
            <Title order={2} mb='md'>
              {t('title')}
            </Title>
            <Text size='lg' c='dimmed' maw={700} mx='auto'>
              {t('description')}
            </Text>
          </div>

          <Flex
            direction={isSmallScreen ? 'column' : 'row'}
            gap='md'
            justify='center'
            align='stretch'
            wrap='wrap'
          >
            <Card withBorder radius='md' p='xl' className={classes.card}>
              <Stack gap='md' align='center'>
                <IconPlayerPlay size={48} stroke={1.5} color='var(--mantine-color-violet-6)' />
                <Title order={4}>{t('tryDemo')}</Title>
                <Text size='sm' c='dimmed' ta='center'>
                  {t('demoDescription')}
                </Text>
                <Button
                  component={Link}
                  href='/register'
                  variant='filled'
                  size='md'
                  leftSection={<IconPlayerPlay size={18} />}
                  fullWidth
                >
                  {t('startDemo')}
                </Button>
              </Stack>
            </Card>

            <Card withBorder radius='md' p='xl' className={classes.card}>
              <Stack gap='md' align='center'>
                <IconMail size={48} stroke={1.5} color='var(--mantine-color-violet-6)' />
                <Title order={4}>{t('shareWithSchool')}</Title>
                <Text size='sm' c='dimmed' ta='center'>
                  {t('shareDescription')}
                </Text>
                <Button
                  onClick={handleShareEmail}
                  variant='outline'
                  size='md'
                  leftSection={<IconMail size={18} />}
                  fullWidth
                >
                  {t('shareViaEmail')}
                </Button>
              </Stack>
            </Card>
          </Flex>
        </Stack>
      </Container>
    </div>
  )
}
