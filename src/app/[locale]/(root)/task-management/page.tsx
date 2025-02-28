/* eslint-disable @typescript-eslint/no-explicit-any */
import TaskManagement from '@/components/screens/taskManagement/TaskManagement'
import { getMessages } from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages: any = await getMessages({ locale })
  const title = messages?.NavbarLinks?.taskManagement

  return {
    title,
  }
}

export default async function TaskManagementPage() {
  return <TaskManagement />
}
