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
    // { label: t('zurich'), value: 'ZH', disabled: true },
    // { label: t('luzern'), value: 'LU', disabled: true },
    // { label: t('uri'), value: 'UR', disabled: true },
    // { label: t('schwyz'), value: 'SZ', disabled: true },
    // { label: t('obwalden'), value: 'OW', disabled: true },
    // { label: t('nidwalden'), value: 'NW', disabled: true },
    // { label: t('glarus'), value: 'GL', disabled: true },
    // { label: t('zug'), value: 'ZG', disabled: true },
    // { label: t('freiburg'), value: 'FR', disabled: true },
    // { label: t('solothurn'), value: 'SO', disabled: true },
    // { label: t('basel-stadt'), value: 'BS', disabled: true },
    // { label: t('basel-landschaft'), value: 'BL', disabled: true },
    // { label: t('schaffhausen'), value: 'SH', disabled: true },
    // { label: t('appenzell-ausserrhoden'), value: 'AR', disabled: true },
    // { label: t('appenzell-innerrhoden'), value: 'AI', disabled: true },
    // { label: t('graubunden'), value: 'GR', disabled: true },
    // { label: t('thurgau'), value: 'TG', disabled: true },
    // { label: t('tessin'), value: 'TI', disabled: true },
    // { label: t('waadt'), value: 'VD', disabled: true },
    // { label: t('wallis'), value: 'VS', disabled: true },
    // { label: t('neuenburg'), value: 'NE', disabled: true },
    // { label: t('genf'), value: 'GE', disabled: true },
    // { label: t('jura'), value: 'JU', disabled: true },
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
