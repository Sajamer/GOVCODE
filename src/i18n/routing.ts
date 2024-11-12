import { createNavigation } from 'next-intl/navigation'
import { defineRouting } from 'next-intl/routing'

export type Locale = 'en' | 'ar'

export const routing = defineRouting({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
})

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing)
