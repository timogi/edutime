import { Select, SelectProps } from '@mantine/core'
import { useTranslations } from 'next-intl'

interface CantonPickerProps extends Omit<SelectProps, 'data' | 'value' | 'onChange'> {
  canton: string | null
  setCanton: (canton: string | null) => void
  required?: boolean
}

export function CantonPicker({ canton, setCanton, required, ...props }: CantonPickerProps) {
  const t = useTranslations('Cantons')
  const data = [
    { label: t('bern'), value: 'BE' },
    { label: t('st-gallen'), value: 'SG' },
    { label: t('aargau'), value: 'AG' },
    { label: t('thurgau_study'), value: 'TG_S', disabled: false },
  ]
  return (
    <Select
      label={props.label ?? t('label')}
      placeholder={props.placeholder ?? t('placeholder')}
      data={data}
      value={canton}
      onChange={setCanton}
      searchable={props.searchable ?? true}
      maxDropdownHeight={props.maxDropdownHeight ?? 400}
      required={required}
      size={props.size ?? 'md'}
      {...props}
    />
  )
}
