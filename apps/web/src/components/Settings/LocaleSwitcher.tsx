import { useRouter } from 'next/router'
import { Select } from '@mantine/core'
import { GetStaticPropsContext } from 'next'
import { useTranslations } from 'next-intl'
import { updateUserData } from '@/utils/supabase/user'
import { useState } from 'react'
import { UserData } from '@/types/globals'

interface LocaleSwitcherProps {
  userData: UserData | null
}

export default function LocaleSwitcher({ userData }: LocaleSwitcherProps) {
  const router = useRouter()
  const { locale, locales, route } = router
  const t = useTranslations('Index')
  const [selectedLocale, setSelectedLocale] = useState<string | undefined>(locale)

  const handleLocaleChange = async (value: string | null) => {
    const newLocale = value ?? undefined

    if (newLocale !== locale) {
      if (userData) {
        await updateUserData({ language: newLocale }, userData.user_id)
      }

      setSelectedLocale(newLocale)
      router.push(route, route, { locale: newLocale })
    }
  }

  const localeMap: { [key: string]: string } = {
    en: t('english'),
    de: t('german'),
    fr: t('french'),
  }

  if (!locales) {
    return null
  }

  return (
    <Select
      value={selectedLocale}
      onChange={handleLocaleChange}
      data={locales.map((loc) => ({ value: loc, label: localeMap[loc] }))}
      size='md'
    />
  )
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const messages = await import(`../../../messages/${locale}.json`)
  return {
    props: {
      messages: messages.default,
    },
  }
}
