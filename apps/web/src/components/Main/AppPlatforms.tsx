import React from 'react'
import {
  Container,
  Title,
  Text,
  Stack,
  Button,
  Group,
  Card,
  Flex,
  useMantineColorScheme,
} from '@mantine/core'
import { useTranslations } from 'next-intl'
import { useMediaQuery } from '@mantine/hooks'
import {
  IconBrandGooglePlay,
  IconBrandApple,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconBrandChrome,
  IconBrandFirefox,
  IconBrandSafari,
  IconBrandEdge,
} from '@tabler/icons-react'
import Link from 'next/link'
import classes from './AppPlatforms.module.css'

export function AppPlatforms() {
  const t = useTranslations('AppPlatforms')
  const isSmallScreen = useMediaQuery('(max-width: 768px)')
  const isMediumScreen = useMediaQuery('(min-width: 769px) and (max-width: 1024px)')
  const { colorScheme } = useMantineColorScheme()
  const iconColor =
    colorScheme === 'dark' ? 'var(--mantine-color-gray-2)' : 'var(--mantine-color-gray-9)'

  return (
    <div className={classes.wrapper}>
      <Container size={1100} className={classes.inner}>
        <Stack gap='xl' ta='center'>
          <div>
            <Title order={2} mb='md' className={classes.title}>
              {t('title')}
            </Title>
            <Text size='lg' maw={700} mx='auto' className={classes.description}>
              {t('description')}
            </Text>
          </div>

          <Flex
            direction={isSmallScreen || isMediumScreen ? 'column' : 'row'}
            gap='xl'
            justify='center'
            align='stretch'
            wrap='wrap'
            className={isMediumScreen ? classes.mediumScreenContainer : undefined}
          >
            <Card withBorder radius='md' p='xl' className={classes.card}>
              <Stack gap='md' align='center' className={classes.cardContent}>
                <div>
                  <IconDeviceDesktop size={48} stroke={1.5} color='var(--mantine-color-violet-6)' />
                  <Title order={4} mt='md'>
                    {t('webapp')}
                  </Title>
                  <Text size='sm' c='dimmed' ta='center'>
                    {t('webappDescription')}
                  </Text>
                </div>
                <div className={classes.browserIconsContainer}>
                  <Group gap='sm' justify='center' wrap='nowrap'>
                    <IconBrandChrome
                      size={40}
                      stroke={1.5}
                      className={classes.browserIcon}
                      color={iconColor}
                    />
                    <IconBrandFirefox
                      size={40}
                      stroke={1.5}
                      className={classes.browserIcon}
                      color={iconColor}
                    />
                    <IconBrandSafari
                      size={40}
                      stroke={1.5}
                      className={classes.browserIcon}
                      color={iconColor}
                    />
                    <IconBrandEdge
                      size={40}
                      stroke={1.5}
                      className={classes.browserIcon}
                      color={iconColor}
                    />
                  </Group>
                </div>
                <Button
                  component={Link}
                  href='/register'
                  variant='filled'
                  size='md'
                  fullWidth
                  className={classes.cardButton}
                >
                  {t('tryWebapp')}
                </Button>
              </Stack>
            </Card>

            <Card withBorder radius='md' p='xl' className={classes.card}>
              <Stack gap='md' align='center' className={classes.cardContent}>
                <div>
                  <IconDeviceMobile size={48} stroke={1.5} color='var(--mantine-color-violet-6)' />
                  <Title order={4} mt='md'>
                    {t('mobileApp')}
                  </Title>
                  <Text size='sm' c='dimmed' ta='center'>
                    {t('mobileDescription')}
                  </Text>
                </div>
                <div className={classes.browserIconsContainer}>
                  <Group gap='sm' justify='center' wrap='nowrap'>
                    <IconBrandApple
                      size={40}
                      stroke={1.5}
                      className={classes.browserIcon}
                      color={iconColor}
                    />
                    <IconBrandGooglePlay
                      size={40}
                      stroke={1.5}
                      className={classes.browserIcon}
                      color={iconColor}
                    />
                  </Group>
                </div>
                <Button
                  component={Link}
                  href='/mobile'
                  variant='outline'
                  size='md'
                  fullWidth
                  className={classes.cardButton}
                >
                  {t('downloadMobile')}
                </Button>
              </Stack>
            </Card>
          </Flex>
        </Stack>
      </Container>
    </div>
  )
}
