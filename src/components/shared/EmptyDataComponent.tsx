import { cn } from '@/lib/utils'
import { FC, ReactNode } from 'react'

interface IEmptyDataComponentProps {
  icon: ReactNode
  title: string
  titleWrapper?: string
  iconStyle?: string
}

const EmptyDataComponent: FC<IEmptyDataComponentProps> = ({
  icon,
  title,
  iconStyle,
  titleWrapper,
}) => {
  return (
    <div className="flex h-52 w-full flex-col items-center justify-center gap-3">
      <div className="flex size-[5.625rem] items-center justify-center rounded-full bg-neutral-100">
        <div className={cn('size-12 text-neutral-400', iconStyle)}>{icon}</div>
      </div>
      <div className={cn('w-full text-center', titleWrapper)}>
        <span className={cn('font-medium text-sm text-neutral-500')}>
          {title}
        </span>
      </div>
    </div>
  )
}

export default EmptyDataComponent
