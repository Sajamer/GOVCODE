'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { getTasksByAuditDetailId } from '@/lib/actions/task.actions'
import { generateTableData } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { Clock, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { FC, useMemo } from 'react'
import TableComponent from '../tables/TableComponent'

interface IShowAuditTasksDialogProps {
  open: boolean
  onClose: () => void
  auditDetailId?: string
  title?: string
}

const ShowAuditTasksDialog: FC<IShowAuditTasksDialogProps> = ({
  onClose,
  open,
  auditDetailId,
  title,
}) => {
  const t = useTranslations('general')

  const { data, isLoading } = useQuery({
    queryKey: ['audit-tasks', auditDetailId],
    queryFn: async () => {
      if (!auditDetailId) return []
      return await getTasksByAuditDetailId(auditDetailId)
    },
    enabled: !!auditDetailId && open,
    staleTime: 5 * 60 * 1000,
  })

  const entityData = useMemo(() => data ?? [], [data])
  const columns = [
    { key: 'name' as const, isSortable: false, type: 'string' as CellType },
    {
      key: 'description' as const,
      isSortable: false,
      type: 'string' as CellType,
    },
    { key: 'startDate' as const, isSortable: false, type: 'date' as CellType },
    { key: 'dueDate' as const, isSortable: false, type: 'date' as CellType },
    {
      key: 'actualEndDate' as const,
      isSortable: false,
      type: 'date' as CellType,
    },
    {
      key: 'priority' as const,
      isSortable: false,
      type: 'priority' as CellType,
    },
    { key: 'status' as const, isSortable: false, type: 'status' as CellType },
  ]

  const { headers, values } = generateTableData(entityData, columns)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        aria-describedby={undefined}
        className="flex h-fit w-full max-w-[95%] flex-col items-center justify-center gap-[1.875rem] !rounded-[1.875rem] border-none bg-zinc-50 p-4 sm:h-fit sm:max-w-[80%] sm:p-[1.875rem]"
      >
        <div className="flex w-full flex-col items-start justify-center gap-2">
          <DialogTitle className="w-full text-center text-2xl font-medium text-zinc-900">
            {title ? `${t('tasks')} for - ${title}` : t('audit-tasks')}
          </DialogTitle>
          <DialogDescription className="sr-only w-full text-sm text-zinc-500">
            View all tasks related to this audit detail
          </DialogDescription>
        </div>

        <div className="max-h-[70vh] w-full overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-8 animate-spin" />
            </div>
          ) : !values || values.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Clock className="mb-4 size-16 text-gray-300" />
              <p className="text-lg font-medium">{t('no-tasks-found')}</p>
              <p className="text-sm">{t('no-tasks-audit-detail')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <TableComponent data={values} headers={headers} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ShowAuditTasksDialog
