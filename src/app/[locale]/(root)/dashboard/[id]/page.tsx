/* eslint-disable @typescript-eslint/no-explicit-any */
import SingleDashboardComponent from '@/components/screens/dashboard/SingleDashboardComponent'
import { getDashboardById } from '@/lib/actions/dashboard.actions'
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

export default async function SingleDashboard({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const queryClient = new QueryClient()
  const { id } = await params
  const dashboardId = parseInt(id, 10)

  await queryClient.prefetchQuery({
    queryKey: ['dashboard', dashboardId],
    queryFn: async () => await getDashboardById(dashboardId),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SingleDashboardComponent dashboardId={dashboardId} />
    </HydrationBoundary>
  )
}
