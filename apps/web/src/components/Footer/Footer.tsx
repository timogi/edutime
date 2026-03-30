import { Container, Group, Anchor } from '@mantine/core'
import { useTranslations } from 'next-intl'
import LocaleSwitcher from '../Settings/LocaleSwitcher'
import Link from 'next/link'
import { useRouter } from 'next/router'
import classes from './Footer.module.css'

const CONTACT_MAIL = 'info@edutime.ch'

export function Footer() {
  const t = useTranslations('Index')
  const router = useRouter()
  const isHomePage = router.pathname === '/'

  const internalLinks = [
    { href: '/docs/privacy', label: t('privacy') },
    { href: '/docs/terms', label: t('termsOfService') },
    { href: '/docs/imprint', label: t('imprint') },
  ]

  const items = [
    ...internalLinks.map(({ href, label }) => (
      <Link key={href} href={href} className={classes.link}>
        {label}
      </Link>
    )),
    ...(!isHomePage
      ? [
          <Anchor key='contact' href={`mailto:${CONTACT_MAIL}`} className={classes.link}>
            {t('footer-contact-mail')}
          </Anchor>,
        ]
      : []),
  ]

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
