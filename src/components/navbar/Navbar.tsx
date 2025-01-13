'use client'

import { getAllOrganizations } from '@/lib/actions/organizationActions'
import { CustomUser } from '@/lib/auth'
import { useGlobalStore } from '@/stores/global-store'
import { userRole } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useLocale } from 'next-intl'
import { FC, useEffect } from 'react'
import BasicDropdown from '../shared/dropdowns/BasicDropdown'
import LocaleSwitcher from '../shared/dropdowns/LocalSwitcher'
import ThemeSwitcher from '../shared/ThemeSwitcher'

const Navbar: FC = () => {
  const locale = useLocale()
  const isArabic = locale === 'ar'

  const { data } = useSession()
  const userData = data?.user as CustomUser | undefined

  const { organizationId, actions } = useGlobalStore((state) => state)
  const { setOrganizationId, setDepartmentId, setHasPermission } = actions

  const { data: dbOrgData, isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      await getAllOrganizations()
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!userData,
  })

  const organizationData: IOrganization[] = dbOrgData || []
  const organizationOptions = organizationData?.map((option) => ({
    id: String(option?.id),
    label: option?.name,
    value: option?.name,
  }))

  const componentToShow = (role?: userRole) => {
    switch (role) {
      case 'superAdmin':
        return (
          <BasicDropdown
            data={organizationOptions ?? []}
            placeholder="Select Organization"
            triggerStyle="h-11 justify-end"
            wrapperStyle="w-40"
            containerStyle="max-w-48 w-full"
            defaultValue={organizationOptions?.find(
              (option) => option.id === organizationId.toString(),
            )}
            callback={(option) => setOrganizationId(+option.id)}
          />
        )
      case 'moderator':
        return (
          <div className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-400 dark:border-gray-500 dark:text-gray-500">
            {userData?.organization}
          </div>
        )
      case 'contributor':
        return (
          <div className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-400 dark:border-gray-500 dark:text-gray-500">
            {userData?.organization + '-' + userData?.department} department
          </div>
        )
      case 'userDepartment':
        return (
          <div className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-400 dark:border-gray-500 dark:text-gray-500">
            {userData?.department} department
          </div>
        )
      case 'userOrganization':
        return (
          <div className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-400 dark:border-gray-500 dark:text-gray-500">
            {userData?.department} department
          </div>
        )
      default:
        return <></>
    }
  }

  useEffect(() => {
    if (userData) {
      setOrganizationId(userData.organizationId)
      setDepartmentId(userData.departmentId)

      if (
        userData.role === 'userDepartment' ||
        userData.role === 'userOrganization'
      ) {
        setHasPermission(false)
      } else {
        setHasPermission(true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData])

  return (
    <div
      className="flex w-full justify-between px-5 pt-4"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="flex w-full items-center justify-end gap-1">
        <ThemeSwitcher />
        <LocaleSwitcher />
        <div className="w-fit">
          {!isLoading && componentToShow(userData?.role as userRole)}
        </div>
      </div>
    </div>
  )
}

export default Navbar
