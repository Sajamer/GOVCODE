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
  onGeneratePassword?: (generatedPassword: string) => void
}

const PasswordInput: FC<IPasswordInputProps> = ({
  label,
  error,
  containerStyle,
  className,
  disabled,
  onGeneratePassword,
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

  const generateRandomPassword = (): void => {
    const generatedPassword = Math.random().toString(36).slice(-10) + '@2025' // Generates a 10-character random string
    if (onGeneratePassword) {
      onGeneratePassword(generatedPassword)
    }
  }

  return (
    <div className={cn('relative flex flex-col w-full', containerStyle)}>
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        <Button
          type="button"
          variant="link"
          className="p-0 text-sm text-primary"
          onClick={generateRandomPassword}
        >
          Generate Password
        </Button>
      </div>
      <div className="relative">
        <Input
          type={passwordType}
          maxLength={128}
          className={cn(
            'h-11 shadow-none pr-[2.13rem] text-sm text-neutral-800 placeholder:text-neutral-500 disabled:placeholder:text-neutral-200',
            className,
            error &&
              'border-destructive focus-visible:ring-0 focus:border-destructive',
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
