import { create } from 'zustand'

interface IAdminDashboardStore {
  isSidebarOpened: boolean
  setIsSidebarOpened: (value: boolean) => void
}

export const useAdminDashboard = create<IAdminDashboardStore>((set) => ({
  isSidebarOpened: true,
  setIsSidebarOpened: (value: boolean): void => set({ isSidebarOpened: value }),
}))
