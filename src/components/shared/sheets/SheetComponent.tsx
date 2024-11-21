'use client'

import { Icons } from '@/components/icons/Icons'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useSheetStore, type SheetNames } from '@/stores/sheet-store'
import { FC, HTMLAttributes } from 'react'

export interface ISheetComponentProps extends HTMLAttributes<HTMLDivElement> {
  isTableHeader?: boolean
  isTableFooter?: boolean
  breadcrumb?: string[]
  title: string
  subtitle: string
  saveButtonName?: string
  customizeTrigger?: JSX.Element
  isLoading?: boolean
  submit?: () => void
  sheetName?: SheetNames
}

const SheetComponent: FC<ISheetComponentProps> = ({
  breadcrumb = [],
  title,
  sheetName,
  subtitle,
  className,
  children,
}) => {
  const hasBreadcrumb = breadcrumb.length > 0

  const { actions, sheetToOpen } = useSheetStore((store) => store)
  return (
    <Sheet open={sheetName === sheetToOpen} onOpenChange={actions.closeSheet}>
      <SheetContent
        hideClose
        className={cn(
          'sm:my-auto sm:mr-[1.88rem] sm:max-h-[calc(100%-3.76rem)] sm:rounded-[1.875rem] bg-zinc-50 w-full max-w-[31.25rem] sm:min-w-[31.25rem]',
          className,
        )}
      >
        <SheetTitle className="sr-only">Sheet</SheetTitle>
        <div className="relative size-full pt-[3.125rem]">
          <div
            className={cn(
              'absolute top-0 flex w-full items-center',
              hasBreadcrumb ? 'justify-between' : 'justify-end',
            )}
          >
            {hasBreadcrumb && (
              <div className="line-clamp-1 text-xs font-normal text-zinc-500">
                {breadcrumb.map((item, index) => (
                  <span key={index}>
                    {item}
                    {index < breadcrumb.length - 1 && (
                      <span className="mx-[0.38rem]">&gt;</span>
                    )}
                  </span>
                ))}
              </div>
            )}
            <SheetClose>
              <Icons.SheetCircleClose className="size-6 min-h-6 min-w-6 text-zinc-800" />
            </SheetClose>
          </div>

          <div className="mb-6 flex min-h-[4.6875rem] w-full flex-col gap-[0.06rem] border-b border-zinc-100">
            <div className="line-clamp-1 max-w-full break-words text-2xl font-medium text-zinc-900">
              {title}
            </div>
            <div className="line-clamp-1 max-w-full break-words text-sm text-zinc-500">
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
