import { Group, Tooltip, Loader } from '@mantine/core'
import {
  IconSettings,
  IconLogout,
  IconClock,
  IconChartDots,
  IconCalendar,
  IconUsers,
  IconHelpHexagon,
} from '@tabler/icons-react'
import { supabase } from '@/utils/supabase/client'
import { useTranslations } from 'next-intl'
import { GetStaticPropsContext } from 'next'
import { useRouter } from 'next/router'
import { Organization, UserData } from '@/types/globals'
import { ThemeNavItem } from '@/components/Header/ThemeNavItem'
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
  userData: _userData,
  organizations,
}: AppNavbarProps) {
  const t = useTranslations('Index')
  const router = useRouter()

  type NavItem = {
    view: string
    label: string
    icon: typeof IconClock
    isMembershipRequired: boolean
  }

  const primaryData: NavItem[] = [
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

  const orgAdminData: NavItem[] =
    organizations.length > 0
      ? [
          {
            view: 'members',
            label: t('members'),
            icon: IconUsers,
            isMembershipRequired: false,
          },
          {
            view: 'organization-management',
            label: t('Organization Management'),
            icon: IconSettings,
            isMembershipRequired: false,
          },
        ]
      : []

  const renderLinks = (items: NavItem[]) =>
    items.map((item) => {
      const tooltipLabel = item.isMembershipRequired && !subscriptionActive ? t('membership_required') : ''
      return (
        <Tooltip
          c='gray'
          label={tooltipLabel}
          key={item.view}
          position='left'
          withArrow
          disabled={!tooltipLabel}
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
      )
    })

  const links = renderLinks(primaryData)

  const orgAdminLinks = renderLinks(orgAdminData)

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        {loaded ? (
          <>
            {links}
            {orgAdminLinks.length > 0 ? (
              <div className={classes.section}>
                <div className={classes.sectionHeader}>
                  <div className={classes.sectionTitle}>{t('org-admin-section-title')}</div>
                </div>
                {orgAdminLinks}
              </div>
            ) : null}
          </>
        ) : (
          <Group justify='center' mt={'xl'}>
            <Loader size={'md'} />
          </Group>
        )}
      </div>

      <div className={classes.footer}>
        <ThemeNavItem variant='navbar' />
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
