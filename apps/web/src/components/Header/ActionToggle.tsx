import { IconMoon, IconSun } from '@tabler/icons-react'
import { ActionIcon } from '@mantine/core'
import { useThemeToggle } from '@/hooks/useThemeToggle'
import { useSyncExternalStore } from 'react'
import classes from './ActionToggle.module.css'

const emptySubscribe = () => () => {}

export function ActionToggle() {
  const { colorScheme, toggleTheme } = useThemeToggle()
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
        size='xl'
        radius='md'
        aria-label='Toggle color scheme'
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
      size='xl'
      radius='md'
      aria-label='Toggle color scheme'
    >
      {colorScheme === 'light' ? (
        <IconMoon className={classes.icon} stroke={1.5} />
      ) : (
        <IconSun className={classes.icon} stroke={1.5} />
      )}
    </ActionIcon>
  )
}
