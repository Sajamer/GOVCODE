'use client'

import { Icons } from '@/components/icons/Icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { FC, useState } from 'react'
import ErrorText from '../ErrorText'

interface IPasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  containerStyle?: string
  maxLength?: number
}

const PasswordInput: FC<IPasswordInputProps> = ({
  label,
  error,
  containerStyle,
  className,
  disabled,
  ...props
}) => {
  const [passwordType, setPasswordType] = useState('password')

  const togglePassword = (): void => {
    if (passwordType === 'password') {
      setPasswordType('text')
      return
    }
    setPasswordType('password')
  }

  return (
    <div className={cn('relative flex flex-col gap-1', containerStyle)}>
      <Label>{label}</Label>
      <div className="relative">
        <Input
          type={passwordType}
          maxLength={128}
          className={cn(
            'shadow-none pr-[2.13rem] text-sm text-neutral-800 placeholder:text-neutral-500 disabled:placeholder:text-neutral-200',
            className,
            error && 'border-Cosmos bg-roseWhite focus-visible:ring-0',
          )}
          disabled={disabled}
          {...props}
        />
        {!disabled && (
          <Button
            type="button"
            variant={'icon'}
            className={cn(
              'absolute top-1/2 -translate-y-1/2 right-0 cursor-pointer',
            )}
            onClick={(): void => togglePassword()}
          >
            {passwordType === 'password' ? (
              <Icons.EyeOff className="size-6 text-black" />
            ) : (
              <Icons.Eye className="size-6 text-black" />
            )}
          </Button>
        )}
      </div>
      {error && <ErrorText error={error} />}
    </div>
  )
}

export default PasswordInput
