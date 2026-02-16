import { useRouter } from 'next/router'
import { PrivacyLayout } from '../PrivacyLayout'
import { privacyMetaDe, tocLinksDe, PrivacyDe } from './PrivacyDe'
import { privacyMetaEn, tocLinksEn, PrivacyEn } from './PrivacyEn'
import { privacyMetaFr, tocLinksFr, PrivacyFr } from './PrivacyFr'

const metaByLocale = {
  de: privacyMetaDe,
  en: privacyMetaEn,
  fr: privacyMetaFr,
}

const tocLinksByLocale = {
  de: tocLinksDe,
  en: tocLinksEn,
  fr: tocLinksFr,
}

const ComponentByLocale = {
  de: PrivacyDe,
  en: PrivacyEn,
  fr: PrivacyFr,
}

/**
 * Privacy policy component that renders the correct language version
 * based on the current locale.
 *
 * To update the privacy policy content, edit the corresponding language file:
 *   - German:  ./PrivacyDe.tsx
 *   - English: ./PrivacyEn.tsx
 *   - French:  ./PrivacyFr.tsx
 */
export function PrivacyContent() {
  const router = useRouter()
  const locale = (router.locale ?? 'de') as keyof typeof metaByLocale
  const meta = metaByLocale[locale] ?? privacyMetaDe
  const tocLinks = tocLinksByLocale[locale] ?? tocLinksDe
  const ContentComponent = ComponentByLocale[locale] ?? PrivacyDe

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
