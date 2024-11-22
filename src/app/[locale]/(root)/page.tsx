/* eslint-disable @typescript-eslint/no-explicit-any */
import KpiComponent from '@/components/screens/home/KpiComponent'
import { routing } from '@/i18n/routing'
import prisma from '@/lib/db_connection'
import { getMessages } from 'next-intl/server'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages: any = await getMessages({ locale })
  const title = messages?.NavbarLinks?.homeTitle

  return {
    title,
  }
}

export default async function Home(data: {
  searchParams: Promise<Record<string, string>>
}) {
  // const user = await auth()
  const params = await data.searchParams

  const department = 18 // this needs to be a property in user.
  const limit = +(params.limit ?? '10')
  const page = +(params.page ?? '1')

  // we need to use skip and take in prisma to get the data

  const skip = (page - 1) * limit

  const kpis = await prisma.kPI.findMany({
    where: {
      departmentId: department,
    },
    skip,
    take: limit,
  })

  console.log('kpis: ', kpis)

  // const t = useTranslations('HomePage')

  return <KpiComponent data={kpis} />
}
