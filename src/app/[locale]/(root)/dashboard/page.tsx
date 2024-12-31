/* eslint-disable @typescript-eslint/no-explicit-any */
import DashboardComponent from '@/components/screens/dashboard/DashboardComponent'
import { getAllDashboards } from '@/lib/actions/dashboard.actions'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import { getMessages } from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages: any = await getMessages({ locale })
  const title = messages?.NavbarLinks?.dashboard

  return {
    title,
  }
}

export default async function Dashboard() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['dashboards'],
    queryFn: async () => await getAllDashboards(),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardComponent />
    </HydrationBoundary>
  )
}
