import {
  Container,
  Text,
  Button,
  Group,
  rem,
  Image,
  Stack,
  Alert,
  Flex,
  useMantineTheme,
} from '@mantine/core'
import { BrandApple, BrandGooglePlay } from 'tabler-icons-react'
import { useTranslations } from 'next-intl'
import { IconSpeakerphone } from '@tabler/icons-react'
import Link from 'next/link'
import { useMediaQuery } from '@mantine/hooks'
import classes from './Hero.module.css'

export function HeroTitle() {
  const isSmallScreen = useMediaQuery('(max-width: 768px)')
  const t = useTranslations('Index')

  return (
    <div className={classes.wrapper}>
      <Container size={1100} className={classes.inner}>
        <Stack gap={75}>
          <h1 className={classes.title}>
            {t('title')}{' '}
            <Text
              component='span'
              variant='gradient'
              gradient={{ from: 'rgb(213,80,124)', to: 'rgb(113,61,216)' }}
              inherit
            >
              EduTime
            </Text>
          </h1>
          {/* <Alert
            leftSection={<IconSpeakerphone size='1rem' />}
            title={t('alert_new_title')}
            c='indigo'
          >
            {t('alert_new_message')}{' '}
            <Link href='/new-edutime'>
              <Text c='blue'>{t('alert_new_link')}</Text>
            </Link>
          </Alert> */}

          <Flex
            direction={isSmallScreen ? 'column' : 'row'}
            justify='flex-start'
            gap={50}
            className={classes.sidebyside}
          >
            <Image
              alt='EduTime App'
              src={'/mock_laptop_phone.png'}
              className={classes.screenshot}
            />

            <Stack>
              <Text className={classes.description} c='dimmed'>
                {t('edutime_introduction_new')}
              </Text>
            </Stack>
          </Flex>
        </Stack>
      </Container>
    </div>
  )
}
