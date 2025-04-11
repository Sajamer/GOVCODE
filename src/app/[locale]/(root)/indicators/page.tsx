/* eslint-disable @typescript-eslint/no-explicit-any */
import Indicators from '@/components/screens/indicators/Indicators'
import { getAllIndicators } from '@/lib/actions/indicator.actions'
import {  dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { getMessages } from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages: any = await getMessages({ locale })
  const title = messages?.NavbarLinks?.indicators

  return {
    title,
  }
}

const queryClient = new QueryClient()

export default async function IndicatorsPage() {

    await queryClient.prefetchQuery({
      queryKey: ['indicators'],
      queryFn: async () => await getAllIndicators(),
    })

  return  (
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Indicators />
        </HydrationBoundary>
  )
}
