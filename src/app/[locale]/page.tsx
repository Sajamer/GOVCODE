/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTranslations } from 'next-intl'
import { getMessages } from 'next-intl/server'

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

export default function Home({ params }: { params: { locale: string } }) {
  const t = useTranslations('HomePage')
  const { locale } = params
  const isArabic = locale === 'ar'

  return (
    <div className="flex w-full" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="text-3xl font-bold mt-20">{t('title')}</div>
    </div>
  )
}
