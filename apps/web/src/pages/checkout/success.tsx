import { useRouter } from 'next/router'
import { GetStaticPropsContext } from 'next/types'
import { Container, Paper, Stack, Text, Title, Button, ThemeIcon } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { IconCircleCheck } from '@tabler/icons-react'

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const t = useTranslations('Checkout')

  return (
    <Container size={480} my={40}>
      <Paper withBorder p={30} radius='md'>
        <Stack gap='lg' align='center'>
          <ThemeIcon size={64} radius='xl' color='green' variant='light'>
            <IconCircleCheck size={40} />
          </ThemeIcon>

          <Title order={2} ta='center'>
            {t('successTitle')}
          </Title>

          <Text c='dimmed' ta='center' size='sm'>
            {t('successDescription')}
          </Text>

          <Text c='dimmed' ta='center' size='xs'>
            {t('successNote')}
          </Text>

          <Button onClick={() => router.push('/app')} variant='filled' fullWidth mt='md'>
            {t('goToApp')}
          </Button>
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
