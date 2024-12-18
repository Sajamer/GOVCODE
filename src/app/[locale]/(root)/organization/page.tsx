/* eslint-disable @typescript-eslint/no-explicit-any */
import OrganizationsComponent from '@/components/screens/organizations/OrganizationsComponent'
import { getAllOrganizations } from '@/lib/actions/organizationActions'
import { auth } from '@/lib/auth'
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

export default async function Organization() {
  const data = await getAllOrganizations()
  const session = await auth()

  if (session && session.user && session.user.role === 'admin') {
  }
  return <OrganizationsComponent data={data} />
}
