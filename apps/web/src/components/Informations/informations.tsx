import React, { useState } from 'react'
import { Card, Stack, Text, Group, Image, Title, Anchor, SimpleGrid, Button } from '@mantine/core'
import { GetStaticPropsContext } from 'next/types'
import { useTranslations } from 'next-intl'
import {
  IconBook,
  IconPdf,
  IconDeviceMobile,
  IconExternalLink,
  IconScale,
  IconShieldLock,
  IconFileText,
  IconHeadset,
  IconArrowLeft,
} from '@tabler/icons-react'
import { UserData } from '@/types/globals'
import classes from './informations.module.css'

interface InformationsProps {
  userData: UserData
}

export function Informations({ userData }: InformationsProps) {
  const t = useTranslations('Index')
  const t_guide = useTranslations('UserGuide')
  const [activeView, setActiveView] = useState<'overview' | 'guide'>('overview')

  const renderSupportedBy = () => {
    if (userData.canton_code === 'BE') {
      return (
        <Card className={classes.sectionCard} padding='md'>
          <Stack gap='md'>
            <Title order={3} size='h4'>
              {t('supportedBy')}
            </Title>
            <Group justify='center'>
              <Image src='/bildung_bern.png' alt='Bildung Bern' h={80} w='auto' fit='contain' />
            </Group>
          </Stack>
        </Card>
      )
    }
    if (userData.canton_code === 'AG') {
      return (
        <Card className={classes.sectionCard} padding='md'>
          <Stack gap='md'>
            <Text size='sm' ta='center' fw={500}>
              Mit freundlicher Empfehlung durch:
            </Text>
            <Group justify='center'>
              <Image src='/bildung_aargau.png' alt='Bildung Aargau' h={80} w='auto' fit='contain' />
            </Group>
            <Anchor
              href='https://bildungaargau.ch/wissenshub'
              target='_blank'
              className={classes.externalLink}
            >
              <Group gap='xs'>
                <IconExternalLink size='1rem' />
                <Text size='sm'>Zum Bildung Aargau WissensHub</Text>
              </Group>
            </Anchor>
          </Stack>
        </Card>
      )
    }
    if (userData.canton_code === 'SG') {
      return (
        <Card className={classes.sectionCard} padding='md'>
          <Stack gap='md'>
            <Title order={3} size='h4'>
              Berufsauftrag St. Gallen
            </Title>
            <Stack gap='xs'>
              <Anchor
                href='https://www.sg.ch/bildung-sport/volksschule/rahmenbedingungen/rechtliche-grundlagen/weisungen-und-reglemente/_jcr_content/Par/sgch_downloadlist/DownloadListPar/sgch_download_1025749121.ocFile/Reglement_Berufsauftrag_November_2014.pdf'
                target='_blank'
                className={classes.documentLink}
              >
                <Group gap='xs'>
                  <IconPdf size='1rem' />
                  <Text size='sm'>Reglement Berufsauftrag</Text>
                </Group>
              </Anchor>
              <Anchor
                href='https://www.sg.ch/bildung-sport/volksschule/rahmenbedingungen/anstellung-lehrpersonen/_jcr_content/Par/sgch_accordion_list/AccordionListPar/sgch_accordion_916192767/AccordionPar/sgch_downloadlist/DownloadListPar/sgch_download.ocFile/Handreichung_Berufsauftrag.pdf'
                target='_blank'
                className={classes.documentLink}
              >
                <Group gap='xs'>
                  <IconPdf size='1rem' />
                  <Text size='sm'>Handreichung Berufsauftrag</Text>
                </Group>
              </Anchor>
            </Stack>
          </Stack>
        </Card>
      )
    }
    if (userData.canton_code === 'TG_S') {
      return (
        <Card className={classes.sectionCard} padding='md'>
          <Stack gap='md'>
            <Title order={3} size='h4'>
              Bildung Thurgau
            </Title>
            <Button
              component='a'
              href='https://www.bildungthurgau.ch/wp-content/uploads/2025/12/251202_EduTime-fuer-Klassenlehrpersonen-im-Kanton-Thurgau_Handreichung-Bildung-Thurgau.pdf'
              target='_blank'
              leftSection={<IconPdf size='1rem' />}
              variant='outline'
            >
              Handreichung und Fragen EduTime
            </Button>
            <Button
              component='a'
              href='https://www.bildungthurgau.ch/wp-content/uploads/2025/12/251202_Hilfsblatt_Kategorien_EduTime.pdf'
              target='_blank'
              leftSection={<IconPdf size='1rem' />}
              variant='outline'
            >
              Hilfsblatt Kategorien
            </Button>
          </Stack>
        </Card>
      )
    }
    return null
  }

  const renderBackButton = () => {
    return (
      <Group>
        <Button
          variant='subtle'
          leftSection={<IconArrowLeft size='1rem' />}
          onClick={() => setActiveView('overview')}
        >
          {t('back')}
        </Button>
      </Group>
    )
  }

  const renderGuide = () => {
    return (
      <Stack gap='lg'>
        {renderBackButton()}

        <Title order={1}>{t_guide('user-guide-title')}</Title>

        <Stack gap='xs'>
          <Title order={2}>{t_guide('intro')}</Title>
          <Text size='lg'>{t_guide('intro-text')}</Text>
        </Stack>

        <Stack gap='md'>
          <Title order={2}>{t_guide('registration')}</Title>
          <Text>{t_guide('registration-text')}</Text>
          <Text>{t_guide('seat-text')}</Text>
        </Stack>

        <Stack gap='md'>
          <Title order={2}>{t_guide('migration')}</Title>
          <Text>{t_guide('migration-text')}</Text>
        </Stack>

        <Stack gap='md'>
          <Title order={2}>{t_guide('time-recording')}</Title>
          <Text fw={500}>{t_guide('time-recording-intro')}</Text>
          <Text>{t_guide('time-recording-text')}</Text>
          <Text>{t_guide('time-recording-text2')}</Text>
          <Text>{t_guide('time-recording-create')}</Text>
          <Text>{t_guide('time-recording-further-categories')}</Text>
          <Image
            alt={t_guide('time-recording')}
            src={'/time-recording.png'}
            maw={800}
            radius={'md'}
          />
        </Stack>

        <Stack gap='md'>
          <Title order={2}>{t_guide('calendar')}</Title>
          <Text>{t_guide('calendar-text')}</Text>
          <Image alt={t_guide('calendar')} src={'/schoolyear.png'} maw={800} radius={'md'} />
        </Stack>

        <Stack gap='md'>
          <Title order={2}>{t_guide('statistics')}</Title>
          <Text>{t_guide('statistics-text')}</Text>
        </Stack>

        <Stack gap='md'>
          <Title order={2}>{t_guide('reporting')}</Title>
          <Text>{t_guide('reporting-text')}</Text>
        </Stack>
      </Stack>
    )
  }

  const renderOverview = () => {
    return (
      <Stack gap='lg'>
        {/* Dokumente */}
        <Stack gap='md'>
          <Title order={2} size='h3'>
            {t('documents')}
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing='md'>
            <Card
              component='a'
              href='/docs/terms'
              target='_blank'
              className={classes.documentCard}
              padding='md'
              withBorder
            >
              <Group gap='sm'>
                <IconScale size='1rem' className={classes.documentIcon} />
                <Text fw={500} size='sm'>
                  {t('termsOfService')}
                </Text>
              </Group>
            </Card>
            <Card
              component='a'
              href='/docs/privacy'
              target='_blank'
              className={classes.documentCard}
              padding='md'
              withBorder
            >
              <Group gap='sm'>
                <IconShieldLock size='1rem' className={classes.documentIcon} />
                <Text fw={500} size='sm'>
                  {t('privacyPolicy')}
                </Text>
              </Group>
            </Card>
            <Card
              component='a'
              href='/docs/imprint'
              target='_blank'
              className={classes.documentCard}
              padding='md'
              withBorder
            >
              <Group gap='sm'>
                <IconFileText size='1rem' className={classes.documentIcon} />
                <Text fw={500} size='sm'>
                  {t('imprint')}
                </Text>
              </Group>
            </Card>
          </SimpleGrid>
        </Stack>

        {/* Hilfe */}
        <Stack gap='md'>
          <Title order={2} size='h3'>
            {t('helpSection')}
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing='md'>
            <Card
              className={classes.documentCard}
              padding='md'
              withBorder
              style={{ cursor: 'pointer' }}
              onClick={() => setActiveView('guide')}
            >
              <Group gap='sm'>
                <IconBook size='1rem' className={classes.documentIcon} />
                <Text fw={500} size='sm'>
                  {t('guide')}
                </Text>
              </Group>
            </Card>
            <Card
              component='a'
              href='/mobile'
              target='_blank'
              className={classes.documentCard}
              padding='md'
              withBorder
            >
              <Group gap='sm'>
                <IconDeviceMobile size='1rem' className={classes.documentIcon} />
                <Text fw={500} size='sm'>
                  {t('mobileApp')}
                </Text>
              </Group>
            </Card>
            <Card
              component='a'
              href='mailto:info@edutime.ch'
              className={classes.documentCard}
              padding='md'
              withBorder
            >
              <Group gap='sm'>
                <IconHeadset size='1rem' className={classes.documentIcon} />
                <Text fw={500} size='sm'>
                  {t('contact')}
                </Text>
              </Group>
            </Card>
          </SimpleGrid>
        </Stack>

        {/* Unterstützung */}
        {renderSupportedBy() && <Stack gap='md'>{renderSupportedBy()}</Stack>}
      </Stack>
    )
  }

  return (
    <div className={classes.wrapper}>
      <div className={classes.content}>
        <div className={classes.mainCard}>
          <div className={classes.cardContent}>
            {activeView === 'overview' && renderOverview()}
            {activeView === 'guide' && renderGuide()}
          </div>
        </div>
      </div>
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
