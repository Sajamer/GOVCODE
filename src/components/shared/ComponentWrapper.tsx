'use client'

import { useAdminDashboard } from '@/hooks/useAdminDashboard'
import { cn } from '@/lib/utils'
import { FC } from 'react'
import Navbar from '../navbar/Navbar'
import { useLocale } from 'next-intl'

interface IComponentWrapperProps {
  children: React.ReactNode
}

const ComponentWrapper: FC<IComponentWrapperProps> = ({ children }) => {
  const { isSidebarOpened } = useAdminDashboard()
  const locale = useLocale()
  const isArabic = locale === 'ar'

  return (
    <div
      className={cn(
        'w-full h-screen transition-all duration-500 flex flex-col justify-start items-start',
        isSidebarOpened
          ? isArabic
            ? 'pr-[17rem]'
            : 'pl-[17rem]'
          : isArabic
            ? 'pr-20'
            : 'pl-20',
      )}
    >
      <Navbar />
      <div className="flex w-full flex-1 flex-col items-start justify-start p-6">
        {children}
      </div>
    </div>
  )
}

export default ComponentWrapper
