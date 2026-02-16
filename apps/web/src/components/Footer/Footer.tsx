import { Container, Group, Anchor, rem, useMantineTheme } from '@mantine/core'
import { useTranslations } from 'next-intl'
import LocaleSwitcher from '../Settings/LocaleSwitcher'
import Link from 'next/link'
import classes from './Footer.module.css'

export function Footer() {
  const t = useTranslations('Index')
  const theme = useMantineTheme()

  const links = [
    { link: '/docs/privacy', label: t('privacy') },
    { link: '/docs/terms', label: t('termsOfService') },
    { link: '/docs/agb', label: 'AGB' },
    { link: '/docs/imprint', label: t('imprint') },
  ]

  const items = links.map((link) => (
    <Link key={link.label} href={link.link} className={classes.link}>
      {link.label}
    </Link>
  ))

  return (
    <div
      style={{
        width: '100%',
        backgroundColor: 'light-dark(var(--mantine-color-white), var(--mantine-color-dark-7))',
      }}
    >
      <Container className={classes.inner}>
        <Group className={classes.links}>{items}</Group>
        <LocaleSwitcher userData={null} />
      </Container>
    </div>
  )
}
