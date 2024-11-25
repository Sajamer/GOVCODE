'use client'

import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { FC, useEffect, useState } from 'react'

interface IToggleSwitchProps {
  id: string
  label?: string
  description?: string
  containerStyle?: string
  switchStyle?: string
  labelStyle?: string
  descriptionStyle?: string
  checked?: boolean
  disabled?: boolean
  switchText?: string
  textAlign?: 'left' | 'right'
  size: 'sm' | 'md' | 'lg'
  thumbSize: 'sm' | 'md' | 'lg'
  callback?: () => void
}

const ToggleSwitch: FC<IToggleSwitchProps> = ({
  id,
  label,
  description,
  containerStyle,
  switchStyle,
  checked: initialChecked = false,
  disabled,
  labelStyle,
  descriptionStyle,
  textAlign,
  callback,
}) => {
  const [checked, setChecked] = useState(initialChecked)

  const handleCheckedChange = (): void => {
    setChecked(!checked)
    if (callback) {
      callback()
    }
  }

  useEffect(() => {
    if (checked !== initialChecked) setChecked(initialChecked)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialChecked])

  return (
    <div
      className={cn('flex items-center justify-start gap-2', containerStyle)}
    >
      <>
        {textAlign === 'left' && (
          <div className="flex flex-col">
            <Label
              htmlFor={id}
              className={cn(
                'text-sm leading-normal text-neutral-800 font-medium ',
                labelStyle,
              )}
            >
              {label}
            </Label>
            {description && (
              <Label
                htmlFor={id}
                className={cn(
                  'text-neutral-600 text-sm font-normal',
                  descriptionStyle,
                )}
              >
                {description}
              </Label>
            )}
          </div>
        )}
      </>
      <Switch
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={handleCheckedChange}
        className={cn(switchStyle)}
      />
      <>
        {textAlign === 'right' && (
          <div className="flex flex-col">
            <Label
              htmlFor={id}
              className={cn(
                'text-sm leading-normal text-neutral-800 font-medium ',
                labelStyle,
              )}
            >
              {label}
            </Label>
            {description && (
              <Label
                htmlFor={id}
                className={cn(
                  'text-neutral-600 text-sm font-normal',
                  descriptionStyle,
                )}
              >
                {description}
              </Label>
            )}
          </div>
        )}
      </>
    </div>
  )
}

export default ToggleSwitch
