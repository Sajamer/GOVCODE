'use client'

import { cn } from '@/lib/utils'
import { FC, ReactNode } from 'react'

interface IIconTitleDescriptionProps {
  icon: ReactNode
  iconWrapper?: string
  title: string
  description: string
  descriptionStyles?: string
}

const IconTitleDescription: FC<IIconTitleDescriptionProps> = ({
  description,
  icon,
  iconWrapper,
  title,
  descriptionStyles,
}) => {
  return (
    <div className="flex h-fit w-full items-start gap-3 md:items-start">
      <div
        className={cn(
          'flex items-center justify-center min-w-[2.375rem] size-[2.375rem] lg:min-w-11 lg:size-11 rounded-[0.75rem] mt-1',
          iconWrapper,
        )}
      >
        {icon}
      </div>
      <div className="flex flex-col items-start">
        <h4 className="text-base font-semibold text-zinc-800 md:text-xl">
          {title}
        </h4>
        <div className={cn('w-full', descriptionStyles)}>
          <p
            className="text-sm leading-normal text-zinc-600"
            // eslint-disable-next-line @typescript-eslint/naming-convention
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
      </div>
    </div>
  )
}

export default IconTitleDescription
