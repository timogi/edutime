import { Container, Text, Stack, rem } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { GetStaticPropsContext } from 'next/types'
import classes from './Imprint.module.css'

export function ImprintContent() {
  const t = useTranslations('Index')

  return (
    <Stack gap='sm'>
      <Text c='dimmed'>
        EduTime GmbH
        <br />
        c/o Tim Ogi
        <br />
        Bienenstrasse 8
        <br />
        3018 Bern
        <br />
        UID: CHE-459.271.466
      </Text>
      <Text c='dimmed'>
        E-Mail: info@edutime.ch
        <br />
        Website: https://edutime.ch/
      </Text>
      <Text c='dimmed'>{t('responsible')}: Tim Ogi</Text>
    </Stack>
  )
}

export function ImprintHero() {
  const t = useTranslations('Index')

  return (
    <div className={classes.wrapper}>
      <Container size={1000} className={classes.inner}>
        <h1 className={classes.title}>{t('imprint')}</h1>
        <div className={classes.description}>
          <ImprintContent />
        </div>
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
