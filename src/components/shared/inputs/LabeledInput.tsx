import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addClassesToElement, cn } from '@/lib/utils'
import { FC } from 'react'
import ErrorText from '../ErrorText'

interface ILabeledInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  containerStyle?: string
  labelStyle?: string
  htmlFor?: string
  maxLength?: number
  maxLengthStyle?: string
  inputIcon?: React.JSX.Element
  helperText?: string
}

const LabeledInput: FC<ILabeledInputProps> = ({
  label,
  error,
  inputIcon,
  htmlFor,
  containerStyle,
  labelStyle,
  maxLength,
  maxLengthStyle,
  className,
  helperText,
  ...props
}) => {
  return (
    <div
      className={cn(
        'relative flex w-full flex-col gap-[0.3125rem]',
        containerStyle,
      )}
    >
      <div className="flex items-center justify-start gap-0.5">
        <Label
          htmlFor={htmlFor || ''}
          className={cn(
            'text-sm font-medium text-zinc-800',
            labelStyle,
            props?.disabled && 'opacity-50',
          )}
        >
          {label}
        </Label>
        {helperText && <p className="text-xs text-zinc-600">{helperText}</p>}
      </div>

      <div className="relative">
        {inputIcon &&
          addClassesToElement(
            inputIcon,
            cn(
              'pointer-events-none absolute inset-y-0 left-[0.88rem] my-auto size-5 cursor-pointer bg-transparent text-zinc-600 shadow-none outline-none ring-0 hover:bg-transparent focus:ring-0',
              props?.disabled && 'text-zinc-200',
            ),
          )}
        <Input
          maxLength={maxLength}
          className={cn(
            'focus-visible:ring-0 h-11 group shadow-none text-sm text-zinc-800 placeholder:text-zinc-500 disabled:placeholder:text-zinc-200 focus:border-zinc-500',
            className,
            error &&
              'border-destructive focus-visible:ring-0 focus:border-destructive',
            inputIcon && 'pl-[2.63rem]',
          )}
          {...props}
          value={props.value || ''}
        />
        {error && <ErrorText error={error} />}
      </div>

      {maxLength && (
        <p className={cn('absolute right-0 top-0.5 text-xs', maxLengthStyle)}>
          {props.value &&
          typeof props.value === 'string' &&
          props.value.length >= 1
            ? props.value.length
            : 0}
          /{maxLength}
        </p>
      )}
    </div>
  )
}

export default LabeledInput
