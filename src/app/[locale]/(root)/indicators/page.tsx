/* eslint-disable @typescript-eslint/no-explicit-any */
import Indicators from '@/components/screens/indicators/Indicators'
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

export default async function IndicatorsPage() {
  return <Indicators />
}
