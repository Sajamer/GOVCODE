import { create } from 'zustand'
import { combine } from 'zustand/middleware'

type GlobalProps = {
  organizationId: number
  departmentId: number
  hasPermission: boolean
}

export const useGlobalStore = create(
  combine(
    {
      organizationId: 0,
      departmentId: 0,
      hasPermission: false,
    } as GlobalProps,
    (set) => {
      return {
        actions: {
          setOrganizationId: (id: number) => set({ organizationId: id }),
          setDepartmentId: (id: number) => set({ departmentId: id }),
          setHasPermission: (permission: boolean) =>
            set({ hasPermission: permission }),
        },
      }
    },
  ),
)
