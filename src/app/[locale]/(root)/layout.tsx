import ComponentWrapper from '@/components/shared/ComponentWrapper'
import DashboardSidebar from '@/components/shared/sidebars/DashboardSidebar'
import { auth } from '@/lib/auth'
import { SessionProvider } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { FC } from 'react'

type Props = {
  children: React.ReactNode
}

const AdminDashboardLayout: FC<Props> = async ({ children }) => {
  const session = await auth()

  if (!session) {
    redirect('/sign-in')
  }
  return (
    <SessionProvider session={session}>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar />
        <div className="min-h-screen w-full bg-gray-100 dark:bg-gray-300">
          <ComponentWrapper>{children}</ComponentWrapper>
        </div>
      </div>
    </SessionProvider>
  )
}

export default AdminDashboardLayout
