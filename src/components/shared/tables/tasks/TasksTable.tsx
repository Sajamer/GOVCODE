import TaskManagementForm from '@/components/forms/TaskManagementForm'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import {
  archiveTask,
  deleteTaskById,
  restoreTask,
} from '@/lib/actions/task.actions'
import { CustomUser } from '@/lib/auth'
import { generateTableData, searchObjectValueRecursive } from '@/lib/utils'
import { useGlobalStore } from '@/stores/global-store'
import { SheetNames, useSheetStore } from '@/stores/sheet-store'
import { ITasksManagementResponse } from '@/types/tasks'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ChartSpline, Loader2, Plus } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import PageHeader from '../../headers/PageHeader'
import ConfirmationDialog from '../../modals/ConfirmationDialog'
import NoResultFound from '../../NoResultFound'
import SheetComponent from '../../sheets/SheetComponent'
import TableComponent from '../TableComponent'
import TaskActionButtons from './TaskActionButtons'

export type FilterType = 'my-tasks' | 'assigned-tasks' | 'archived-tasks'

interface IGenericTableProps<T extends Record<string, unknown>> {
  title: string
  description: string
  icon?: JSX.Element
  entityKey: keyof T
  sheetName: SheetNames
  data: T[]
  isLoading?: boolean
  columns: Array<{
    key: keyof T | 'actions'
    isSortable: boolean
    type: CellType
  }>
}

const TasksTable = <T extends Record<string, unknown>>({
  title,
  description,
  icon,
  entityKey,
  sheetName,
  columns,
  isLoading,
  data,
}: IGenericTableProps<T>): JSX.Element => {
  const queryClient = useQueryClient()
  const t = useTranslations('general')
  const pathname = usePathname()
  const isArabic = pathname.includes('/ar')
  const { data: session } = useSession()
  const user = session?.user as CustomUser | undefined

  const totalTaskRef = useRef(0)

  const { actions, searchTerm, sheetToOpen, isEdit, rowId } = useSheetStore(
    (store) => store,
  )
  const { openSheet, setSearchTerm } = actions
  const { hasPermission } = useGlobalStore((store) => store)

  const [openConfirmation, setOpenConfirmation] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<FilterType>('my-tasks')

  const entityData = useMemo(() => data ?? [], [data])

  const filteredData = useMemo(() => {
    // First apply search filter
    let filtered = entityData.filter(
      (entity) => !searchTerm || searchObjectValueRecursive(entity, searchTerm),
    )

    // Then apply task type filter
    filtered = filtered.filter((task) => {
      const typedTask = task as unknown as ITasksManagementResponse
      let conditionMet = false

      switch (activeFilter) {
        case 'my-tasks':
          conditionMet =
            typedTask.assignees.some((assignee) => assignee.id === user?.id) &&
            !typedTask.isArchived
          break
        case 'assigned-tasks':
          conditionMet =
            typedTask.allocatorId === user?.id && !typedTask.isArchived
          break
        case 'archived-tasks':
          conditionMet = typedTask.isArchived
          break
        default:
          conditionMet =
            typedTask.assignees.some((assignee) => assignee.id === user?.id) &&
            !typedTask.isArchived
          break
      }

      return conditionMet
    })

    // Update totalTask count based on filtered tasks
    totalTaskRef.current = filtered.length

    return filtered
  }, [entityData, searchTerm, activeFilter, user?.id])

  const { mutate, isPending } = useMutation({
    mutationFn: async () => await deleteTaskById(Number(selectedId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [sheetName as string] })
      setOpenConfirmation(false)
      toast({
        variant: 'success',
        title: 'Deleted Successfully',
        description: `${title} successfully deleted`,
      })
    },
    onError: (error) => {
      setOpenConfirmation(false)
      toast({
        variant: 'destructive',
        title: 'Deletion failed',
        description:
          error instanceof Error ? error.message : 'An error occurred.',
      })
    },
  })

  const { mutate: archiveMutate } = useMutation({
    mutationFn: (id: number) => archiveTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [sheetName as string] })
      toast({
        variant: 'success',
        title: 'Task Archived Successfully',
        description: `${title} successfully archived`,
      })
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Task Archive failed',
        description:
          error instanceof Error ? error.message : 'An error occurred.',
      })
    },
  })

  const { mutate: restoreMutate } = useMutation({
    mutationFn: (id: number) => restoreTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [sheetName as string] })
      toast({
        variant: 'success',
        title: 'Task Restored Successfully',
        description: `${title} successfully restored`,
      })
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Task restore failed',
        description:
          error instanceof Error ? error.message : 'An error occurred.',
      })
    },
  })

  const { headers, values } = generateTableData(filteredData, columns)

  useEffect(() => {
    setSearchTerm('')
  }, [setSearchTerm])

  const tableActions = (rowData: T): JSX.Element => (
    <TaskActionButtons
      rowId={rowData[entityKey] as string}
      callback={() => {
        setSelectedId(rowData[entityKey] as string)
        setOpenConfirmation(true)
      }}
      activeFilter={activeFilter}
      archiveTask={() => {
        const id = rowData[entityKey] as number
        if (activeFilter === 'archived-tasks') {
          restoreMutate(id)
        } else {
          archiveMutate(id)
        }
      }}
      sheetName={sheetName as SheetNames}
    />
  )

  const singleEntityData = isEdit
    ? (entityData.find((r) => r[entityKey] === rowId) as T | undefined)
    : undefined

  const localizedTitle = t(title)
  const showTabs = user?.role === 'superAdmin' || user?.role === 'moderator'

  return (
    <>
      <div
        dir={isArabic ? 'rtl' : 'ltr'}
        className="flex w-full flex-col items-start gap-[1.875rem]"
      >
        <PageHeader
          title={title}
          description={description}
          iconWrapper="bg-primary"
          icon={icon ?? <ChartSpline className="text-primary-foreground" />}
        >
          <SheetComponent
            sheetName={sheetName as SheetNames}
            title={
              isEdit
                ? `${t('edit')} ${localizedTitle}`
                : `${t('add-new')} ${localizedTitle}`
            }
            subtitle={
              isEdit
                ? `${t('edit')} ${localizedTitle} ${t('here')}`
                : `${t('define-new')} ${localizedTitle}`
            }
          >
            {sheetToOpen === 'tasks-management' ? (
              <TaskManagementForm
                data={singleEntityData as unknown as ITasksManagementResponse}
              />
            ) : null}
          </SheetComponent>
          {hasPermission && (
            <Button
              variant="default"
              onClick={() =>
                openSheet({
                  sheetToOpen: sheetName as SheetNames,
                  isEdit: false,
                })
              }
              className="flex size-[2.375rem] items-center justify-center !gap-[0.38rem] px-3 lg:h-11 lg:w-fit 2xl:w-[13.75rem]"
            >
              <Plus size="24" className="text-primary-foreground" />
              <span className="hidden text-sm font-medium lg:flex">
                {t('add-new') + ' ' + localizedTitle}
              </span>
            </Button>
          )}
        </PageHeader>

        <div className="flex w-full flex-col gap-[1.88rem]">
          {isLoading ? (
            <div className="flex min-h-[200px] w-full items-center justify-center">
              <Loader2 className="size-16 animate-spin" />
            </div>
          ) : entityData.length > 0 ? (
            <div className="flex flex-col items-start justify-start gap-5">
              <div className="flex w-full items-center justify-start gap-5">
                {showTabs && (
                  <div className="flex items-center justify-start gap-4">
                    <span className="text-lg font-semibold">Filter By:</span>
                    <Button
                      variant={
                        activeFilter === 'my-tasks' ? 'default' : 'outline'
                      }
                      onClick={() => setActiveFilter('my-tasks')}
                    >
                      My Tasks
                    </Button>
                    <Button
                      variant={
                        activeFilter === 'assigned-tasks'
                          ? 'default'
                          : 'outline'
                      }
                      onClick={() => setActiveFilter('assigned-tasks')}
                    >
                      Assigned Tasks
                    </Button>
                    <Button
                      variant={
                        activeFilter === 'archived-tasks'
                          ? 'default'
                          : 'outline'
                      }
                      onClick={() => setActiveFilter('archived-tasks')}
                    >
                      Archived Tasks
                    </Button>
                  </div>
                )}
                <h5 className="text-lg font-semibold">
                  Total Tasks:{' '}
                  <span className="rounded-full bg-gray-300 px-3 py-1 text-base">
                    {totalTaskRef.current}
                  </span>
                </h5>
              </div>
              <TableComponent
                data={values}
                headers={headers}
                addProps={{
                  label: `${t('add') + ' ' + localizedTitle}`,
                  sheetToOpen: sheetName as SheetNames,
                }}
                hasFooter
                tableActions={tableActions}
              />
            </div>
          ) : (
            <NoResultFound label={`No ${title} yet.`} />
          )}
        </div>
      </div>
      <ConfirmationDialog
        title={t('confirm-deletion')}
        subTitle={t('deleteConfirmation', { title })}
        type="destructive"
        open={openConfirmation}
        onClose={() => setOpenConfirmation(false)}
        isLoading={isPending}
        callback={() => mutate()}
      />
    </>
  )
}

export default TasksTable
