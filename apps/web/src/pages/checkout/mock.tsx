import { useRouter } from 'next/router'
import { GetStaticPropsContext } from 'next/types'
import { Container, Paper, Stack, Text, Title, Button, Alert } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { IconCheck, IconInfoCircle } from '@tabler/icons-react'

export default function MockCheckoutPage() {
  const router = useRouter()
  const t = useTranslations('Index')

  const sessionId = (router.query.sessionId as string) || null
  const plan = (router.query.plan as string) || null
  const qty = router.query.qty ? parseInt(router.query.qty as string, 10) : null

  return (
    <Container size={600} my={40}>
      <Paper withBorder p={30} radius='md'>
        <Stack gap='md'>
          <Alert icon={<IconInfoCircle size={16} />} title='Mock Checkout' color='blue'>
            This is a mock checkout page for development purposes. In production, this would be
            replaced with the actual payment provider checkout page.
          </Alert>

          <Title order={2}>Checkout Summary</Title>

          <Stack gap='sm'>
            <Text>
              <strong>Session ID:</strong> {sessionId || 'N/A'}
            </Text>
            <Text>
              <strong>Plan:</strong> {plan || 'N/A'}
            </Text>
            {qty && (
              <Text>
                <strong>Quantity:</strong> {qty} licenses
              </Text>
            )}
          </Stack>

          <Alert icon={<IconCheck size={16} />} title='Payment Successful' color='green' mt='md'>
            In a real implementation, the payment would be processed here and the user would be
            redirected back to the app with a success status.
          </Alert>

          <Button onClick={() => router.push('/app')} variant='filled' fullWidth mt='md'>
            Return to App
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
