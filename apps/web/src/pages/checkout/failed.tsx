import { useRouter } from 'next/router'
import { GetStaticPropsContext } from 'next/types'
import { Container, Paper, Stack, Text, Title, Button, ThemeIcon } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { IconCircleX } from '@tabler/icons-react'

export default function CheckoutFailedPage() {
  const router = useRouter()
  const t = useTranslations('Checkout')

  return (
    <Container size={480} my={40}>
      <Paper withBorder p={30} radius='md'>
        <Stack gap='lg' align='center'>
          <ThemeIcon size={64} radius='xl' color='red' variant='light'>
            <IconCircleX size={40} />
          </ThemeIcon>

          <Title order={2} ta='center'>
            {t('failedTitle')}
          </Title>

          <Text c='dimmed' ta='center' size='sm'>
            {t('failedDescription')}
          </Text>

          <Stack gap='sm' w='100%' mt='md'>
            <Button onClick={() => router.push('/checkout')} variant='filled' fullWidth>
              {t('tryAgain')}
            </Button>
            <Button onClick={() => router.push('/')} variant='subtle' fullWidth>
              {t('backToHome')}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  )
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../../messages/${locale}.json`)).default,
    },
  }
}
