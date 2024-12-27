/* eslint-disable @typescript-eslint/no-explicit-any */
import AcceptInvitationComponent from '@/components/screens/acceptInvitation/AcceptInvitationComponent'
import { getMessages } from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages: any = await getMessages({ locale })
  const title = messages?.NavbarLinks?.acceptInvitation

  return {
    title,
  }
}

export default async function AcceptInvitationPage() {
  return <AcceptInvitationComponent />
}
