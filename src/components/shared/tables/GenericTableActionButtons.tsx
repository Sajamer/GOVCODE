import { Link } from '@/i18n/routing'
import { SheetNames, useSheetStore } from '@/stores/sheet-store'
import { Crosshair, Edit2, Target, Trash } from 'lucide-react'
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
        <Link href={`/kpi-target/${rowId}`}>
          <Target size={16} className="text-secondary" />
        </Link>
      </Tooltips>
      <Tooltips content="Actuals" variant="bold" position="top" asChild>
        <Link href={`/kpi-actual-target/${rowId}`}>
          <Crosshair size={16} className="text-secondary" />
        </Link>
      </Tooltips>
    </div>
  )
}

export default GenericTableActionButtons
