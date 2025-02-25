'use client'

import { getPriorityOptions } from '@/constants/global-constants'
import { toast } from '@/hooks/use-toast'
import { getAllStatusByOrganizationId } from '@/lib/actions/status.actions'
import { createTask, updateTaskById } from '@/lib/actions/task.actions'
import { getAllOrganizationUsers } from '@/lib/actions/userActions'
import { CustomUser } from '@/lib/auth'
import { ITaskManagementManipulator, taskSchema } from '@/schema/task.schema'
import { useGlobalStore } from '@/stores/global-store'
import { useSheetStore } from '@/stores/sheet-store'
import { ITasksManagementResponse } from '@/types/tasks'
import { Priority } from '@prisma/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useFormik } from 'formik'
import moment from 'moment'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { FC } from 'react'
import { toFormikValidationSchema } from 'zod-formik-adapter'
import BasicDropdown from '../shared/dropdowns/BasicDropdown'
import MultiSelect from '../shared/dropdowns/MultiSelect'
import LabeledInput from '../shared/inputs/LabeledInput'
import LabeledTextArea from '../shared/textArea/LabeledTextArea'
import { Button } from '../ui/button'

interface ITaskManagementFormProps {
  data?: ITasksManagementResponse
}

const TaskManagementForm: FC<ITaskManagementFormProps> = ({
  data: tasksData,
}) => {
  const isEdit = !!tasksData
  const queryClient = useQueryClient()
  const t = useTranslations('general')

  const { organizationId } = useGlobalStore((store) => store)
  const { actions } = useSheetStore((store) => store)
  const { closeSheet } = actions

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

  const { data: taskStatusData } = useQuery({
    queryKey: ['task-status', organizationId],
    queryFn: async () => {
      return await getAllStatusByOrganizationId(organizationId)
    },
    staleTime: 5 * 60 * 1000,
  })

  const statusOptions = taskStatusData?.map((user) => ({
    id: String(user.id),
    label: user.name,
    value: user.name,
  }))

  // Format dates for initial values
  const initialValues = {
    name: tasksData?.name ?? '',
    description: tasksData?.description ?? '',
    priority: tasksData?.priority ?? Priority.LOW,
    note: tasksData?.note ?? '',
    startDate: tasksData?.startDate
      ? new Date(tasksData.startDate)
      : new Date(),
    dueDate: tasksData?.dueDate ? new Date(tasksData.dueDate) : new Date(),
    actualEndDate: tasksData?.actualEndDate
      ? new Date(tasksData.actualEndDate)
      : null,
    isArchived: tasksData?.isArchived ?? false,
    percentDone: tasksData?.percentDone ?? 0,
    reason: tasksData?.reason ?? '',
    comment: tasksData?.comment ?? '',
    statusId:
      tasksData?.statusId ||
      (statusOptions?.length ? Number(statusOptions[0].id) : 0),
    allocatorId: tasksData?.allocatorId || user?.id || '',
    kpiId: tasksData?.kpiId || null,
    auditCycleCaseId: tasksData?.auditCycleCaseId || null,
    assignees: tasksData?.assignees?.map((a) => a.id) || [],
  }

  const formik = useFormik<ITaskManagementManipulator>({
    initialValues,
    enableReinitialize: false, // Change to false to prevent re-initialization
    validationSchema: toFormikValidationSchema(taskSchema),
    onSubmit: () => {
      if (isEdit && tasksData) {
        editMutation(tasksData.id)
      } else {
        addMutation()
      }
    },
  })

  const {
    values,
    errors,
    getFieldProps,
    setFieldValue,
    handleSubmit,
    handleBlur,
    touched,
  } = formik

  const priorityOptions = getPriorityOptions(t)

  const userOptions = allUsersData?.map((user) => ({
    id: user.id,
    label: user.fullName,
    value: user.fullName,
  }))

  const { mutate: addMutation, isPending: addLoading } = useMutation({
    mutationFn: async () => await createTask(values),
    onSuccess: (newData) => {
      queryClient.setQueryData(
        ['tasks-management'],
        (oldData: ITasksManagementResponse[] | undefined) => {
          return oldData ? [...oldData, newData] : [newData]
        },
      )
      toast({
        variant: 'success',
        title: 'Success',
        description: `Task successfully assigned`,
      })
      closeSheet()
    },
    onError: (error: AxiosErrorType) => {
      toast({
        variant: 'destructive',
        title: 'Task Failed to assign',
        description: error?.message,
      })
    },
  })

  const { mutate: editMutation, isPending: editLoading } = useMutation({
    mutationFn: async (id: number) => await updateTaskById(id, values),
    onSuccess: (updatedData, id) => {
      queryClient.setQueryData(
        ['tasks-management'],
        (oldData: ITasksManagementResponse[] | undefined) => {
          if (!oldData) return []

          return oldData.map((data) => {
            if (data.id === id) {
              return {
                ...data,
                ...updatedData,
              }
            }
            return data
          })
        },
      )

      toast({
        variant: 'success',
        title: 'Success',
        description: `${values.name} successfully updated`,
      })
      closeSheet()
    },
    onError: (error: AxiosErrorType) => {
      toast({
        variant: 'destructive',
        title: 'Resend Failed',
        description: error?.message,
      })
    },
  })

  const isLoading = addLoading || editLoading

  return (
    <form
      onSubmit={handleSubmit}
      className="styleScrollbar flex size-full max-h-full flex-col justify-between overflow-y-auto"
    >
      <div className="flex w-full flex-col items-center gap-3">
        <LabeledInput
          label={'Name'}
          placeholder={'Enter task name'}
          {...getFieldProps('name')}
          error={touched.name && errors.name ? errors.name : ''}
        />
        <LabeledTextArea
          label={'Description'}
          placeholder={'Enter description here'}
          className="resize-none"
          {...getFieldProps('description')}
          error={
            touched.description && errors.description ? errors.description : ''
          }
        />
        <BasicDropdown
          data={statusOptions ?? []}
          label={'Task Status'}
          triggerStyle="h-11"
          placeholder={'Select Status'}
          defaultValue={statusOptions?.find(
            (option) => +option.id === values.statusId,
          )}
          {...getFieldProps('statusId')}
          callback={(option) => setFieldValue('statusId', +option.id)}
          error={errors.statusId && touched.statusId ? errors.statusId : ''}
        />
        <BasicDropdown
          data={priorityOptions ?? []}
          label={'Priority'}
          triggerStyle="h-11"
          placeholder={'Select Priority'}
          defaultValue={priorityOptions?.find(
            (option) => option.id === values.priority,
          )}
          {...getFieldProps('priority')}
          callback={(option) => setFieldValue('priority', option.value)}
          error={errors.priority && touched.priority ? errors.priority : ''}
        />
        <MultiSelect
          instanceId={'users'}
          label={'Assign task to'}
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

        <LabeledInput
          label={'Start Date'}
          placeholder={'Enter start date'}
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
          label={'Due Date'}
          placeholder={'Enter due date'}
          type="date"
          value={
            values.dueDate ? moment(values.dueDate).format('YYYY-MM-DD') : ''
          }
          onChange={(e) => {
            setFieldValue('dueDate', new Date(e.target.value))
          }}
          error={
            touched.dueDate && errors.dueDate ? String(errors.dueDate) : ''
          }
        />
        {isEdit && (
          <div className="flex w-full flex-col items-center gap-3">
            <LabeledInput
              label={'Actual End Date'}
              placeholder={'Enter actual end date'}
              type="date"
              value={
                values.actualEndDate
                  ? moment(values.actualEndDate).format('YYYY-MM-DD')
                  : ''
              }
              onChange={(e) => {
                setFieldValue('actualEndDate', new Date(e.target.value))
              }}
              error={
                touched.actualEndDate && errors.actualEndDate
                  ? String(errors.actualEndDate)
                  : ''
              }
            />
            <LabeledInput
              label={'Percentage Done'}
              type="number"
              placeholder={'Enter percentage done'}
              {...getFieldProps('percentDone')}
              error={
                touched.percentDone && errors.percentDone
                  ? errors.percentDone
                  : ''
              }
            />
          </div>
        )}
        <LabeledTextArea
          label={'Comment'}
          placeholder={'Enter comment here'}
          className="resize-none"
          {...getFieldProps('comment')}
          error={touched.comment && errors.comment ? errors.comment : ''}
        />
      </div>
      <div className="mt-5 flex w-full items-center justify-end gap-3">
        <Button
          type="button"
          variant={'outline'}
          className="w-full max-w-36 sm:max-w-[10.25rem]"
          onClick={() => closeSheet()}
        >
          {t('cancel')}
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          isLoading={isLoading}
          className="w-full max-w-36 sm:max-w-[10.25rem]"
        >
          {t('save')}
        </Button>
      </div>
    </form>
  )
}

export default TaskManagementForm
