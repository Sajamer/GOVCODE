/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'
import { FC, useEffect, useMemo, useState } from 'react'
import Select, { MultiValue } from 'react-select'

interface IMultiDropdownProps {
  defaultValue?: IOption[]
  onChange: (skills: number[]) => void
  changeLoading: (state: boolean) => void
}

const MultiDropdown: FC<IMultiDropdownProps> = ({
  defaultValue = [],
  onChange,
  changeLoading,
}) => {
  const [value, setValue] = useState<MultiValue<IOption>>(defaultValue)
  const [inputValue, setInputValue] = useState<string>('')
  const [options, setOptions] = useState<IOption[]>([])

  const debouncedInputValue = useDebounce(inputValue, 250)

  // Handle Change
  const handleChange = (newValue: MultiValue<IOption>): void => {
    setValue(newValue)
    onChange(newValue.map((item) => item.value) || [])
  }

  // Fetch Skills Data
  // const fetchSkills = useCallback(async (): Promise<void> => {
  //   if (!debouncedInputValue && value.length === 0) {
  //     changeLoading(false)
  //     setOptions([])
  //     return
  //   }

  //   if (debouncedInputValue) {
  //     try {
  //       changeLoading(true)
  //       const response = await axiosGet<ISkills[]>(
  //         `skills?key=${debouncedInputValue}`,
  //       )
  //       if (response?.data) {
  //         const transformedOptions: IOption[] = response.data.map((skill) => ({
  //           value: skill.id,
  //           label: skill.name,
  //         }))
  //         setOptions(transformedOptions)
  //       }
  //     } catch (error) {
  //       console.error('Error fetching skills:', error)
  //     } finally {
  //       changeLoading(false)
  //     }
  //   }
  // }, [debouncedInputValue, value.length])

  // Handle Input Change
  const handleInputChange = (newInputValue: string): void => {
    setInputValue(newInputValue.trim())
  }

  // Memoized Options
  const memoizedOptions = useMemo(() => options, [options])

  // Set Default Value on Mount
  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue)
    }
  }, [defaultValue])

  // Fetch Skills on Input Change
  // useEffect(() => {
  //   fetchSkills()
  // }, [debouncedInputValue, value.length])

  return (
    <Select
      instanceId="multi-dropdown"
      placeholder="... إختر المهارة"
      defaultValue={defaultValue}
      options={memoizedOptions}
      value={value}
      onChange={handleChange}
      onInputChange={handleInputChange}
      isMulti
      name="skills"
      className={cn(
        'basic-multi-select',
        memoizedOptions.length === 0 && 'hide-menu',
      )}
      classNamePrefix="select"
    />
  )
}

export default MultiDropdown
