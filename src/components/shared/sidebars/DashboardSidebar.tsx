'use client'

import { Icons } from '@/components/icons/Icons'
import Tooltips from '@/components/shared/tooltips/Tooltips'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
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
import AccordionSidebar from '../accordion/AccordionSidebar'

const DashboardSidebar: FC = () => {
  const { isSidebarOpened, setIsSidebarOpened } = useAdminDashboard()
  const sidebarItems = SidebarItems()
  const t = useTranslations('AuthenticationPage')
  const pathname = usePathname()
  const isArabic = pathname.includes('/ar')
  const normalizedPathname = isArabic
    ? pathname.replace(/^\/?ar\/?/, '') || '/'
    : pathname

  // Compare normalized current path with normalized item path
  const isActiveLink = (itemHref: string) => {
    const normalizedItemHref =
      itemHref === '/' ? itemHref : itemHref.replace(/^\//, '')
    const normalizedCurrentPath =
      normalizedPathname === '/'
        ? normalizedPathname
        : normalizedPathname.replace(/^\//, '')
    return normalizedCurrentPath === normalizedItemHref
  }

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
            'flex items-center justify-center gap-3 px-4',
            isSidebarOpened && 'px-3',
          )}
        >
          <h1
            className={cn(
              'text-3xl font-bold text-primary dark:text-white text-center whitespace-nowrap transition-opacity duration-500 pt-[1.5rem]',
              isSidebarOpened ? 'opacity-100' : 'opacity-0',
            )}
          >
            GovCode
          </h1>
        </div>

        <nav className="styleScrollbar mt-6 flex h-[calc(100%-200px)] w-full flex-col items-center justify-start overflow-y-auto overflow-x-hidden">
          {filteredSidebarItems.map((item, index) => (
            <div key={index} className="flex w-full flex-col items-center px-4">
              {item.submenu ? (
                <AccordionSidebar
                  title={item.title}
                  path={item.href || ''}
                  icon={item.icon}
                  data={item.submenu.map((sub) => sub.title)}
                />
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    'w-full flex justify-center items-center gap-3 font-semibold text-base duration-75 py-2 hover:text-primary lg:justify-start',
                    isArabic ? 'lg:pr-5' : 'lg:pl-5',
                    isActiveLink(item.href)
                      ? 'bg-primary rounded-xl text-white hover:text-white'
                      : ' dark:text-white dark:hover:text-primary',
                  )}
                >
                  {isSidebarOpened ? (
                    item.icon
                  ) : (
                    <Tooltips
                      content={item.title}
                      variant="bold"
                      position="bottom"
                    >
                      {item.icon}
                    </Tooltips>
                  )}
                  <p
                    className={cn(
                      'text-base font-medium transition-opacity duration-500',
                      isSidebarOpened ? 'opacity-100' : 'opacity-0',
                    )}
                  >
                    {item.title}
                  </p>
                </Link>
              )}
            </div>
          ))}
        </nav>

        <div className="relative flex w-full flex-col items-center justify-start gap-5 font-semibold text-accent duration-75 dark:text-white lg:justify-start lg:px-6">
          <div className="flex w-full items-center justify-center gap-4 lg:justify-start">
            <Avatar className="size-10">
              <AvatarImage
                src={userData?.image || '/assets/images/avatar-placeholder.png'}
                alt="avatar"
              />
            </Avatar>
            <div
              className={cn(
                'flex-col',
                isSidebarOpened ? 'flex duration-200' : 'hidden',
              )}
            >
              <span className="text-xs font-semibold text-gray-400">
                {t('Logged-in-as')}
              </span>
              <Link
                href={'/my-profile'}
                className="line-clamp-1 whitespace-normal text-sm font-semibold text-black hover:underline dark:text-white"
              >
                {userData?.fullName}
              </Link>
            </div>
          </div>
          <div className="w-full">
            <Button
              variant={'outline'}
              className="w-full justify-center border border-primary text-primary hover:bg-primary hover:text-white"
              onClick={() => signOut()}
            >
              <Icons.PowerSymbol />
              {isSidebarOpened && t('logout')}
            </Button>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default DashboardSidebar
