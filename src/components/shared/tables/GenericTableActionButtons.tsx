import { SheetNames, useSheetStore } from '@/stores/sheet-store'
import { Edit2, Target, Trash } from 'lucide-react'
import { FC } from 'react'
import Tooltips from '../tooltips/Tooltips'

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
    <div className="flex items-center justify-end gap-2">
      <Tooltips content="Edit" variant="bold" position="top" asChild>
        <button
          onClick={() =>
            openSheet({
              sheetToOpen: sheetName,
              rowId,
              isEdit: true,
            })
          }
          className="text-gray-700"
        >
          <Edit2 size={16} />
        </button>
      </Tooltips>
      <Tooltips content="Delete" variant="bold" position="top" asChild>
        <button onClick={callback} className="text-red-600">
          <Trash size={16} />
        </button>
      </Tooltips>
      <Tooltips content="Target" variant="bold" position="top" asChild>
        <button>
          <Target size={16} className="text-secondary" />
        </button>
      </Tooltips>
    </div>
  )
}

export default GenericTableActionButtons
