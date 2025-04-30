/* eslint-disable @typescript-eslint/no-explicit-any */
import IndicatorDetail from '@/components/screens/indicators/IndicatorDetail'
import { getIndicator } from '@/lib/actions/indicator.actions'
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

export default async function IndicatorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const data = await getIndicator(id)

  return <IndicatorDetail data={data} />
}
