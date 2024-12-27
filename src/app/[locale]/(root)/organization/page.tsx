/* eslint-disable @typescript-eslint/no-explicit-any */
import OrganizationsComponent from '@/components/screens/organizations/OrganizationsComponent'
import { getAllOrganizations } from '@/lib/actions/organizationActions'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
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
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['organizations'],
    queryFn: async () => await getAllOrganizations(),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OrganizationsComponent />
    </HydrationBoundary>
  )
}
