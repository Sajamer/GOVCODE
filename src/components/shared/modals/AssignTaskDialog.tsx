'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { getPriorityOptions } from '@/constants/global-constants'
import { toast } from '@/hooks/use-toast'
import { getAllStatusByOrganizationId } from '@/lib/actions/status.actions'
import { createTask } from '@/lib/actions/task.actions'
import { getAllOrganizationUsers } from '@/lib/actions/userActions'
import { CustomUser } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { ITaskManagementManipulator, taskSchema } from '@/schema/task.schema'
import { useGlobalStore } from '@/stores/global-store'
import { Priority, TaskType } from '@prisma/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useFormik } from 'formik'
import moment from 'moment'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { FC, useEffect } from 'react'
import { toFormikValidationSchema } from 'zod-formik-adapter'
import BasicDropdown from '../dropdowns/BasicDropdown'
import MultiSelect from '../dropdowns/MultiSelect'
import LabeledInput from '../inputs/LabeledInput'
import LabeledTextArea from '../textArea/LabeledTextArea'

interface IAssignTaskDialogProps {
  kpiId?: number
  taskType: TaskType
  open: boolean
  auditDetailId?: string
  title?: string
  onClose: () => void
}

const AssignTaskDialog: FC<IAssignTaskDialogProps> = ({
  onClose,
  open,
  taskType,
  auditDetailId,
  title,
  kpiId,
}) => {
  const t = useTranslations('general')
  const isArabic = usePathname().includes('/ar')
  const queryClient = useQueryClient()

  const { organizationId, departmentId } = useGlobalStore((store) => store)
  const { data: session } = useSession()
  const user = session?.user as CustomUser | undefined

  const { data: allUsersData } = useQuery({
    queryKey: ['users-organization', organizationId],
    queryFn: async () => {
      return await getAllOrganizationUsers({
        organizationId: String(organizationId),
      })
    },
    staleTime: 5 * 60 * 1000,
  })

  const priorityOptions = getPriorityOptions(t)

  const userOptions = allUsersData?.map((user) => ({
    id: user.id,
    label: user.fullName,
    value: user.fullName,
  }))

  const { data: taskStatusData } = useQuery({
    queryKey: ['task-status', organizationId],
    queryFn: () => getAllStatusByOrganizationId(organizationId),
    staleTime: 30 * 60 * 1000,
    enabled: !!organizationId,
  })
  const statusOptions = taskStatusData?.map((user) => ({
    id: String(user.id),
    label: user.name,
    value: user.name,
  }))

  const {
    values,
    errors,
    getFieldProps,
    setFieldValue,
    handleSubmit,
    handleBlur,
    touched,
  } = useFormik<ITaskManagementManipulator>({
    initialValues: {
      name: '',
      description: '',
      type: taskType,
      priority: Priority.LOW,
      note: '',
      startDate: new Date(),
      dueDate: new Date(),
      actualEndDate: null,
      isArchived: false,
      percentDone: 0,
      reason: '',
      comment: '',
      statusId: statusOptions?.length ? Number(statusOptions[0].id) : 0,
      allocatorId: user?.id ?? '',
      kpiId: kpiId ? Number(kpiId) : null,
      auditDetailId: auditDetailId || undefined,
      assignees: [],
    },
    enableReinitialize: false,
    validationSchema: toFormikValidationSchema(taskSchema),
    onSubmit: () => {
      addMutation()
    },
  })

  useEffect(() => {
    // Handle kpiId - only set if it's provided and valid
    if (kpiId !== undefined && kpiId !== null) {
      setFieldValue('kpiId', Number(kpiId))
    } else {
      setFieldValue('kpiId', null)
    }
  }, [kpiId, setFieldValue])

  useEffect(() => {
    // Handle auditDetailId for audit tasks
    if (auditDetailId) {
      setFieldValue('auditDetailId', auditDetailId)
    }
  }, [auditDetailId, setFieldValue])

  const { mutate: addMutation, isPending: addLoading } = useMutation({
    mutationFn: async () => await createTask(values),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['kpis', user?.role, organizationId, departmentId],
      })
      queryClient.invalidateQueries({
        queryKey: ['tasks-management'],
      })
      toast({
        variant: 'success',
        title: 'Success',
        description: `Task successfully assigned`,
      })
      onClose()
    },
    onError: (error: AxiosErrorType) => {
      toast({
        variant: 'destructive',
        title: 'Task Failed to assign',
        description: error?.message,
      })
    },
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        aria-describedby={undefined}
        className="flex h-fit w-full max-w-[95%] flex-col items-center justify-center gap-[1.875rem] !rounded-[1.875rem] border-none bg-zinc-50 p-4 sm:h-fit sm:max-w-[50%] sm:p-[1.875rem]"
      >
        <div className="flex w-full flex-col items-start justify-center gap-2 text-center">
          <DialogTitle
            className={cn(
              'w-full text-xl font-medium leading-[1.8rem] text-zinc-900',
              !title && 'sr-only',
            )}
          >
            {title}
          </DialogTitle>
          <DialogDescription className="sr-only w-full text-sm text-zinc-500"></DialogDescription>
        </div>
        <form
          dir={isArabic ? 'rtl' : 'ltr'}
          onSubmit={handleSubmit}
          className="styleScrollbar flex size-full max-h-full flex-col justify-between overflow-y-auto"
        >
          <div className="flex w-full flex-col items-center gap-5">
            <div className="flex w-full items-center justify-center gap-5">
              <LabeledInput
                label={t('task-name')}
                placeholder={t('task-name-placeholder')}
                {...getFieldProps('name')}
                error={touched.name && errors.name ? errors.name : ''}
              />
              <MultiSelect
                instanceId={'users'}
                label={t('assign-task-to')}
                placeholder={t('select-users')}
                data={userOptions ?? []}
                hasArrow
                isMulti
                name="users"
                defaultValue={userOptions?.filter((option) =>
                  values.assignees.includes(option.id),
                )}
                error={
                  touched.assignees && errors.assignees
                    ? typeof errors.assignees === 'string'
                      ? errors.assignees
                      : String(errors.assignees)
                    : undefined
                }
                onBlur={handleBlur}
                onChange={(newValue) => {
                  const selectedOptions = newValue as IMultiSelectOptions[]

                  setFieldValue(
                    'assignees',
                    selectedOptions.map((option) => option.id),
                  )
                }}
              />
            </div>
            <LabeledTextArea
              label={t('task-description')}
              placeholder={t('task-description-placeholder')}
              className="resize-none"
              {...getFieldProps('description')}
              error={
                touched.description && errors.description
                  ? errors.description
                  : ''
              }
            />
            <div className="flex w-full items-center justify-center gap-5">
              <BasicDropdown
                data={priorityOptions ?? []}
                label={t('priority')}
                triggerStyle="h-11"
                placeholder={t('priority-placeholder')}
                defaultValue={priorityOptions?.find(
                  (option) => option.id === values.priority,
                )}
                error={
                  errors.priority && touched.priority ? errors.priority : ''
                }
                {...getFieldProps('priority')}
                callback={(option) => setFieldValue('priority', option.value)}
              />
              <BasicDropdown
                data={statusOptions ?? []}
                label={t('task-status')}
                triggerStyle="h-11"
                placeholder={t('task-status-placeholder')}
                defaultValue={statusOptions?.find(
                  (option) => +option.id === values.statusId,
                )}
                {...getFieldProps('statusId')}
                callback={(option) => setFieldValue('statusId', +option.id)}
                error={
                  errors.statusId && touched.statusId ? errors.statusId : ''
                }
              />
            </div>
            <div className="flex w-full items-center justify-center gap-5">
              <LabeledInput
                label={t('start-date')}
                placeholder={t('start-date-placeholder')}
                type="date"
                value={
                  values.startDate
                    ? moment(values.startDate).format('YYYY-MM-DD')
                    : ''
                }
                onChange={(e) => {
                  setFieldValue('startDate', new Date(e.target.value))
                }}
                error={
                  touched.startDate && errors.startDate
                    ? String(errors.startDate)
                    : ''
                }
              />
              <LabeledInput
                label={t('due-date')}
                placeholder={t('due-date-placeholder')}
                type="date"
                value={
                  values.dueDate
                    ? moment(values.dueDate).format('YYYY-MM-DD')
                    : ''
                }
                onChange={(e) => {
                  setFieldValue('dueDate', new Date(e.target.value))
                }}
                error={
                  touched.dueDate && errors.dueDate
                    ? String(errors.dueDate)
                    : ''
                }
              />
            </div>
            <LabeledTextArea
              label={t('comment')}
              placeholder={t('comment-placeholder')}
              className="resize-none"
              {...getFieldProps('comment')}
              error={touched.comment && errors.comment ? errors.comment : ''}
            />
          </div>
          <div className="mt-5 flex w-full items-center justify-center gap-3">
            <Button
              type="button"
              variant={'outline'}
              className="w-full max-w-36 sm:max-w-[10.25rem]"
              onClick={() => onClose()}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={addLoading}
              isLoading={addLoading}
              className="w-full max-w-36 sm:max-w-[10.25rem]"
            >
              {t('save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AssignTaskDialog
