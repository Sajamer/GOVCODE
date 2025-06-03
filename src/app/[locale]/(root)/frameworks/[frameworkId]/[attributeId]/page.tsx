/* eslint-disable @typescript-eslint/no-explicit-any */
import FrameworkAttributeDetail from '@/components/screens/complianceFrameworks/FrameworkAttributeDetail';
import { getAllFrameworks } from '@/lib/actions/framework.actions'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import { getMessages } from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; frameworkId: string; attributeId: string }>
}) {
  const { locale } = await params
  const messages: any = await getMessages({ locale })
  const title = messages?.NavbarLinks?.frameworks

  return {
    title: `${title} - Details`,
  }
}

interface PageProps {
  params: Promise<{
    locale: string
    frameworkId: string
    attributeId: string
  }>
}

export default async function FrameworkAttributeDetailPage({
  params,
}: PageProps) {
  const { frameworkId, attributeId } = await params
  
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['frameworks'],
    queryFn: () => getAllFrameworks(),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FrameworkAttributeDetail
        frameworkId={frameworkId}
        attributeId={attributeId}
      />
    </HydrationBoundary>
  )
}
