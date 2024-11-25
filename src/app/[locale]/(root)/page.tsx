/* eslint-disable @typescript-eslint/no-explicit-any */
import KpiComponent from '@/components/screens/home/KpiComponent'
import { routing } from '@/i18n/routing'
import { getAllKPI } from '@/lib/actions/kpiActions'
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

export default async function Home(data: {
  searchParams: Promise<Record<string, string>>
}) {
  // const user = await auth()
  const params = await data.searchParams

  const kpis = await getAllKPI(params)

  return <KpiComponent data={kpis} />
}
