import { useRouter } from 'next/router'
import { PrivacyLayout } from '../PrivacyLayout'
import { termsMetaDe, tocLinksDe, TermsDe } from './TermsDe'
import { termsMetaEn, tocLinksEn, TermsEn } from './TermsEn'
import { termsMetaFr, tocLinksFr, TermsFr } from './TermsFr'

const metaByLocale = {
  de: termsMetaDe,
  en: termsMetaEn,
  fr: termsMetaFr,
}

const tocLinksByLocale = {
  de: tocLinksDe,
  en: tocLinksEn,
  fr: tocLinksFr,
}

const ComponentByLocale = {
  de: TermsDe,
  en: TermsEn,
  fr: TermsFr,
}

/**
 * Terms of use component that renders the correct language version
 * based on the current locale.
 *
 * To update the terms content, edit the corresponding language file:
 *   - German:  ./TermsDe.tsx
 *   - English: ./TermsEn.tsx
 *   - French:  ./TermsFr.tsx
 */
export function TermsContent() {
  const router = useRouter()
  const locale = (router.locale ?? 'de') as keyof typeof metaByLocale
  const meta = metaByLocale[locale] ?? termsMetaDe
  const tocLinks = tocLinksByLocale[locale] ?? tocLinksDe
  const ContentComponent = ComponentByLocale[locale] ?? TermsDe

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
