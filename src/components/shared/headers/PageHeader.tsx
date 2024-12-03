'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSheetStore } from '@/stores/sheet-store'
import { useViewportSize } from '@mantine/hooks'
import { Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { FC, HTMLAttributes, ReactNode } from 'react'
import IconTitleDescription from '../IconTitleDescription'
import SearchInput from '../inputs/SearchInput'

interface IPageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  icon: ReactNode
  iconWrapper?: string
  title: string
  description: string
  descriptionStyles?: string
}

const PageHeader: FC<IPageHeaderProps> = ({
  className,
  description,
  icon,
  title,
  iconWrapper,
  descriptionStyles,
  children,
}) => {
  const { width } = useViewportSize()
  const t = useTranslations('general')

  const { searchTerm, actions } = useSheetStore((store) => store)
  const { setSearchTerm } = actions

  const pathname = usePathname()
  const isArabic = pathname.includes('/ar')

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className={cn('flex h-16 w-full items-start gap-[1.875rem]', className)}
    >
      <IconTitleDescription
        icon={icon}
        iconWrapper={iconWrapper}
        title={title}
        description={description}
        descriptionStyles={descriptionStyles}
      />
      <div className="flex items-start gap-2 pt-0.5 2xl:gap-6">
        {width < 1536 ? (
          <Button
            variant={'outline'}
            size={'icon_md'}
            className="size-[2.375rem] px-3 py-0 lg:size-11"
          >
            <Search size="16" className="text-foreground" />
          </Button>
        ) : (
          <SearchInput
            value={searchTerm}
            containerStyle="items-end"
            hasIcon
            placeholder={t('search')}
            className="h-11 w-[18.6875rem] rounded-[2.5rem] border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 placeholder:text-zinc-500"
            onChange={(e) => setSearchTerm(e.target.value)}
            onInputClear={() => setSearchTerm('')}
          />
        )}
        <div className="2xl:pt-0.5">{children}</div>
      </div>
    </div>
  )
}

export default PageHeader
