'use client'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { FC } from 'react'

interface ITooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: 'left' | 'right' | 'top' | 'bottom'
  content: string
  variant?: 'normal' | 'bold'
  asChild?: boolean
  children: React.ReactNode
}

const Tooltips: FC<ITooltipProps> = ({
  position = 'top',
  content,
  variant = 'normal',
  children,
  asChild = false,
}) => {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild={asChild}>{children}</TooltipTrigger>
        <TooltipContent
          className={cn(
            'relative overflow-visible rounded-lg bg-zinc-100 text-zinc-600 p-3 shadow-lg dark:bg-zinc-700 dark:text-zinc-100',
            position === 'left' && 'right-4',
            position === 'right' && 'left-4',
            position === 'top' && 'bottom-2',
            position === 'bottom' && 'top-3'
          )}
          side={position}
        >
          <div
            className={cn(
              'flex justify-center items-center gap-2',
              variant === 'bold' && 'font-semibold'
            )}
          >
            {content !== '' ? content : 'N/A'}
          </div>
          <div
            className={cn(
              'absolute size-4 rounded-xs bg-zinc-100 dark:bg-zinc-700',
              position === 'bottom'
                ? '-top-2 left-1/2 -translate-x-1/2 rotate-45'
                : position === 'top'
                ? '-bottom-1.5 left-1/2 -translate-x-1/2 rotate-45'
                : position === 'left'
                ? '-right-1.5 top-1/2 -translate-y-1/2 rotate-45'
                : '-left-1.5 top-1/2 -translate-y-1/2 rotate-45'
            )}
          />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default Tooltips
