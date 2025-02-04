import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  getPriorityOptions,
  getTaskStatusOptions,
} from '@/constants/global-constants'
import { toast } from '@/hooks/use-toast'
import { createTask } from '@/lib/actions/task.actions'
import { getAllOrganizationUsers } from '@/lib/actions/userActions'
import { CustomUser } from '@/lib/auth'
import { ITaskManagementManipulator, taskSchema } from '@/schema/task.schema'
import { useGlobalStore } from '@/stores/global-store'
import { Priority, TaskStatus } from '@prisma/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useFormik } from 'formik'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { FC } from 'react'
import { toFormikValidationSchema } from 'zod-formik-adapter'
import BasicDropdown from '../dropdowns/BasicDropdown'
import MultiSelect from '../dropdowns/MultiSelect'
import LabeledTextArea from '../textArea/LabeledTextArea'

interface IAssignTaskDialogProps {
  kpiId: number
  open: boolean
  onClose: () => void
}

const AssignTaskDialog: FC<IAssignTaskDialogProps> = ({
  onClose,
  open,
  kpiId,
}) => {
  const t = useTranslations('general')
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
  const taskStatusOptions = getTaskStatusOptions(t)

  const userOptions = allUsersData?.map((user) => ({
    id: user.id,
    label: user.fullName,
    value: user.fullName,
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
      status: TaskStatus.TODO,
      priority: Priority.LOW,
      kpiId,
      dueDate: '',
      comment: '',
      allocatorId: user?.id ?? '',
      assignees: [],
    },
    enableReinitialize: true,
    validationSchema: toFormikValidationSchema(taskSchema),
    onSubmit: () => {
      addMutation()
    },
  })

  const { mutate: addMutation, isPending: addLoading } = useMutation({
    mutationFn: async () => await createTask(values),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['kpis', user?.role, organizationId, departmentId],
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
          <DialogTitle className="sr-only w-full text-2xl font-medium leading-[1.8rem] text-zinc-900">
            Select Users to assign task
          </DialogTitle>
          <DialogDescription className="sr-only w-full text-sm text-zinc-500"></DialogDescription>
        </div>
        <form
          onSubmit={handleSubmit}
          className="styleScrollbar flex size-full max-h-full flex-col justify-between overflow-y-auto"
        >
          <div className="flex w-full flex-col items-center gap-5">
            <MultiSelect
              instanceId={'users'}
              label={'Select Users to assign task*'}
              placeholder={'Select users'}
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
            <div className="flex w-full items-center justify-center gap-5">
              <BasicDropdown
                data={priorityOptions ?? []}
                label={'Priority'}
                triggerStyle="h-11"
                placeholder={'Select Priority'}
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
                data={taskStatusOptions ?? []}
                label={'Task Status'}
                triggerStyle="h-11"
                placeholder={'Select Status'}
                defaultValue={taskStatusOptions?.find(
                  (option) => option.id === values.status,
                )}
                error={errors.status && touched.status ? errors.status : ''}
                {...getFieldProps('status')}
                callback={(option) => setFieldValue('status', option.value)}
              />
            </div>
            <div className="w-full">
              <label className="mb-2 block text-sm font-medium">Due Date</label>
              <Input
                type="datetime-local"
                {...getFieldProps('dueDate')}
                // error={touched.dueDate && errors.dueDate ? errors.dueDate : ''}
              />
            </div>
            <LabeledTextArea
              label={'Comment'}
              placeholder={'Enter comment here'}
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
