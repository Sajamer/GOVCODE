'use client'

import { usePathname, useRouter } from '@/i18n/routing'
import { cn } from '@/lib/utils'
import { useSearchParams } from 'next/navigation'
import { ChangeEvent, FC, ReactNode, useTransition } from 'react'

interface ILocaleSwitcherSelectProps {
  children: ReactNode
  defaultValue: string
  label: string
}

const LocaleSwitcherSelect: FC<ILocaleSwitcherSelectProps> = ({
  children,
  defaultValue,
  label,
}) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function onSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value

    startTransition(() => {
      // Preserve search parameters when changing locale
      const searchString = searchParams.toString()
      const fullPath = searchString ? `${pathname}?${searchString}` : pathname

      router.replace(fullPath, { locale: nextLocale })
    })
  }

  return (
    <label
      className={cn(
        'relative text-gray-400',
        isPending && 'transition-opacity [&:disabled]:opacity-30',
      )}
    >
      <p className="sr-only">{label}</p>
      <select
        className="inline-flex cursor-pointer appearance-none bg-transparent py-3 pl-2 pr-6 focus-visible:border-none"
        defaultValue={defaultValue}
        disabled={isPending}
        onChange={onSelectChange}
      >
        {children}
      </select>
    </label>
  )
}

export default LocaleSwitcherSelect
