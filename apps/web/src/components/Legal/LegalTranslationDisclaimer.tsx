import { Text, Group, Anchor } from '@mantine/core'
import { IconInfoCircle } from '@tabler/icons-react'
import { useRouter } from 'next/router'
import classes from './Legal.module.css'

interface DisclaimerTexts {
  notice: string
  body: string
  linkLabel: string
}

const disclaimerByLocale: Record<string, DisclaimerTexts> = {
  en: {
    notice: 'Translation Notice',
    body: 'This document is a convenience translation of the original German version. Only the German text is legally binding. In case of any discrepancies, the German version shall prevail.',
    linkLabel: 'View the original German version',
  },
  fr: {
    notice: 'Avis de traduction',
    body: 'Le présent document est une traduction de courtoisie de la version originale en allemand. Seul le texte allemand fait foi. En cas de divergence, la version allemande prévaut.',
    linkLabel: 'Voir la version originale en allemand',
  },
}

interface LegalTranslationDisclaimerProps {
  locale: string
}

export function LegalTranslationDisclaimer({ locale }: LegalTranslationDisclaimerProps) {
  const router = useRouter()

  if (locale === 'de') return null

  const texts = disclaimerByLocale[locale] ?? disclaimerByLocale.en
  const germanPath = `/de${router.pathname}`

  return (
    <div className={classes.disclaimerBanner}>
      <Group gap='xs' mb={4}>
        <IconInfoCircle size='1rem' stroke={1.5} color='var(--mantine-color-violet-6)' />
        <Text size='sm' fw={600} c='violet.7'>
          {texts.notice}
        </Text>
      </Group>
      <Text size='xs' c='dimmed'>
        {texts.body}{' '}
        <Anchor href={germanPath} size='xs'>
          {texts.linkLabel}
        </Anchor>
      </Text>
    </div>
  )
}
