import { SheetNames, useSheetStore } from '@/stores/sheet-store'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Edit2, Trash } from 'lucide-react'
import { FC } from 'react'

interface IGenericTableActionButtonsProps {
  rowId: string
  callback: () => void
  sheetName: SheetNames
}

const GenericTableActionButtons: FC<IGenericTableActionButtonsProps> = ({
  rowId,
  callback,
  sheetName,
}) => {
  const { openSheet } = useSheetStore((store) => store.actions)

  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton className="inline-flex justify-center p-2 text-sm font-medium text-gray-700 focus:outline-none">
        <DotsHorizontalIcon className="size-5" aria-hidden="true" />
      </MenuButton>
      <MenuItems className="absolute right-0 z-50 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg  focus:outline-none">
        <div className="py-1">
          <MenuItem>
            {({ active }) => (
              <button
                onClick={() =>
                  openSheet({
                    sheetToOpen: sheetName,
                    rowId,
                    isEdit: true,
                  })
                }
                className={`${
                  active ? 'bg-gray-100' : ''
                } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
              >
                <Edit2 size={16} className="mr-2" />
                <span>Edit</span>
              </button>
            )}
          </MenuItem>
          <MenuItem>
            {({ active }) => (
              <button
                onClick={callback}
                className={`${
                  active ? 'bg-red-100' : ''
                } flex w-full items-center px-4 py-2 text-sm text-red-600`}
              >
                <Trash size={16} className="mr-2" />
                <span>Delete</span>
              </button>
            )}
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  )
}

export default GenericTableActionButtons
