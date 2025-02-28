import { create } from 'zustand'
import { combine } from 'zustand/middleware'

export type SheetNames =
  | 'kpis'
  | 'organization'
  | 'userAccess'
  | 'userAccessManually'
  | 'dashboard'
  | 'tasks-management'
  | 'indicator'

type SheetProps = {
  rowId?: string
  sheetToOpen: SheetNames | undefined
  isEdit?: boolean
  isConfirmationModalOpen?: boolean
  searchTerm?: string
}

export const useSheetStore = create(
  combine(
    {
      sheetToOpen: undefined,
      isEdit: false,
      searchTerm: '',
    } as SheetProps,
    (set) => {
      return {
        actions: {
          openSheet: (data: SheetProps): void => set(data),
          closeSheet: (): void => {
            set({
              sheetToOpen: undefined,
              isEdit: false,
            })
          },
          openConfirmationModal: (isOpen: boolean): void =>
            set({ isConfirmationModalOpen: isOpen }),
          setSearchTerm: (term: string): void => set({ searchTerm: term }),
        },
      }
    },
  ),
)
