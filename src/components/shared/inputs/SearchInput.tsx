import { Icons } from '@/components/icons/Icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Search } from 'lucide-react'
import { FC } from 'react'

interface ISearchInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  containerStyle?: string
  maxLength?: number
  hasIcon?: boolean
  onInputClear?: () => void
}

const SearchInput: FC<ISearchInputProps> = ({
  label,
  hasIcon,
  containerStyle,
  maxLength,
  className,
  onInputClear,
  ...props
}) => {
  return (
    <div className={cn('relative flex w-full flex-col gap-1', containerStyle)}>
      <Label
        className={cn(
          'text-sm font-medium text-zinc-800',
          props?.disabled && 'text-zinc-200',
        )}
      >
        {label}
      </Label>

      <div className="relative">
        <Input
          maxLength={maxLength}
          className={cn(
            'focus-visible:ring-0 group shadow-none pr-[2.63rem] text-sm text-zinc-800 placeholder:text-zinc-500 disabled:placeholder:text-zinc-200',
            className,
            hasIcon && 'pl-[2.63rem]',
          )}
          {...props}
        />

        {hasIcon && (
          // <SearchNormal1
          //   className={cn(
          //     'pointer-events-none absolute inset-y-0 left-[0.88rem] my-auto  size-5 cursor-pointer bg-transparent text-zinc-600 shadow-none outline-none ring-0 hover:bg-transparent focus:ring-0',
          //     props?.disabled && 'text-zinc-200',
          //   )}
          // />
          <Search
            size="16"
            className={cn(
              'pointer-events-none absolute inset-y-0 left-[0.88rem] my-auto  size-5 cursor-pointer bg-transparent text-zinc-600 shadow-none outline-none ring-0 hover:bg-transparent focus:ring-0',
              props?.disabled && 'text-zinc-200',
            )}
          />
        )}

        {props?.value && (
          <Button
            variant={'icon'}
            size={'icon_sm'}
            className="absolute inset-y-0 right-[0.2rem] my-auto border-0 bg-transparent outline-none hover:bg-transparent"
            onClick={(e) => {
              e.preventDefault()
              if (onInputClear) onInputClear()
            }}
          >
            <Icons.ClearInput className="size-5 cursor-pointer bg-transparent text-zinc-700 shadow-none outline-none ring-0 hover:bg-transparent focus:ring-0" />
          </Button>
        )}
      </div>

      {maxLength && (
        <Label className="absolute right-0 top-0.5 text-xs">
          {props.value &&
          typeof props.value === 'string' &&
          props.value.length >= 1
            ? props.value.length
            : 0}
          /{maxLength}
        </Label>
      )}
    </div>
  )
}

export default SearchInput
