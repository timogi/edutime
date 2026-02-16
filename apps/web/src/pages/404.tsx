import React from 'react'
import { Button, Container, Group, Text, Title } from '@mantine/core'
import { Illustration } from '../utils/illustration'
import { useTranslations } from 'next-intl'
import { GetStaticPropsContext } from 'next/types'
import { useRouter } from 'next/router'
import classes from './404.module.css'

export default function NothingFoundBackground(): React.ReactElement {
  const t = useTranslations('Error')
  const router = useRouter()

  const handleBackHome = () => {
    router.push('/')
  }

  return (
    <Container className={classes.root}>
      <div className={classes.inner}>
        <Illustration className={classes.image} />
        <div className={classes.content}>
          <Title className={classes.title}>{t('title')}</Title>
          <Text c='dimmed' size='lg' ta='center' className={classes.description}>
            {t('description')}
          </Text>
          <Group justify='center'>
            <Button size='md' onClick={handleBackHome}>
              {t('backHome')}
            </Button>
          </Group>
        </div>
      </div>
    </Container>
  )
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../messages/${locale}.json`)).default,
    },
  }
}
