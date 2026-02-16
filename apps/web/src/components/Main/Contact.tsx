import { Container, Text, Button, Stack, Title, Group } from '@mantine/core'
import { IconMail } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'
import classes from './Contact.module.css'

export function ContactHero() {
  const t = useTranslations('Index')

  return (
    <div className={classes.wrapper}>
      <Container size={1000} className={classes.inner}>
        <Stack gap='lg' align='center' ta='center'>
          <Title order={2} className={classes.title}>
            {t('contact-title')}
          </Title>
          <Text size='lg' className={classes.description} c='white' maw={600}>
            {t('contact-subtitle')}
          </Text>
          <Group justify='center' mt='md'>
            <Button
              size='lg'
              component='a'
              href={'mailto:info@edutime.ch'}
              leftSection={<IconMail size='1.25rem' />}
              variant='outline'
              className={classes.contactButton}
            >
              {t('contact')}
            </Button>
          </Group>
        </Stack>
      </Container>
    </div>
  )
}
