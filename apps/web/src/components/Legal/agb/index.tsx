import { useRouter } from 'next/router'
import { PrivacyLayout } from '../PrivacyLayout'
import { agbMetaDe, tocLinksDe, AGBDe } from './AGBDe'
import { agbMetaEn, tocLinksEn, AGBEn } from './AGBEn'
import { agbMetaFr, tocLinksFr, AGBFr } from './AGBFr'

const metaByLocale = {
  de: agbMetaDe,
  en: agbMetaEn,
  fr: agbMetaFr,
}

const tocLinksByLocale = {
  de: tocLinksDe,
  en: tocLinksEn,
  fr: tocLinksFr,
}

const ComponentByLocale = {
  de: AGBDe,
  en: AGBEn,
  fr: AGBFr,
}

/**
 * AGB (SaaS Terms and Conditions) component that renders the correct
 * language version based on the current locale.
 *
 * To update the AGB content, edit the corresponding language file:
 *   - German:  ./AGBDe.tsx
 *   - English: ./AGBEn.tsx
 *   - French:  ./AGBFr.tsx
 */
export function AGBContent() {
  const router = useRouter()
  const locale = (router.locale ?? 'de') as keyof typeof metaByLocale
  const meta = metaByLocale[locale] ?? agbMetaDe
  const tocLinks = tocLinksByLocale[locale] ?? tocLinksDe
  const ContentComponent = ComponentByLocale[locale] ?? AGBDe

  return (
    <PrivacyLayout
      title={meta.title}
      tocLabel={meta.tocLabel}
      meta={meta.meta}
      tocLinks={tocLinks}
      locale={locale}
    >
      <ContentComponent />
    </PrivacyLayout>
  )
}
