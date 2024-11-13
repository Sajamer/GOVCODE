'use client'

import { useLocale, useTranslations } from 'next-intl'
import React, { FC } from 'react'
import LocaleSwitcher from '../shared/dropdowns/LocalSwitcher'
import { Link } from '@/i18n/routing'

const Navbar: FC = () => {
  const locale = useLocale()
  const t = useTranslations('NavbarLinks')
  const isArabic = locale === 'ar'

  return (
    <div
      className="flex w-full justify-between border-b px-10 py-4"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center gap-4 text-lg">
        <Link href={`/`}>{t('home')}</Link>
        <Link href={`/about`}>{t('about')}</Link>
        <Link href={`/contact-us`}>{t('profile')}</Link>
      </div>
      <LocaleSwitcher />
    </div>
  )
}

export default Navbar
