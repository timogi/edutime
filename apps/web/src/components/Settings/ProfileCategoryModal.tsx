import React, { useState, useEffect } from 'react'
import {
  Stack,
  Button,
  Modal,
  TextInput,
  ColorPicker,
  Group,
  NumberInput,
  Center,
} from '@mantine/core'
import { useTranslations } from 'next-intl'
import { ProfileCategoryData } from '@edutime/shared'

interface ProfileCategoryModalProps {
  category: ProfileCategoryData | null
  onSave: (category: ProfileCategoryData) => void
  onDelete?: () => void
  onClose: () => void
  opened: boolean
}

const DEFAULT_CATEGORY: ProfileCategoryData = {
  id: '',
  title: '',
  color: 'rgb(132, 94, 247)',
  weight: 0,
  order: null,
  config_profile_id: '',
}

export const ProfileCategoryModal: React.FC<ProfileCategoryModalProps> = ({
  category,
  onSave,
  onDelete,
  onClose,
  opened,
}) => {
  const [local, setLocal] = useState<ProfileCategoryData>(category ?? DEFAULT_CATEGORY)
  const [titleError, setTitleError] = useState('')
  const t = useTranslations('Index')

  useEffect(() => {
    setLocal(category ?? DEFAULT_CATEGORY)
    setTitleError('')
  }, [category, opened])

  const handleSave = () => {
    if (local.title.length < 1) {
      setTitleError(t('TitleRequired'))
      return
    }
    onSave(local)
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={category ? t('editCategory') : t('createCategory')}
      size='md'
      styles={{
        title: { color: 'var(--mantine-color-text)', fontWeight: 600 },
        content: { backgroundColor: 'var(--mantine-color-body)' },
        header: { backgroundColor: 'var(--mantine-color-body)' },
        overlay: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
        body: { padding: 'var(--mantine-spacing-md)' },
      }}
    >
      <Stack gap='md'>
        <TextInput
          value={local.title}
          onChange={(e) => {
            const v = e.currentTarget.value
            setTitleError(v.length < 1 ? t('TitleRequired') : '')
            setLocal({ ...local, title: v })
          }}
          placeholder={t('Title')}
          label={t('Title')}
          error={titleError}
          size='md'
        />
        <NumberInput
          value={local.weight}
          onChange={(value) => setLocal({ ...local, weight: typeof value === 'number' ? value : 0 })}
          placeholder={t('weight')}
          min={0}
          max={100}
          decimalScale={2}
          label={`${t('weight')} (%)`}
          size='md'
        />

        <Center>
          <ColorPicker
            format='rgb'
            value={local.color}
            onChange={(color) => setLocal({ ...local, color })}
            size='md'
          />
        </Center>

        <Group justify='space-between' mt='md'>
          {onDelete && (
            <Button variant='filled' color='red' onClick={onDelete}>
              {t('delete')}
            </Button>
          )}
          <Button variant='filled' onClick={handleSave}>
            {t('save')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
