import ComponentWrapper from '@/components/shared/ComponentWrapper'
import DashboardSidebar from '@/components/shared/sidebars/DashboardSidebar'
import { FC } from 'react'

type Props = {
  children: React.ReactNode
}

const AdminDashboardLayout: FC<Props> = async ({ children }) => {
  return (
    <div className="flex h-screen w-full">
      <DashboardSidebar />
      <div className="h-screen w-full bg-gray-100 dark:bg-gray-300">
        <ComponentWrapper>{children}</ComponentWrapper>
      </div>
    </div>
  )
}

export default AdminDashboardLayout
