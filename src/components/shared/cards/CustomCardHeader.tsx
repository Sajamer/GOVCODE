'use client'

import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FC } from 'react'
import BasicDropdown from '../dropdowns/BasicDropdown'
import { useTranslations } from 'next-intl'

interface ICustomCardHeaderProps {
  title: string
  description?: string
  year: string
  callback: (option: IDropdown) => void
}

const CustomCardHeader: FC<ICustomCardHeaderProps> = ({
  title,
  description,
  year,
  callback,
}) => {
  const t = useTranslations('general')
  const currentYear = new Date().getFullYear()

  const yearOptions = Array.from({ length: 7 }, (_, i) => {
    const year = currentYear - 2 + i
    return { id: String(year), label: String(year), value: String(year) }
  })

  const localizedYearOptions = yearOptions.map((option) => ({
    ...option,
    label: t(`year-options.${option.label}`),
  }))

  return (
    <CardHeader>
      <div className="flex w-full items-start justify-between gap-2">
        <div className="flex w-full flex-col items-start gap-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description} </CardDescription>
        </div>
        <BasicDropdown
          data={localizedYearOptions ?? []}
          triggerStyle="h-11 justify-end"
          wrapperStyle="w-28"
          containerStyle="max-w-28 w-full"
          defaultValue={localizedYearOptions?.find(
            (option) => option.id === year,
          )}
          callback={callback}
        />
      </div>
    </CardHeader>
  )
}

export default CustomCardHeader
