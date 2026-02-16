import { Container, Title, Accordion, rem, Stack, Text, Box, useMantineTheme } from '@mantine/core'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import classes from './FAQ.module.css'

export function FAQ() {
  const t = useTranslations('FAQ')
  const theme = useMantineTheme()

  return (
    <Box bg='light-dark(white, var(--mantine-color-dark-7))'>
      <Container size='sm' className={classes.wrapper}>
        <Title ta='center' className={classes.title}>
          {t('title')}
        </Title>

        <Accordion variant='separated'>
          <Accordion.Item className={classes.item} value='get-license'>
            <Accordion.Control>{t('get-license-title')}</Accordion.Control>
            <Accordion.Panel>
              <Stack>
                {t('get-license-text')}
                <Link href='/license'>
                  <Text c='light-dark(blue, blue.4)'>{t('more-informations')}</Text>
                </Link>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item className={classes.item} value='use-on-phone'>
            <Accordion.Control>{t('use-on-phone-title')}</Accordion.Control>
            <Accordion.Panel>{t('use-on-phone-text')}</Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item className={classes.item} value='region-unavailable'>
            <Accordion.Control>{t('region-unavailable-title')}</Accordion.Control>
            <Accordion.Panel>{t('region-unavailable-text')}</Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item className={classes.item} value='transfer-data'>
            <Accordion.Control>{t('transfer-data-title')}</Accordion.Control>
            <Accordion.Panel>{t('transfer-data-text')}</Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item className={classes.item} value='purchase-license'>
            <Accordion.Control>{t('purchase-license-title')}</Accordion.Control>
            <Accordion.Panel>{t('purchase-license-text')}</Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Container>
    </Box>
  )
}
