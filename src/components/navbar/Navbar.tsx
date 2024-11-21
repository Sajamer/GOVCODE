'use client'

import { useLocale } from 'next-intl'
import React, { FC } from 'react'
import LocaleSwitcher from '../shared/dropdowns/LocalSwitcher'
import ThemeSwitcher from '../shared/ThemeSwitcher'

const Navbar: FC = () => {
  const locale = useLocale()
  const isArabic = locale === 'ar'

  return (
    <div
      className="flex w-full justify-between px-5 pt-4"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="flex w-full items-center justify-end gap-1">
        <ThemeSwitcher />
        <LocaleSwitcher />
      </div>
    </div>
  )
}

export default Navbar
