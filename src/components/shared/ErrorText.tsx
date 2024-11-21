import { cn } from '@/lib/utils'
import { FC } from 'react'

interface IErrorTextProps {
  error: string
  className?: string
}

const ErrorText: FC<IErrorTextProps> = ({ error, className }) => {
  return (
    <span
      className={cn(
        'absolute -bottom-4 left-1 text-xs text-destructive',
        className
      )}
    >
      {error}
    </span>
  )
}

export default ErrorText
