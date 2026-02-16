import { Container, Text, Box, Group, rem } from '@mantine/core'
import { useState } from 'react'
import { IconListSearch } from '@tabler/icons-react'
import type { LegalDocumentMeta } from './types'
import { LegalDocumentHeader } from './LegalDocumentHeader'
import { LegalTranslationDisclaimer } from './LegalTranslationDisclaimer'
import classes from './Legal.module.css'

export interface TocLink {
  id: string
  label: string
  order: 1 | 2 | 3
}

interface PrivacyLayoutProps {
  title: string
  meta: LegalDocumentMeta
  locale: string
  tocLabel: string
  tocLinks: TocLink[]
  children: React.ReactNode
}

export function PrivacyLayout({
  title,
  meta,
  locale,
  tocLabel,
  tocLinks,
  children,
}: PrivacyLayoutProps) {
  const [active, setActive] = useState(0)

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>, index: number) => {
    event.preventDefault()
    const target = document.getElementById(tocLinks[index].id)
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 100,
        behavior: 'smooth',
      })
    }
    setActive(index)
  }

  return (
    <div className={classes.wrapper}>
      <Container size={800} className={classes.inner}>
        <LegalDocumentHeader title={title} meta={meta} />
        <LegalTranslationDisclaimer locale={locale} />
        <div className={classes.tableOfContents}>
          <Group mb='md'>
            <IconListSearch size='1.1rem' stroke={1.5} />
            <Text>{tocLabel}</Text>
          </Group>
          <div className={classes.links}>
            <div
              className={classes.indicator}
              style={{ transform: `translateY(${rem(active * 38 + 14)})` }}
            />
            {tocLinks.map((item, index) => (
              <Box<'a'>
                component='a'
                href={`#${item.id}`}
                onClick={(event) => handleClick(event, index)}
                key={item.id}
                className={`${classes.link} ${active === index ? classes.linkActive : ''}`}
                style={{ paddingLeft: `calc(${item.order} * var(--mantine-spacing-lg))` }}
              >
                {item.label}
              </Box>
            ))}
          </div>
        </div>
        <div className={classes.content}>{children}</div>
      </Container>
    </div>
  )
}
