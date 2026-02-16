import { Container, Text, Stack, rem } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { GetStaticPropsContext } from 'next/types'
import classes from './Cookies.module.css'

export function CookiesHero() {
  const t = useTranslations('Cookies')

  return (
    <div className={classes.wrapper}>
      <Container size={1000} className={classes.inner}>
        <h1 className={classes.title}>{t('cookies')}</h1>
        <Stack gap='sm' className={classes.description}>
          <Text c='dimmed'>{t('cookiesText1')}</Text>
          <Text c='dimmed'>{t('cookiesText2')}</Text>
          <Text c='dimmed'>{t('cookiesText3')}</Text>
          <Text c='dimmed'>{t('cookiesText4')}</Text>
        </Stack>
      </Container>
    </div>
  )
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../../messages/${locale}.json`)).default,
    },
  }
}
