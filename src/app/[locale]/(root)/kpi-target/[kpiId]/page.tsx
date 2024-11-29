/* eslint-disable @typescript-eslint/no-explicit-any */
import KpiTargetComponent from '@/components/screens/home/KpiTargetComponent'
import { getKPIByIdIncludingKPITarget } from '@/lib/actions/kpiActions'
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

export default async function KpiTarget({
  params,
}: {
  params: Promise<{ kpiId: string }>
}) {
  const { kpiId } = await params

  const data = await getKPIByIdIncludingKPITarget(+kpiId)

  return <KpiTargetComponent data={data} />
}
