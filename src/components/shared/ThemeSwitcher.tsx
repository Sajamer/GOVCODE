'use client'

import { MoonIcon, SunIcon } from '@radix-ui/react-icons'
import { useTheme } from 'next-themes'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface IThemeSwitcherProps {
  className?: string
}

const ThemeSwitcher: React.FC<IThemeSwitcherProps> = ({
  className,
}): JSX.Element => {
  const { setTheme, theme } = useTheme()

  const toggleTheme = (): void => {
    if (theme === 'dark') {
      setTheme('light')
    } else {
      setTheme('dark')
    }
  }

  return (
    <Button
      variant={'ghost'}
      className={cn(className)}
      onClick={toggleTheme}
      type="button"
    >
      <SunIcon className="size-5 min-h-5 min-w-5 rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
      <MoonIcon className="absolute size-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 dark:text-neutral-800" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

export default ThemeSwitcher
