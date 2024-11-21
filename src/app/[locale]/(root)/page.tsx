/* eslint-disable @typescript-eslint/no-explicit-any */
import { routing } from '@/i18n/routing'
import { useLocale, useTranslations } from 'next-intl'
import { getMessages } from 'next-intl/server'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages: any = await getMessages({ locale })
  const title = messages?.NavbarLinks?.homeTitle

  return {
    title,
  }
}

export default function Home() {
  const t = useTranslations('HomePage')
  const locale = useLocale()

  const isArabic = locale === 'ar'

  return (
    <div className="flex w-full flex-col" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="text-5xl font-bold">{t('title')}</div>
    </div>
  )
}
