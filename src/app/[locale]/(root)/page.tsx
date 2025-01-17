/* eslint-disable @typescript-eslint/no-explicit-any */
import KpiComponent from '@/components/screens/home/KpiComponent'
import { routing } from '@/i18n/routing'
import { getAllKPI } from '@/lib/actions/kpiActions'
import { getAllOrganizations } from '@/lib/actions/organizationActions'
import { auth, CustomUser } from '@/lib/auth'
import { userRole } from '@prisma/client'
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
  const user = await auth()
  const userData = user?.user as CustomUser | undefined

  const params = await data.searchParams

  const organizationId = params.organizationId || userData?.organizationId
  const departmentId = params.departmentId || userData?.departmentId

  if (!organizationId) console.error('organizationId is missing.')
  if (!departmentId) console.error('departmentId is missing.')

  await queryClient.prefetchQuery({
    queryKey: ['kpis'],
    queryFn: async () =>
      await getAllKPI(
        userData?.role as userRole,
        organizationId ? +organizationId : undefined,
        departmentId ? +departmentId : undefined,
      ),
  })

  await queryClient.prefetchQuery({
    queryKey: ['organizations'],
    queryFn: async () => await getAllOrganizations(),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <KpiComponent />
    </HydrationBoundary>
  )
}
