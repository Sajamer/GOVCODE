/* eslint-disable @typescript-eslint/no-explicit-any */
import OrganizationDetailsComponent from '@/components/screens/organizations/OrganizationDetailsComponent'
import { getOrganizationById } from '@/lib/actions/organizationActions'
import { getMessages } from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages: any = await getMessages({ locale })
  const title = messages?.NavbarLinks?.organizations

  return {
    title,
  }
}

export default async function OrganizationDetails({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const data = await getOrganizationById(+id)

  return <OrganizationDetailsComponent data={data} />
}
