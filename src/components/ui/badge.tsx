import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'flex items-center justify-center gap-1.5 rounded-2xl border-0 p-0.5 text-[0.75rem] font-medium focus:outline-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-neutral-800',
        primary: 'bg-primary text-neutral-800',
        secondary: 'bg-secondary-light text-secondary',
        warning: 'bg-warning-foreground text-warning',
        destructive: 'bg-destructive-foreground text-destructive',
        success: 'bg-success-foreground text-success',
        dark: 'bg-neutral-alpha_100 text-accent-disabled',
      },
      size: {
        default: 'text-[0.75rem]',
        xs: 'text-[0.75rem]',
        sm: 'text-[0.875rem]',
        lg: 'text-[1.125rem]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface IBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  hasIcon?: boolean
  hasAvatar?: boolean
  canBeClosed?: boolean
  isLock?: string
  onClose?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}

function GenericBadge({
  className,
  variant,
  size,
  hasIcon,
  hasAvatar,
  canBeClosed,
  ...props
}: IBadgeProps): JSX.Element {
  return (
    <div
      className={cn(
        badgeVariants({ variant, size }),
        className,
        hasIcon && 'gap-[0.375rem] pl-[0.625rem]',
        hasAvatar && 'gap-[0.375rem] py-[0.125rem] pl-[0.25rem] pr-[0.625rem]',
        canBeClosed && 'gap-[0.25rem] py-[0.25rem] pl-[0.75rem] pr-[0.375rem]',
      )}
      {...props}
    />
  )
}

export { badgeVariants, GenericBadge }
