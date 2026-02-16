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
import { GetStaticPropsContext } from 'next/types'
import { useTranslations } from 'next-intl'
import { EmploymentCategory } from '@/types/globals'

interface CategoryModalProps {
  category: EmploymentCategory
  onSave: (category: EmploymentCategory) => void
  onDelete: (categoryId: number) => void
  onClose: () => void
  opened: boolean
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  category,
  onSave,
  onDelete,
  onClose,
  opened,
}) => {
  const [localCategory, setLocalCategory] = useState<EmploymentCategory>(category)
  const t = useTranslations('Index')
  const [titleError, setTitleError] = useState('')

  useEffect(() => {
    setLocalCategory(category)
  }, [category])

  const handleCategoryChange = (field: keyof EmploymentCategory, value: string | number) => {
    setLocalCategory({ ...localCategory, [field]: value })
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.value.length < 1) {
      setTitleError(t('TitleRequired'))
    } else {
      setTitleError('')
    }
    setLocalCategory({ ...localCategory, title: e.currentTarget.value })
  }

  const handleSave = () => {
    if (localCategory.title.length < 1) {
      setTitleError(t('TitleRequired'))
      return
    }
    onSave(localCategory)
  }

  const handleDelete = () => {
    onDelete(localCategory.id)
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={localCategory.id ? t('editEmployment') : t('additionalCategories')}
      size='md'
      styles={{
        title: {
          color: 'var(--mantine-color-text)',
          fontWeight: 600,
        },
        content: {
          backgroundColor: 'var(--mantine-color-body)',
        },
        header: {
          backgroundColor: 'var(--mantine-color-body)',
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        body: {
          padding: 'var(--mantine-spacing-md)',
        },
      }}
    >
      <Stack gap='md'>
        <TextInput
          value={localCategory.title}
          onChange={handleTitleChange}
          placeholder={t('Title')}
          label={t('Title')}
          error={titleError}
          size='md'
          styles={{
            label: {
              color: 'var(--mantine-color-text)',
            },
          }}
        />
        <TextInput
          value={localCategory.subtitle}
          onChange={(e) => handleCategoryChange('subtitle', e.currentTarget.value)}
          placeholder={t('subtitle')}
          label={t('subtitle')}
          size='md'
          styles={{
            label: {
              color: 'var(--mantine-color-text)',
            },
          }}
        />
        <NumberInput
          value={localCategory.workload}
          onChange={(value) => handleCategoryChange('workload', value || 0)}
          placeholder={t('workload')}
          min={0}
          max={500}
          decimalScale={2}
          label={t('workload')}
          size='md'
          styles={{
            label: {
              color: 'var(--mantine-color-text)',
            },
          }}
        />

        <Center>
          <ColorPicker
            format='rgb'
            value={localCategory.color ?? undefined}
            onChange={(color) => handleCategoryChange('color', color)}
            size='md'
          />
        </Center>

        <Group justify='space-between' mt='md'>
          {localCategory.id && (
            <Button variant='filled' color='red' onClick={handleDelete}>
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

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../../messages/${locale}.json`)).default,
    },
  }
}
