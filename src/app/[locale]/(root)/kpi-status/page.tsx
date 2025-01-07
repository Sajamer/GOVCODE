/* eslint-disable @typescript-eslint/no-explicit-any */
import KpiStatusComponent from '@/components/screens/status/KpiStatusComponent'
import { getMessages } from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages: any = await getMessages({ locale })
  const title = messages?.NavbarLinks?.kpiStatus

  return {
    title,
  }
}

export default async function KpiStatus() {
  return <KpiStatusComponent />
}
