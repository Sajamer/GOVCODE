import { createNavigation } from 'next-intl/navigation'
import { defineRouting } from 'next-intl/routing'

export type Locale = 'en' | 'ar'

const Locales = ['en', 'ar'] as const

export const routing = defineRouting({
  locales: Locales,
  defaultLocale: 'en',
  localePrefix: 'as-needed',
})

export const { Link, redirect, usePathname, useRouter, permanentRedirect } =
  createNavigation(routing)
