import React from 'react'
import { Text, Progress as MantineProgress, Card, Group } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { GetStaticPropsContext } from 'next/types'

const Progress = ({ takenSeats, totalSeats }: { takenSeats: number; totalSeats: number }) => {
  const t = useTranslations('Index')
  const progressValue = (takenSeats / totalSeats) * 100

  return (
    <Card
      p='xl'
      style={{
        backgroundColor: 'light-dark(var(--mantine-color-white), var(--mantine-color-dark-7))',
      }}
    >
      <Group justify='space-between'>
        <Text fz='xs' tt='uppercase' fw={700} c='dimmed'>
          {t('Licenses Issued')}
        </Text>
        <Text fz='lg' fw={500}>
          {takenSeats} / {totalSeats}
        </Text>
      </Group>
      <MantineProgress value={progressValue} mt='md' size='lg' radius='xl' />
    </Card>
  )
}

export default Progress

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../../messages/${locale}.json`)).default,
    },
  }
}
