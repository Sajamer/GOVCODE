import { Add } from 'iconsax-react'

import { cn } from '@/lib/utils'
import { cva, VariantProps } from 'class-variance-authority'
import Image from 'next/image'
import { FC } from 'react'

export const sizeVariants = cva('', {
  variants: {
    size: {
      default: 'size-8 text-xs',
      xxs: 'size-4 text-[0.375rem]',
      xs: 'size-[1.125rem] text-[0.375rem]',
      xsm: 'size-5 text-[0.5rem]',
      sm: 'size-6 text-[0.625rem]',
      md: 'size-8 text-xs',
      lg: 'size-10 text-base',
      xl: 'size-12 text-xl',
      xxl: 'size-14 text-2xl leading-[1.8rem]',
    },
    border: {
      default: 'border-0',
      xs: 'border-[0.8px]',
      sm: 'border',
      lg: 'border-[1.5px]',
      xl: 'border-2',
    },
  },
  defaultVariants: {
    size: 'default',
    border: 'default',
  },
})

interface IAvatarsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sizeVariants> {
  memberImages: string[]
  numberOfImagesToShow: number
  hasPlusIcon?: boolean
  iconStyle?: string
  hasRing?: boolean
  textStyle?: string
}

export const Avatars: FC<IAvatarsProps> = ({
  memberImages,
  numberOfImagesToShow,
  hasPlusIcon = false,
  iconStyle,
  hasRing = false,
  size = 'default',
  border = 'default',
  textStyle,
}) => {
  return (
    <div className={cn('w-full flex items-start justify-center gap-2')}>
      <div className="flex items-start">
        {memberImages &&
          memberImages.length > 0 &&
          memberImages.slice(0, numberOfImagesToShow).map((image, index) => (
            <div
              key={index}
              className={cn(
                'relative -mr-3 rounded-full',
                sizeVariants({ size, border }),
              )}
              style={{ zIndex: -(50 - index * 10) }}
            >
              <Image
                src={image}
                alt="avatar"
                fill
                className="rounded-full bg-cover"
              />
            </div>
          ))}
        {memberImages && memberImages.length > numberOfImagesToShow && (
          <div
            className={cn(
              'relative z-0 flex items-center justify-center rounded-full bg-static-white',
              hasRing && 'ring ring-neutral-200',
              sizeVariants({ size, border }),
            )}
          >
            <span
              className={cn(
                'font-medium text-sm text-static-accent',
                textStyle,
              )}
            >
              {memberImages.length - numberOfImagesToShow}
            </span>
          </div>
        )}
      </div>

      {hasPlusIcon && (
        <div
          className={cn(
            'ml-4 p-1 flex justify-center items-center border border-dashed border-static-white rounded-full cursor-pointer bg-neutral-100',
            sizeVariants({ size, border: 'xl' }),
          )}
        >
          <Add size="16" className={cn('text-neutral-800', iconStyle)} />
        </div>
      )}
    </div>
  )
}

export default Avatars
