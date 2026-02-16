import { Container, Text, Button, Group, rem, Image, Stack } from '@mantine/core'
import { BrandApple, BrandGooglePlay } from 'tabler-icons-react'
import { useTranslations } from 'next-intl'
import classes from './OldHero.module.css'

export function HeroTitle() {
  const t = useTranslations('Index')

  return (
    <div className={classes.wrapper}>
      <Container size={1000} className={classes.inner}>
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

        <div className={classes.sidebyside}>
          <Stack>
            <Text className={classes.description} c='dimmed'>
              {t('edutime_introduction')}
            </Text>
            <Group className={classes.controls}>
              <Button
                component='a'
                href='https://apps.apple.com/ch/app/edutime/id6444909019'
                size='xl'
                variant='gradient'
                target='_blank'
                gradient={{ from: 'rgb(213,80,124)', to: 'rgb(113,61,216)' }}
                className={classes.control}
                leftSection={<BrandApple size='1.25rem' />}
              >
                App Store
              </Button>
              <Button
                component='a'
                href='https://play.google.com/store/apps/details?id=ch.timogi.edutime'
                size='xl'
                target='_blank'
                variant='gradient'
                gradient={{ from: 'rgb(213,80,124)', to: 'rgb(113,61,216)', deg: 270 }}
                className={classes.control}
                leftSection={<BrandGooglePlay size='1.25rem' />}
              >
                Play Store
              </Button>
            </Group>
          </Stack>

          <Image
            alt='EduTime App'
            src={'/mocks_6_7.png'}
            width={300}
            className={classes.screenshot}
          />
        </div>
      </Container>
    </div>
  )
}
