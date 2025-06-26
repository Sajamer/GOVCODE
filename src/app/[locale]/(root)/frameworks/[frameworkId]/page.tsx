/* eslint-disable @typescript-eslint/no-explicit-any */
import SingleComplianceFramework from '@/components/screens/complianceFrameworks/SingleComplianceFramework'
import { getFrameworkById } from '@/lib/actions/framework.actions'
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
  const title = messages?.NavbarLinks?.frameworks

  return {
    title,
  }
}

export default async function FrameworksPage({
  params,
}: {
  params: Promise<{ frameworkId: string }>
}) {
  const { frameworkId } = await params

  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['single-framework', frameworkId],
    queryFn: () => getFrameworkById(frameworkId),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SingleComplianceFramework />
    </HydrationBoundary>
  )
}
