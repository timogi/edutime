import { IconMoon, IconSun } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'
import clsx from 'clsx'
import { useThemeToggle } from '@/hooks/useThemeToggle'
import classes from './ThemeNavItem.module.css'

export interface ThemeNavItemProps {
  variant: 'navbar' | 'footer'
}

/** Theme as a normal nav row, not an icon-only ActionIcon. */
export function ThemeNavItem({ variant }: ThemeNavItemProps) {
  const t = useTranslations('Index')
  const { toggleTheme, isDark } = useThemeToggle()

  return (
    <div
      className={clsx(classes.root, variant === 'navbar' ? classes.rootNavbar : classes.rootFooter)}
      role='button'
      tabIndex={0}
      onClick={() => void toggleTheme()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          void toggleTheme()
        }
      }}
    >
      {isDark ? (
        <IconSun className={classes.icon} stroke={1.5} />
      ) : (
        <IconMoon className={classes.icon} stroke={1.5} />
      )}
      <span className={classes.title}>{t('changeTheme')}</span>
    </div>
  )
}
