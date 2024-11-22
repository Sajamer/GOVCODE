import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useViewportSize } from '@mantine/hooks'
import { ArrowDown2, SearchNormal1 } from 'iconsax-react'
import React, { MutableRefObject, useRef } from 'react'

interface IBasicDropdownProps {
  name?: string
  data: IDropdown[]
  className?: string
  searchable?: boolean
  header?: React.JSX.Element
  containerStyle?: string
  wrapperStyle?: string
  align?: 'start' | 'center' | 'end'
  size?: 'sm' | 'md'
  placeholder?: string
  placeholderStyle?: string
  hasLeftCheckboxes?: boolean
  hasRightCheckboxes?: boolean
  multiSelect?: boolean
  triggerStyle?: string
  hideTriggerText?: boolean
  dropdownItemStyle?: string
  defaultValue?: IDropdown
  label?: string
  labelStyle?: string
  iconStyle?: string
  error?: string
  disabled?: boolean
  splitLabel?: boolean
  callback: (option: IDropdown) => void
}

const BasicDropdown = React.memo<IBasicDropdownProps>(function BasicDropdown({
  data,
  searchable,
  name,
  header,
  className,
  containerStyle,
  wrapperStyle,
  align,
  placeholder,
  placeholderStyle,
  hasLeftCheckboxes,
  hasRightCheckboxes,
  triggerStyle,
  hideTriggerText = false,
  dropdownItemStyle,
  defaultValue,
  label,
  labelStyle,
  iconStyle,
  disabled,
  splitLabel,
  error,
  callback,
}: IBasicDropdownProps): React.JSX.Element {
  const [open, setOpen] = React.useState(false)

  const triggerRef: MutableRefObject<HTMLButtonElement | null> = useRef(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { width } = useViewportSize()

  return (
    <div
      className={cn(
        'relative flex w-full flex-col gap-[0.31rem]',
        containerStyle,
      )}
      ref={containerRef}
    >
      {label && (
        <Label
          className={cn('text-neutral-800 font-medium text-sm', labelStyle)}
        >
          {label}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="flex w-full items-center gap-2">
            <Button
              ref={triggerRef}
              name={name}
              disabled={disabled}
              type="button"
              variant={'outline'}
              className={cn(
                'h-10 min-w-[3.5rem] md:!justify-between w-full bg-transparent py-2.5 px-3.5 rounded-[0.875rem] flex items-center gap-1.5',
                triggerStyle,
                error && 'border-destructive',
              )}
            >
              <p
                className={cn(
                  'text-sm text-neutral-500',
                  defaultValue && 'text-neutral-800',
                  placeholderStyle,
                  hideTriggerText && 'hidden',
                )}
              >
                {defaultValue?.label || placeholder}
              </p>
              <ArrowDown2
                className={cn(
                  'text-neutral-600 transition-all duration-200 size-4',
                  open && '-rotate-180',
                  iconStyle,
                )}
              />
            </Button>
          </div>
        </PopoverTrigger>

        <PopoverContent
          className={cn(
            'm-0 overflow-hidden rounded-[1.25rem] p-0 backdrop-blur-[2.5rem] shadow-dropdown bg-neutral-50',
            wrapperStyle,
          )}
          align={align}
          style={{
            minWidth: width < 767 ? '10rem' : containerRef.current?.offsetWidth,
          }}
          container={containerRef.current}
        >
          <MenuList
            data={data}
            setOpen={setOpen}
            defaultValue={defaultValue}
            searchable={searchable}
            header={header}
            splitLabel={splitLabel}
            className={className}
            hasLeftCheckboxes={hasLeftCheckboxes}
            hasRightCheckboxes={hasRightCheckboxes}
            callback={callback}
            dropdownItemStyle={dropdownItemStyle}
          />
        </PopoverContent>
      </Popover>
      {error && (
        <div className="absolute -bottom-4 left-1">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}
    </div>
  )
})

interface IMenuListProps extends IBasicDropdownProps {
  setOpen: (open: boolean) => void
}

const MenuList = React.memo(function MenuList({
  data,
  setOpen,
  defaultValue,
  searchable,
  header,
  splitLabel,
  className,
  hasLeftCheckboxes,
  hasRightCheckboxes,
  dropdownItemStyle,
  callback,
}: IMenuListProps): React.JSX.Element {
  const toggleStatus = (status: IDropdown): void => {
    callback(status)
    setOpen(false)
  }

  return (
    <Command className={cn('bg-white dark:bg-neutral-100', className)}>
      {header && (
        <div className="border-b border-neutral-200 px-3.5 py-3">
          {searchable ? (
            <div className="flex items-center gap-x-2 rounded-lg">
              <SearchNormal1
                size="16"
                className="flex items-center justify-center text-neutral-800"
              />
              <CommandInput placeholder="Search" />
            </div>
          ) : (
            <>{header}</>
          )}
        </div>
      )}
      <CommandList className="styleScrollbar">
        <CommandEmpty className="py-2 text-center text-xs">
          No results found.
        </CommandEmpty>
        <CommandGroup>
          {data.map((status) => (
            <CommandItem
              className={cn(
                'flex items-center justify-between px-3.5 py-2.5',
                dropdownItemStyle,
                splitLabel && 'p-0',
              )}
              key={status.value + status.id}
              value={status.label}
              onSelect={() => toggleStatus(status)}
            >
              <div className="flex items-start gap-2">
                {hasLeftCheckboxes && (
                  <Checkbox
                    className="mt-[0.2rem]"
                    checked={defaultValue?.id === status.id}
                  />
                )}
                {!splitLabel ? (
                  <p className={cn('text-sm text-neutral-600')}>
                    {status.label}
                  </p>
                ) : (
                  <div className="flex h-[3.8125rem] max-h-[3.8125rem] w-full cursor-pointer flex-col px-[0.88rem] py-2.5 duration-100">
                    <div className="line-clamp-1 max-w-[17.5rem] break-words text-sm text-neutral-800">
                      {status.label.split(', ')[0]}
                    </div>
                    <div className="line-clamp-1 cursor-pointer text-xs text-neutral-500">
                      {status.label.split(', ')[1]}
                    </div>
                  </div>
                )}
              </div>

              {hasRightCheckboxes && (
                <Checkbox checked={defaultValue?.id === status.id} />
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
})

export default BasicDropdown
