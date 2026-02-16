import { Container } from '@mantine/core'
import type { LegalDocumentMeta } from './types'
import { LegalDocumentHeader } from './LegalDocumentHeader'
import { LegalTranslationDisclaimer } from './LegalTranslationDisclaimer'
import classes from './Legal.module.css'

interface LegalDocumentLayoutProps {
  title: string
  meta: LegalDocumentMeta
  locale: string
  children: React.ReactNode
}

export function LegalDocumentLayout({ title, meta, locale, children }: LegalDocumentLayoutProps) {
  return (
    <div className={classes.wrapper}>
      <Container size={800} className={classes.inner}>
        <LegalDocumentHeader title={title} meta={meta} />
        <LegalTranslationDisclaimer locale={locale} />
        <div className={classes.content}>{children}</div>
      </Container>
    </div>
  )
}
