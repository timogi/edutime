import React from 'react'
import { Container, Title, Text, Stack, Image, Flex } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { useMediaQuery } from '@mantine/hooks'
import classes from './PartnerOrganizations.module.css'

export function PartnerOrganizations() {
  const t = useTranslations('PartnerOrganizations')
  const isSmallScreen = useMediaQuery('(max-width: 768px)')

  const partners = [
    {
      name: 'Bildung Aargau',
      logo: '/bildung_aargau.png',
      cardClass: classes.partnerCardWhite,
    },
    {
      name: 'Bildung Bern',
      logo: '/bildung_bern.png',
      cardClass: classes.partnerCardBlack,
    },
    {
      name: 'Bildung St. Gallen',
      logo: '/klv_sg.svg',
      cardClass: classes.partnerCardStGallen,
    },
  ]

  return (
    <div className={classes.wrapper}>
      <Container size={1100} className={classes.inner}>
        <Stack gap='xl' ta='center'>
          <div>
            <Title order={2} mb='md'>
              {t('title')}
            </Title>
            <Text size='lg' c='dimmed' maw={700} mx='auto'>
              {t('description')}
            </Text>
          </div>

          <Flex
            direction={isSmallScreen ? 'column' : 'row'}
            gap='xl'
            justify='center'
            align='center'
            wrap='wrap'
          >
            {partners.map((partner) => (
              <div key={partner.name} className={partner.cardClass || classes.partnerCard}>
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  className={classes.logo}
                  fallbackSrc='/logo.svg'
                />
              </div>
            ))}
          </Flex>
        </Stack>
      </Container>
    </div>
  )
}
