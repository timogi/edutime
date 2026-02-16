import Head from 'next/head'
import { Container, Title, Stack, Text, Divider, Paper, Table } from '@mantine/core'
import { HeaderSimple } from '@/components/Main/Header'
import { ContactHero } from '@/components/Main/Contact'
import { GetStaticPropsContext } from 'next'
import { Footer } from '@/components/Footer/Footer'
import { AppShell } from '@mantine/core'
import { useTranslations } from 'next-intl'

export default function Contract() {
  const t = useTranslations('Contract')

  return (
    <AppShell header={{ height: 60 }} padding={0}>
      <Head>
        <title>EduTime - {t('title')}</title>
      </Head>
      <HeaderSimple />
      <Container size={900} py='xl'>
        <Stack gap='xl'>
          <Title order={1} ta='center'>
            {t('title')}
          </Title>

          <Stack gap='md'>
            <Text ta='center' fw={500}>
              {t('between')}
            </Text>

            <Paper withBorder p='md' radius='md'>
              <Stack gap='xs'>
                <Text fw={600}>EduTime</Text>
                <Text>{t('edutime.name')}</Text>
                <Text>{t('edutime.address')}</Text>
                <Text>{t('edutime.street')}</Text>
                <Text>{t('edutime.city')}</Text>
                <Text size='sm' c='dimmed' mt='xs'>
                  {t('edutime.label')}
                </Text>
              </Stack>
            </Paper>

            <Paper withBorder p='md' radius='md'>
              <Stack gap='xs'>
                <Text fw={600}>{t('customer.label')}</Text>
                <Text>{t('customer.name')}</Text>
                <Text>{t('customer.street')}</Text>
                <Text>{t('customer.city')}</Text>
              </Stack>
            </Paper>
          </Stack>

          <Divider />

          <Stack gap='md'>
            <Title order={2}>{t('subject.title')}</Title>
            <Text>{t('subject.text')}</Text>
          </Stack>

          <Divider />

          <Stack gap='md'>
            <Title order={2}>{t('service.title')}</Title>
            <Text>{t('service.text1')}</Text>

            <Paper
              withBorder
              p='md'
              radius='md'
              bg='light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-7))'
            >
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t('service.tableHeaderSoftware')}</Table.Th>
                    <Table.Th>{t('service.tableHeaderLicense')}</Table.Th>
                    <Table.Th>{t('service.tableHeaderPayment')}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  <Table.Tr>
                    <Table.Td>{t('service.tableRowSoftware')}</Table.Td>
                    <Table.Td>{t('service.tableRowLicense')}</Table.Td>
                    <Table.Td>{t('service.tableRowPayment')}</Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>
              <Text size='sm' c='dimmed' mt='xs'>
                {t('service.tableNote')}
              </Text>
            </Paper>

            <Text>{t('service.text2')}</Text>
            <Text>{t('service.availability')}</Text>
            <Text>{t('service.provision')}</Text>
            <Text size='sm' c='dimmed' fs='italic'>
              {t('service.organizationNote')}
            </Text>
            <Text>{t('service.text3')}</Text>
            <Text>{t('service.payment')}</Text>
          </Stack>

          <Divider />

          <Stack gap='md'>
            <Title order={2}>{t('duration.title')}</Title>
            <Text>{t('duration.text')}</Text>
            <Text>{t('duration.renewal')}</Text>
          </Stack>

          <Divider />

          <Stack gap='md'>
            <Title order={2}>{t('additional.title')}</Title>
            <Text>{t('additional.text')}</Text>
          </Stack>

          <Divider />

          <Stack gap='md'>
            <Title order={2}>{t('components.title')}</Title>
            <Text>{t('components.text1')}</Text>
            <Stack gap='xs' ml='md'>
              <Text>• {t('components.agb')}</Text>
              <Text size='sm' c='dimmed' fs='italic'>
                • {t('components.avv')}
              </Text>
            </Stack>
            <Text>{t('components.text2')}</Text>
            <Text>{t('components.text3')}</Text>
          </Stack>

          <Divider />

          <Stack gap='md'>
            <Title order={2}>{t('signatures.title')}</Title>
            <Text size='sm' c='dimmed' fs='italic'>
              {t('signatures.note')}
            </Text>

            <Paper withBorder p='md' radius='md'>
              <Stack gap='md'>
                <Text fw={600}>{t('signatures.edutime.label')}</Text>
                <Stack gap='xs'>
                  <Text size='sm'>{t('signatures.edutime.location')}</Text>
                  <Text size='sm'>{t('signatures.edutime.signature')}</Text>
                  <Text size='sm'>
                    {t('signatures.edutime.name')} {t('signatures.edutime.value')}
                  </Text>
                </Stack>
              </Stack>
            </Paper>

            <Paper withBorder p='md' radius='md'>
              <Stack gap='md'>
                <Text fw={600}>{t('signatures.customer.label')}</Text>
                <Stack gap='xs'>
                  <Text size='sm'>{t('signatures.customer.location')}</Text>
                  <Text size='sm'>{t('signatures.customer.signature')}</Text>
                  <Text size='sm'>{t('signatures.customer.name')}</Text>
                </Stack>
              </Stack>
            </Paper>

            <Text size='sm' c='dimmed' mt='xs'>
              {t('signatures.digitalNote')}
            </Text>
          </Stack>
        </Stack>
      </Container>
      <ContactHero />
      <Footer />
    </AppShell>
  )
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../../../messages/${locale}.json`)).default,
    },
  }
}
