import { useGlobalStore } from '@/stores/global-store'
import { SheetNames, useSheetStore } from '@/stores/sheet-store'
import { Archive, ArchiveRestore, Edit2, Trash } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { FC } from 'react'
import Tooltips from '../../tooltips/Tooltips'
import { FilterType } from './TasksTable'

interface ITaskActionButtonsProps {
  rowId: string
  callback: () => void
  archiveTask: () => void
  sheetName: SheetNames
  activeFilter: FilterType
}

const TaskActionButtons: FC<ITaskActionButtonsProps> = ({
  rowId,
  callback,
  archiveTask,
  sheetName,
  activeFilter,
}) => {
  const { openSheet } = useSheetStore((store) => store.actions)
  const t = useTranslations('general')
  const { hasPermission } = useGlobalStore((store) => store)
  const isArchived = activeFilter === 'archived-tasks'

  return (
    <div className="flex items-center justify-end gap-2">
      {hasPermission && (
        <>
          <Tooltips
            content={isArchived ? t('restore-archive') : t('archive')}
            variant="bold"
            position="top"
            asChild
          >
            <button onClick={archiveTask} className="text-gray-700">
              {isArchived ? (
                <ArchiveRestore size={16} />
              ) : (
                <Archive size={16} />
              )}
            </button>
          </Tooltips>
          {!isArchived && (
            <>
              <Tooltips
                content={t('edit')}
                variant="bold"
                position="top"
                asChild
              >
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
              <Tooltips
                content={t('delete')}
                variant="bold"
                position="top"
                asChild
              >
                <button onClick={callback} className="text-red-600">
                  <Trash size={16} />
                </button>
              </Tooltips>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default TaskActionButtons
