import { Title, TitleOrder } from '@mantine/core'
import classes from './Legal.module.css'

interface LegalDocumentSectionProps {
  id?: string
  title: string
  order?: 1 | 2 | 3 | 4 | 5
  children: React.ReactNode
}

export function LegalDocumentSection({
  id,
  title,
  order = 2,
  children,
}: LegalDocumentSectionProps) {
  return (
    <div id={id} className={classes.legalSection}>
      <Title order={order as TitleOrder} className={classes.sectionTitle} mb='md'>
        {title}
      </Title>
      <div className={classes.legalSectionBody}>{children}</div>
    </div>
  )
}
