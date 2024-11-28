/* eslint-disable @typescript-eslint/no-explicit-any */
import KpiComponent from '@/components/screens/home/KpiComponent'
import { routing } from '@/i18n/routing'
import { getAllKPI } from '@/lib/actions/kpiActions'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
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

const queryClient = new QueryClient()

export default async function Home(data: {
  searchParams: Promise<Record<string, string>>
}) {
  // const user = await auth()
  const params = await data.searchParams

  await queryClient.prefetchQuery({
    queryKey: ['kpis'],
    queryFn: async () => await getAllKPI(params),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <KpiComponent />
    </HydrationBoundary>
  )
}
