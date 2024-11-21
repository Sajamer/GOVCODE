import { cn } from '@/lib/utils'
import React from 'react'

interface INotFoundProps {
  label?: string
  labelStyle?: string
  wrapperStyle?: string
}

const NoResultFound = ({
  label = 'No Results Found',
  labelStyle,
  wrapperStyle,
}: INotFoundProps): React.JSX.Element => {
  return (
    <div
      className={cn(
        'min-h-[65vh] flex items-center justify-center',
        wrapperStyle
      )}
    >
      <h4 className={cn('text-center text-xl text-zinc-500', labelStyle)}>
        {label}
      </h4>
    </div>
  )
}

export default NoResultFound
