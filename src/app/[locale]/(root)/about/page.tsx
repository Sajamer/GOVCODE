import { useLocale, useTranslations } from 'next-intl'
import { getMessages } from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messages: any = await getMessages({ locale })
  const title = messages?.NavbarLinks?.aboutTitle

  return {
    title,
  }
}

export default function About() {
  const t = useTranslations('AboutPage')
  const locale = useLocale()

  const isArabic = locale === 'ar'

  return (
    <div className="flex w-full flex-col" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="mt-20 text-5xl font-bold">{t('title')}</div>
    </div>
  )
}
