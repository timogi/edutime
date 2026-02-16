import { Button, Menu, Group, ActionIcon, rem } from '@mantine/core'
import { IconChevronDown, IconRepeat, IconDeviceFloppy } from '@tabler/icons-react'
import { GetStaticPropsContext } from 'next'
import { useTranslations } from 'next-intl'
import classes from './SplitButton.module.css'

interface SplitButtonProps {
  onCreate: () => void
  onSaveAndNewTimer: () => void
  onSaveAndContinue: () => void
}

export function SplitButton({ onCreate, onSaveAndNewTimer, onSaveAndContinue }: SplitButtonProps) {
  const menuIconColor = 'var(--mantine-color-violet-6)'
  const t = useTranslations('Index')

  return (
    <Group wrap='nowrap' gap={0}>
      <Button onClick={onCreate} className={classes.button}>
        {t('create')}
      </Button>
      <Menu transitionProps={{ transition: 'pop' }} position='bottom-end'>
        <Menu.Target>
          <ActionIcon variant='filled' color='violet' size={36} className={classes.menuControl}>
            <IconChevronDown size='1rem' stroke={1.5} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            leftSection={<IconRepeat size='1rem' stroke={1.5} color={menuIconColor} />}
            onClick={onSaveAndNewTimer}
          >
            {t('saveAndNewTimer')}
          </Menu.Item>
          <Menu.Item
            leftSection={<IconDeviceFloppy size='1rem' stroke={1.5} color={menuIconColor} />}
            onClick={onSaveAndContinue}
          >
            {t('saveAndContinue')}
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  )
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../../messages/${locale}.json`)).default,
    },
  }
}
