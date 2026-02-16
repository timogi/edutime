import React from 'react'
import { Stack, Title, Image } from '@mantine/core'
import { GetStaticPropsContext } from 'next/types'
import { useTranslations } from 'next-intl'

export function UnderConstruction() {
  const t = useTranslations('Index')

  return (
    <>
      <Stack justify='center' ta='center'>
        <Image
          src='/construction.svg'
          alt='construction design by Vecteezy.com'
          width={300}
          h={140}
        />
        <Title size={18} variant='gradient'>
          {t('newFeature')}
        </Title>
      </Stack>
    </>
  )
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../messages/${locale}.json`)).default,
    },
  }
}
