'use client'

import { FC, useEffect, useMemo, useState } from 'react'
import Select, { SingleValue } from 'react-select'
import countryList from 'react-select-country-list'

interface ICountryData {
  label: string
  value: string
}

interface ICountriesDropdownProps {
  defaultValue?: string
  onChange: (value: string) => void
}

const CountriesDropdown: FC<ICountriesDropdownProps> = ({
  defaultValue,
  onChange,
}) => {
  const options = useMemo(() => {
    const allOptions = countryList().getData() as ICountryData[]
    const filteredOptions = allOptions
      .filter((country) => country.label !== 'Israel')
      .map((country) => {
        if (country.label === 'Palestine, State of') {
          return { ...country, label: 'Palestine' }
        }
        return country
      })
    return filteredOptions
  }, [])
  const [value, setValue] = useState<SingleValue<ICountryData>>(
    defaultValue
      ? (options.find(
          (c) => c.label === defaultValue
        ) as SingleValue<ICountryData>)
      : null
  )

  const changeHandler = (value: SingleValue<ICountryData>): void => {
    setValue(value)
    onChange(value?.label || '')
  }

  useEffect(() => {
    if ((defaultValue && !value) || defaultValue !== value?.label) {
      setValue(
        options.find(
          (c) => c.label === defaultValue
        ) as SingleValue<ICountryData>
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue])

  return (
    <Select
      instanceId={'countries-dropdown'}
      placeholder={''}
      options={options}
      value={value}
      onChange={changeHandler}
      className="countries-dropdown"
    />
  )
}

export default CountriesDropdown
