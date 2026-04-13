import { Button, Group, Menu } from '@mantine/core'
import { IconChevronDown, IconDeviceFloppy, IconRepeat } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'
import classes from './SplitButton.module.css'

interface SplitButtonProps {
  onCreate: () => void
  onSaveAndNewTimer: () => void
  onSaveAndContinue: () => void
}

export function SplitButton({ onCreate, onSaveAndNewTimer, onSaveAndContinue }: SplitButtonProps) {
  const t = useTranslations('Index')
  const menuIconColor = 'var(--mantine-color-violet-6)'

  return (
    <Group wrap="nowrap" gap={0}>
      <Button type="button" variant="filled" onClick={onCreate} className={classes.button}>
        {t('create')}
      </Button>
      <Menu transitionProps={{ transition: 'pop' }} position="bottom-end" withinPortal>
        <Menu.Target>
          <Button
            type="button"
            variant="filled"
            className={classes.menuControl}
            aria-label={t('createMenuAriaLabel')}
            px="xs"
          >
            <IconChevronDown size={16} stroke={1.5} />
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            leftSection={<IconRepeat size={16} stroke={1.5} color={menuIconColor} />}
            onClick={onSaveAndNewTimer}
          >
            {t('saveAndNewTimer')}
          </Menu.Item>
          <Menu.Item
            leftSection={<IconDeviceFloppy size={16} stroke={1.5} color={menuIconColor} />}
            onClick={onSaveAndContinue}
          >
            {t('saveAndContinue')}
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  )
}
