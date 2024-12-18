'use client'

import { Icons } from '@/components/icons/Icons'
import Tooltips from '@/components/shared/tooltips/Tooltips'
import { Button } from '@/components/ui/button'
import { SidebarItems } from '@/constants/sidebar-constants'
import { useAdminDashboard } from '@/hooks/useAdminDashboard'
import { CustomUser } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FC } from 'react'

const DashboardSidebar: FC = () => {
  const { isSidebarOpened, setIsSidebarOpened } = useAdminDashboard()
  const sidebarItems = SidebarItems()
  const t = useTranslations('AuthenticationPage')

  const pathname = usePathname()
  const isArabic = pathname.includes('/ar')
  const normalizedPathname = isArabic
    ? pathname.replace(/^\/?ar\/?/, '') || '/'
    : pathname

  const { data } = useSession()
  const userData = data?.user as CustomUser | undefined
  const role = userData?.role ?? 'user'

  const filteredSidebarItems = sidebarItems.filter((item) => {
    if (!item.permissions) return true
    return item.permissions.includes(role)
  })

  return (
    <aside
      dir={isArabic ? 'rtl' : 'ltr'}
      className={cn(
        'fixed bg-background h-full transition-all duration-500 ease-in-out scroll-smooth z-20 lg:opacity-100 lg:flex flex-col border-r border-border',
        isSidebarOpened
          ? isArabic
            ? 'w-[17rem] transform translate-x-0 right-0'
            : 'w-[17rem] transform translate-x-0 left-0'
          : isArabic
            ? 'sm:w-20 sm:right-0 transform translate-x-0'
            : 'sm:w-20 sm:left-0 transform translate-x-0',
      )}
    >
      <Button
        variant={'outline'}
        size={'ghost'}
        className={cn(
          'absolute top-8 z-10 size-8 rounded-full',
          isArabic ? '-left-4' : '-right-4',
        )}
        onClick={() => setIsSidebarOpened(!isSidebarOpened)}
      >
        <ArrowRight
          size={24}
          className={cn(
            'transition-transform duration-500 text-primary',
            isSidebarOpened
              ? isArabic
                ? 'rotate-0'
                : '-rotate-180'
              : isArabic
                ? 'rotate-180'
                : 'rotate-0',
          )}
        />
      </Button>
      <div className="size-full">
        <div
          className={cn(
            'flex items-center justify-start gap-3 px-4',
            isSidebarOpened && 'px-3',
          )}
        >
          <h1
            className={cn(
              'text-2xl font-bold text-secondary-foreground whitespace-nowrap transition-opacity duration-500 pt-[1.5rem]',
              isSidebarOpened ? 'opacity-100' : 'opacity-0',
            )}
          >
            logo + Govcode
          </h1>
        </div>

        <nav className="styleScrollbar mt-6 flex h-[calc(100%-140px)] w-full flex-col overflow-y-auto overflow-x-hidden">
          {filteredSidebarItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={cn(
                'flex items-center justify-start gap-2 px-6 py-3 w-full',
                normalizedPathname === item.href
                  ? 'bg-primary hover:opacity-90 text-primary-foreground'
                  : 'hover:bg-primary hover:opacity-80 hover:text-primary-foreground',
                normalizedPathname !== item.href && !isSidebarOpened && 'py-0',
              )}
            >
              {isSidebarOpened ? (
                item.icon
              ) : (
                <Tooltips content={item.title} variant="bold" position="bottom">
                  {item.icon}
                </Tooltips>
              )}

              <p
                className={cn(
                  'text-lg font-medium transition-opacity duration-500',
                  isSidebarOpened ? 'opacity-100' : 'opacity-0',
                )}
              >
                {item.title}
              </p>
            </Link>
          ))}
        </nav>

        <div className="w-full px-4">
          <Button className="w-full justify-start" onClick={() => signOut()}>
            <Icons.PowerSymbol />
            {isSidebarOpened && t('logout')}
          </Button>
        </div>
      </div>
    </aside>
  )
}

export default DashboardSidebar
