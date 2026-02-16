import React from 'react'
import { Group, Image, Text, Burger, useMantineTheme } from '@mantine/core'
import classes from './Header.module.css'
import { ActionToggle } from './ActionToggle'

interface HeaderProps {
  opened: boolean
  setOpened: (opened: boolean) => void
}

export function Header({ opened, setOpened }: HeaderProps) {
  const theme = useMantineTheme()

  return (
    <header className={classes.header}>
      <div className={classes.logoGroup}>
        <Image
          src='/logo.svg'
          width={28}
          height={28}
          alt={'logo'}
          fit='contain'
          style={{ minWidth: 28, minHeight: 28 }}
        />
        <Text fw={500} style={{ color: 'var(--mantine-color-text)' }}>
          EduTime
        </Text>
      </div>
      <Group gap='sm' className={classes.rightGroup}>
        <ActionToggle />
        <Burger
          opened={opened}
          onClick={() => setOpened(!opened)}
          size='sm'
          color={theme.colors.gray[6]}
          hiddenFrom='md'
        />
      </Group>
    </header>
  )
}
