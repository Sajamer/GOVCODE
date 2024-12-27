'use client'

import { Icons } from '@/components/icons/Icons'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useSheetStore, type SheetNames } from '@/stores/sheet-store'
import { usePathname } from 'next/navigation'
import { FC, HTMLAttributes } from 'react'

export interface ISheetComponentProps extends HTMLAttributes<HTMLDivElement> {
  isTableHeader?: boolean
  isTableFooter?: boolean
  title: string
  subtitle: string
  saveButtonName?: string
  customizeTrigger?: JSX.Element
  isLoading?: boolean
  submit?: () => void
  sheetName?: SheetNames
}

const SheetComponent: FC<ISheetComponentProps> = ({
  title,
  sheetName,
  subtitle,
  className,
  children,
}) => {
  const { actions, sheetToOpen } = useSheetStore((store) => store)
  const isArabic = usePathname().includes('/ar')

  return (
    <Sheet open={sheetName === sheetToOpen} onOpenChange={actions.closeSheet}>
      <SheetContent
        side={isArabic ? 'left' : 'right'}
        dir={isArabic ? 'rtl' : 'ltr'}
        hideClose
        className={cn(
          'sm:my-auto sm:mr-[1.88rem] sm:max-h-[calc(100%-3.76rem)] sm:rounded-[1.875rem] bg-zinc-50 w-full max-w-[31.25rem] sm:min-w-[31.25rem]',
          className,
        )}
      >
        <SheetTitle className="sr-only">Sheet</SheetTitle>
        <SheetDescription className="sr-only">
          Sheet Description
        </SheetDescription>
        <div className="relative size-full">
          <div
            className={cn(
              'absolute top-0 flex w-full items-center justify-end',
            )}
          >
            <SheetClose>
              <Icons.SheetCircleClose className="size-6 min-h-6 min-w-6 text-zinc-800" />
            </SheetClose>
          </div>

          <div className="mb-6 flex min-h-[4.6875rem] w-full flex-col gap-[0.06rem] border-b border-zinc-100">
            <div className="line-clamp-1 max-w-full break-words text-2xl font-medium text-zinc-900">
              {title}
            </div>
            <div className="max-w-full break-words text-sm text-zinc-500">
              {subtitle}
            </div>
          </div>
          <div className="flex size-full max-h-[calc(100%-5.88rem)] flex-col justify-between">
            {children}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default SheetComponent
