import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { ArrowDown2 } from 'iconsax-react'
import { X } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import Select, {
  components,
  ControlProps,
  DropdownIndicatorProps,
  GroupBase,
  MenuListProps,
  MenuProps,
  MultiValueGenericProps,
  MultiValueRemoveProps,
  OptionProps,
  SingleValueProps,
  Props as StateManagerProps,
  ValueContainerProps,
} from 'react-select'

interface IMultiSelect extends StateManagerProps {
  data: ICountryList[] | IBasicDropdown[] | IMultiSelectOptions[]
  label?: string | null
  labelStyle?: string
  error?: string | null
  hasArrow?: boolean
  isFlag?: boolean
  isOrganization?: boolean
}
/* eslint-disable  @typescript-eslint/no-explicit-any */
const DropdownIndicator = (
  props: DropdownIndicatorProps,
): React.JSX.Element => {
  return (
    <components.DropdownIndicator {...props}>
      <ArrowDown2 className="size-4 text-neutral-600" id="dropdownIndicator" />
    </components.DropdownIndicator>
  )
}

const ValueContainer = ({
  children,
  ...props
}: ValueContainerProps<any>): React.JSX.Element => {
  return (
    <components.ValueContainer
      {...props}
      className={cn(
        'h-fit cursor-pointer !p-0 text-sm text-neutral-800',
        props?.isDisabled && '!text-neutral-300',
      )}
    >
      {children}
    </components.ValueContainer>
  )
}

const MultiValueContainer = (
  props: MultiValueGenericProps<any>,
): React.JSX.Element => {
  return (
    <components.MultiValueContainer {...props}>
      <div className="flex items-center justify-center gap-2">
        {props.data.flag && typeof props.data.flag === 'string' ? (
          <Image
            src={props.data.flag}
            width={16}
            height={16}
            alt=""
            className="rounded-full"
          />
        ) : (
          props.data.flag
        )}
        {props.children}
      </div>
    </components.MultiValueContainer>
  )
}

const CustomSingleValue = ({
  children,
  ...props
}: SingleValueProps<any>): React.JSX.Element => {
  return (
    <components.SingleValue {...props} className="flex items-center gap-2">
      {props.data.flag && typeof props.data.flag === 'string' ? (
        <Image
          src={props.data.flag}
          alt=""
          width={20}
          height={20}
          className={cn('rounded-full', props.isDisabled && 'opacity-20')}
        />
      ) : (
        props.data.icon
      )}
      <div
        className={cn(
          'text-neutral-800',
          props?.isDisabled && '!text-neutral-300 font-normal',
        )}
      >
        {children}
      </div>
    </components.SingleValue>
  )
}

const CustomMenu = (props: MenuProps<unknown, true>): React.JSX.Element => {
  return (
    <div
      {...props.innerProps}
      id="dropdownOpened"
      className="styleScrollbar  absolute top-[105%] z-20 m-0 max-h-80 w-full overflow-auto rounded-[1.25rem] bg-white p-0 backdrop-blur-[2.5rem] dark:bg-neutral-100"
    >
      {props.children}
    </div>
  )
}

const CustomControl = (
  { children, ...props }: ControlProps<any, false>,
  isFlag: boolean,
): React.JSX.Element => {
  const tempFlag = `/assets/icons/flags/svg/WW.svg`

  return (
    <components.Control
      {...props}
      className={cn(
        'flex !min-h-11 items-center gap-2',
        props.isDisabled && '!h-11 !items-start',
      )}
    >
      {!props.hasValue && isFlag && (
        <Image
          src={tempFlag}
          alt=""
          width={20}
          height={20}
          className="rounded-full"
        />
      )}
      {children}
    </components.Control>
  )
}

const CustomMenuList = (
  props: MenuListProps<unknown, true>,
): React.JSX.Element => {
  return <div>{props.children}</div>
}

const CustomOption = (
  props: OptionProps<any, true, GroupBase<unknown>>,
): React.JSX.Element => {
  return (
    <div
      className="flex cursor-pointer items-center justify-between bg-transparent px-3.5 py-2.5 text-sm text-neutral-600 transition-colors duration-200 hover:bg-neutral-50"
      {...props.innerProps}
    >
      <div className="flex items-center gap-2">
        {props.data.flag && typeof props.data.flag === 'string' ? (
          <Image
            src={props.data.flag}
            alt=""
            width={16}
            height={16}
            className="rounded-full"
          />
        ) : (
          props.data.icon
        )}
        <span>{props.data.label}</span>
      </div>
      {props.data.rightIcon && typeof props.data.rightIcon === 'string' ? (
        <Image
          src={props.data.rightIcon}
          alt=""
          width={16}
          height={16}
          className="rounded-full"
        />
      ) : (
        props.data.icon
      )}
    </div>
  )
}

const MultiValueRemove = (
  props: MultiValueRemoveProps<any>,
): React.JSX.Element => {
  return (
    <components.MultiValueRemove {...props}>
      <X className="size-4 text-neutral-800" />
    </components.MultiValueRemove>
  )
}

const MultiSelect = ({
  data,
  error,
  label,
  hasArrow,
  labelStyle,
  isOrganization,
  isFlag = false,
  ...selectProps
}: IMultiSelect): React.JSX.Element => {
  return (
    <div className="flex w-full flex-col gap-[0.31rem]">
      <Label
        className={cn(
          'text-sm font-medium text-neutral-800',
          selectProps?.isDisabled && 'text-neutral-200',
          selectProps?.isDisabled && isOrganization && 'text-neutral-500',
          labelStyle,
        )}
      >
        {label}
      </Label>

      <div className="relative w-full">
        <Select
          /* eslint-disable @typescript-eslint/naming-convention */
          options={data}
          styles={{
            placeholder: (provided: any) => ({
              ...provided,
              color: selectProps?.isDisabled ? '#CBD3DB' : '',
            }),
          }}
          className={cn(
            'w-full',
            selectProps?.isDisabled && '[&>div]:placeholder:text-red-600',
            error && 'has-error',
          )}
          components={{
            Menu: CustomMenu,
            MenuList: CustomMenuList,
            Option: CustomOption,
            ValueContainer,
            SingleValue: CustomSingleValue,
            DropdownIndicator: (selectProps) => {
              if (hasArrow && !selectProps?.isDisabled) {
                return DropdownIndicator(selectProps)
              }
            },
            ClearIndicator: () => null,
            IndicatorSeparator: () => null,
            MultiValueRemove,
            MultiValueContainer,
            Control: (selectProps) => {
              return CustomControl(selectProps, isFlag)
            },
          }}
          {...selectProps}
          /* eslint-disable @typescript-eslint/naming-convention */
        />

        {error && (
          <div className="absolute -bottom-4 left-1">
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MultiSelect
