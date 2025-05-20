import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow hover:bg-primary hover:opacity-90',
        destructive:
          'bg-destructive text-white shadow-sm hover:bg-destructive-hover',
        outline:
          'border border-input bg-background shadow-sm hover:bg-white hover:text-accent-foreground dark:bg-white dark:text-neutral-0',
        secondary:
          'bg-secondary text-white shadow-sm hover:bg-secondary hover:opacity-90',
        ghost: 'hover:bg-transparent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        icon: 'size-10 px-3 py-0 text-zinc-800',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'size-9',
        ghost: 'h-fit p-0',
        icon_sm: 'size-10 text-[1rem]',
        icon_md: 'size-11 text-[1.25rem]',
        icon_lg: 'size-14 text-[1.5rem]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {isLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
        {props.children}
      </Comp>
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
