/* eslint-disable @typescript-eslint/no-explicit-any */
import KpiChartsComponent from '@/components/screens/charts/KpiChartsComponent'
import { getKPIByIdAndYearFilter } from '@/lib/actions/kpiActions'
import { getMessages } from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages: any = await getMessages({ locale })
  const title = messages?.NavbarLinks?.kpiChart

  return {
    title,
  }
}

export default async function KpiCharts({
  params,
}: {
  params: Promise<{ kpiId: string }>
}) {
  const { kpiId } = await params

  const data = await getKPIByIdAndYearFilter(+kpiId)

  return <KpiChartsComponent data={data} />
}
