'use client'

import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { FC } from 'react'
import ErrorText from '../ErrorText'

interface ILabeledTextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  resizable?: boolean
  hasCounter?: boolean
  containerStyle?: string
}

const LabeledTextArea: FC<ILabeledTextAreaProps> = ({
  id,
  label,
  error,
  resizable = false,
  hasCounter = false,
  containerStyle,
  className,
  onChange,
  ...props
}) => {
  return (
    <div className={cn('relative flex w-full flex-col gap-1', containerStyle)}>
      <div className="flex justify-between">
        <Label
          className={cn(
            'text-sm font-medium text-zinc-800',
            props?.disabled && 'opacity-50',
          )}
        >
          {label}
        </Label>
        {hasCounter && (
          <p className="text-xs text-gray-400 md:whitespace-nowrap">
            {`${props.value?.toLocaleString().length ?? 0} / ${
              props.maxLength
            }`}
          </p>
        )}
      </div>
      <Textarea
        placeholder="Type your message here."
        id={id ?? 'textarea'}
        {...props}
        className={cn(
          'h-32 shadow-none styleScrollbar focus-visible:ring-0',
          !resizable && 'resize-none',
          className,
          error &&
            'border-destructive focus-visible:ring-0 focus:border-destructive',
        )}
        onChange={onChange}
        {...props}
      />
      {error && <ErrorText error={error} />}
    </div>
  )
}

export default LabeledTextArea
