/* eslint-disable @typescript-eslint/no-explicit-any */
import KpiActualComponent from '@/components/screens/home/KpiActualComponent'
import { getKPIByIdIncludingKPIActualTargets } from '@/lib/actions/kpiActions'
import { getMessages } from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages: any = await getMessages({ locale })
  const title = messages?.NavbarLinks?.kpiTarget

  return {
    title,
  }
}

export default async function KpiActualTarget({
  params,
}: {
  params: Promise<{ kpiId: string }>
}) {
  const { kpiId } = await params

  const data = await getKPIByIdIncludingKPIActualTargets(+kpiId)

  return <KpiActualComponent data={data} />
}
