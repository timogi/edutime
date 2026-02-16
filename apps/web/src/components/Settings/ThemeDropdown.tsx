import React, { useEffect } from 'react'
import { Select, useMantineColorScheme } from '@mantine/core'
import { IconMoon, IconSun } from '@tabler/icons-react'
import { GetStaticPropsContext } from 'next'
import { useTranslations } from 'next-intl'
import { updateUserData } from '@/utils/supabase/user'
import { UserData } from '@/types/globals'

interface ThemeDropdownProps {
  userData: UserData
  refreshUserData: () => void
}

export function ThemeDropdown({ userData, refreshUserData }: ThemeDropdownProps) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const t = useTranslations('Index')

  const setUserDataDarkMode = async (isDarkMode: boolean) => {
    await updateUserData({ is_mode_dark: isDarkMode }, userData.user_id)
  }

  const handleChange = async (value: string | null) => {
    if (value && value !== colorScheme) {
      // Update the database first
      await setUserDataDarkMode(value === 'dark')
      // Then toggle the theme
      toggleColorScheme()
      // Finally refresh user data to sync
      refreshUserData()
    }
  }

  return (
    <Select
      aria-label='Select theme'
      label={t('theme')}
      value={colorScheme}
      onChange={handleChange}
      data={[
        { value: 'light', label: t('light') },
        { value: 'dark', label: t('dark') },
      ]}
      styles={{
        section: { pointerEvents: 'none' },
        option: {
          backgroundColor: 'var(--mantine-color-body)',
        },
        dropdown: {
          backgroundColor: 'var(--mantine-color-body)',
        },
      }}
      size='md'
    />
  )
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../../messages/${locale}.json`)).default,
    },
  }
}
