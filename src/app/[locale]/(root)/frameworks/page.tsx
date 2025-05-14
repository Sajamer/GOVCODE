/* eslint-disable @typescript-eslint/no-explicit-any */
import Frameworks from '@/components/screens/frameworks/Frameworks'
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
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages: any = await getMessages({ locale })
  const title = messages?.NavbarLinks?.frameworks

  return {
    title,
  }
}

const queryClient = new QueryClient()

export default async function FrameworksPage() {
  await queryClient.prefetchQuery({
    queryKey: ['frameworks'],
    queryFn: async () => await getAllFrameworks(),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Frameworks />
    </HydrationBoundary>
  )
}
