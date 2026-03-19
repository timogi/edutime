import { useRouter } from 'next/router'
import { PrivacyLayout } from '../PrivacyLayout'
import { avvMetaDe, tocLinksDe, AVVDe } from './AVVDe'
import { avvMetaEn, tocLinksEn, AVVEn } from './AVVEn'
import { avvMetaFr, tocLinksFr, AVVFr } from './AVVFr'

const metaByLocale = {
  de: avvMetaDe,
  en: avvMetaEn,
  fr: avvMetaFr,
}

const tocLinksByLocale = {
  de: tocLinksDe,
  en: tocLinksEn,
  fr: tocLinksFr,
}

const componentByLocale = {
  de: AVVDe,
  en: AVVEn,
  fr: AVVFr,
}

export function AVVContent() {
  const router = useRouter()
  const locale = (router.locale ?? 'de') as keyof typeof metaByLocale
  const meta = metaByLocale[locale] ?? avvMetaDe
  const tocLinks = tocLinksByLocale[locale] ?? tocLinksDe
  const ContentComponent = componentByLocale[locale] ?? AVVDe

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
