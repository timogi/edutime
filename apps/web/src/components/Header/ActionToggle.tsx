import { IconMoon, IconSun } from '@tabler/icons-react'
import { ActionIcon, type ActionIconProps } from '@mantine/core'
import { useThemeToggle } from '@/hooks/useThemeToggle'
import { useSyncExternalStore } from 'react'
import { useTranslations } from 'next-intl'
import classes from './ActionToggle.module.css'

const emptySubscribe = () => () => {}

export interface ActionToggleProps {
  /** @default 'xl' — use `md` in nav/footer so it matches surrounding UI */
  size?: ActionIconProps['size']
}

export function ActionToggle({ size = 'xl' }: ActionToggleProps) {
  const t = useTranslations('Index')
  const { colorScheme, toggleTheme } = useThemeToggle()
  const ariaLabel = t('theme-toggle-aria')
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )

  // Show a placeholder during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <ActionIcon
        variant='default'
        size={size}
        radius='md'
        aria-label={ariaLabel}
        style={{ visibility: 'hidden' }}
      >
        <IconSun className={classes.icon} stroke={1.5} />
      </ActionIcon>
    )
  }

  return (
    <ActionIcon
      onClick={toggleTheme}
      variant='default'
      size={size}
      radius='md'
      aria-label={ariaLabel}
    >
      {colorScheme === 'light' ? (
        <IconMoon className={classes.icon} stroke={1.5} />
      ) : (
        <IconSun className={classes.icon} stroke={1.5} />
      )}
    </ActionIcon>
  )
}
