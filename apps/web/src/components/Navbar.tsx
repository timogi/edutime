import { AppShell, Group, rem, Tooltip, Loader } from '@mantine/core'
import {
  IconSettings,
  IconLogout,
  IconClock,
  IconUserCircle,
  IconChartDots,
  IconCalendar,
  IconUsers,
  IconHelpHexagon,
} from '@tabler/icons-react'
import { supabase } from '@/utils/supabase/client'
import { useTranslations } from 'next-intl'
import { GetStaticPropsContext } from 'next'
import { useRouter } from 'next/router'
import { useMediaQuery } from '@mantine/hooks'
import { Organization, UserData } from '@/types/globals'
import classes from './Navbar.module.css'

interface AppNavbarProps {
  currentView: string
  subscriptionActive: boolean
  loaded: boolean
  userData: UserData | null
  organizations: Organization[]
}

export function AppNavbar({
  currentView,
  subscriptionActive,
  loaded,
  userData,
  organizations,
}: AppNavbarProps) {
  const t = useTranslations('Index')
  const router = useRouter()

  const isSmallScreen = useMediaQuery('(max-width: 768px)')

  const data = [
    {
      view: 'time-tracking',
      label: t('time-recording'),
      icon: IconClock,
      isMembershipRequired: true,
    },
    { view: 'calendar', label: t('calendar'), icon: IconCalendar, isMembershipRequired: true },
    { view: 'statistics', label: t('statistics'), icon: IconChartDots, isMembershipRequired: true },

    {
      view: 'informations',
      label: t('informations'),
      icon: IconHelpHexagon,
      isMembershipRequired: false,
    },
  ]

  if (organizations.length > 0) {
    data.push({
      view: 'members',
      label: t('members'),
      icon: IconUsers,
      isMembershipRequired: false,
    })
  }

  const links = data.map((item) => (
    <Tooltip
      c='gray'
      label={item.isMembershipRequired && !subscriptionActive ? t('membership_required') : ''}
      key={item.label}
      position='left'
      withArrow
      disabled={!item.isMembershipRequired || subscriptionActive}
    >
      <div
        className={`${classes.link} ${item.view === currentView ? classes.linkActive : ''} ${item.isMembershipRequired && !subscriptionActive ? classes.linkDisabled : ''}`}
        key={item.label}
        onClick={(event) => {
          event.preventDefault()
          if (item.isMembershipRequired && !subscriptionActive) {
            return
          }
          router.push(`/app/${item.view}`)
        }}
      >
        <item.icon className={classes.linkIcon} stroke={1.5} />
        <span>{item.label}</span>
      </div>
    </Tooltip>
  ))

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        {loaded ? (
          links
        ) : (
          <Group justify='center' mt={'xl'}>
            <Loader size={'md'} />
          </Group>
        )}
      </div>

      <div className={classes.footer}>
        <div
          className={`${classes.link} ${'settings' === currentView ? classes.linkActive : ''}`}
          onClick={(event) => {
            event.preventDefault()
            router.push('/app/settings')
          }}
        >
          <IconSettings className={classes.linkIcon} stroke={1.5} />
          <span>{t('settings')}</span>
        </div>

        <div
          className={classes.link}
          onClick={(event) => {
            event.preventDefault()
            supabase.auth.signOut({ scope: 'local' })
            router.push('/login')
          }}
        >
          <IconLogout className={classes.linkIcon} stroke={1.5} />
          <span>{t('logout')}</span>
        </div>
      </div>
    </nav>
  )
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../messages/${locale}.json`)).default,
    },
  }
}
