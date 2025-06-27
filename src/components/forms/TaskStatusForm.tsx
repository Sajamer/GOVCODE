'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { updateMultipleTaskStatuses } from '@/lib/actions/status.actions'
import {
  ITaskStatusBulkUpdate,
  taskStatusBulkUpdateSchema,
} from '@/schema/task-status.schema'
import { useSheetStore } from '@/stores/sheet-store'
import { ITaskStatus } from '@/types/tasks'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useFormik } from 'formik'
import { Plus, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { FC } from 'react'
import { toFormikValidationSchema } from 'zod-formik-adapter'

interface ITaskStatusFormProps {
  data: ITaskStatus[]
  organizationId: number
}

const TaskStatusForm: FC<ITaskStatusFormProps> = ({
  data: taskStatusData,
  organizationId,
}) => {
  const queryClient = useQueryClient()
  const t = useTranslations('general')

  const { actions } = useSheetStore((store) => store)
  const { closeSheet } = actions

  // Initialize form values from the passed data
  const initialValues: ITaskStatusBulkUpdate = taskStatusData.map((status) => ({
    id: status.id,
    name: status.name,
    color: status.color,
    organizationId: status.organizationId,
  }))

  const formik = useFormik<ITaskStatusBulkUpdate>({
    initialValues,
    enableReinitialize: true,
    validationSchema: toFormikValidationSchema(taskStatusBulkUpdateSchema),
    onSubmit: (values) => {
      updateMutation(values)
    },
  })

  const { values, errors, setValues, handleSubmit, setFieldValue, touched } =
    formik

  const { mutate: updateMutation, isPending: updateLoading } = useMutation({
    mutationFn: async (data: ITaskStatusBulkUpdate) =>
      await updateMultipleTaskStatuses(data, organizationId),
    onSuccess: (updatedStatuses) => {
      // Update the cache with the correct query key that includes organizationId
      queryClient.setQueryData(['task-status', organizationId], updatedStatuses)

      // Also invalidate related queries to ensure consistency across the app
      queryClient.invalidateQueries({
        queryKey: ['task-status'],
      })

      toast({
        variant: 'success',
        title: 'Success',
        description: 'Task statuses successfully updated',
      })
      closeSheet()
    },
    onError: (error: AxiosErrorType) => {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error?.message || 'Failed to update task statuses',
      })
    },
  })

  const addNewStatus = () => {
    const newStatus = {
      name: '',
      color: '#3b82f6',
      organizationId,
    }
    const newValues = [...values, newStatus]
    setValues(newValues)
  }

  const removeStatus = (index: number) => {
    if (values.length > 1) {
      // Remove from form values - the backend will handle deletion logic
      const newValues = values.filter((_, i) => i !== index)
      setValues(newValues)
    }
  }

  const isLoading = updateLoading

  return (
    <form
      onSubmit={handleSubmit}
      className="styleScrollbar flex size-full max-h-full flex-col justify-between gap-6 overflow-y-auto"
    >
      <div className="space-y-4">
        {values.map((status, index) => (
          <Card key={index} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">
                  {!status.id ? 'New Status' : `Status ${index + 1}`}
                </CardTitle>
                {values.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeStatus(index)}
                    className="size-8 p-0"
                  >
                    <Trash2 className="size-4 text-red-500" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`status-name-${index}`}>{t('name')} *</Label>
                  <Input
                    id={`status-name-${index}`}
                    type="text"
                    value={status.name}
                    onChange={(e) =>
                      setFieldValue(`[${index}].name`, e.target.value)
                    }
                    placeholder="Enter status name"
                    className={
                      errors[index]?.name && touched[index]?.name
                        ? 'border-red-500'
                        : ''
                    }
                  />
                  {errors[index]?.name && touched[index]?.name && (
                    <p className="text-sm text-red-600">
                      {errors[index]?.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`status-color-${index}`}>Color *</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id={`status-color-${index}`}
                      type="color"
                      value={status.color}
                      onChange={(e) =>
                        setFieldValue(`[${index}].color`, e.target.value)
                      }
                      className="h-10 w-12 cursor-pointer rounded p-1"
                    />
                    <Input
                      type="text"
                      value={status.color}
                      onChange={(e) =>
                        setFieldValue(`[${index}].color`, e.target.value)
                      }
                      placeholder="#3b82f6"
                      className={`flex-1 ${
                        errors[index]?.color && touched[index]?.color
                          ? 'border-red-500'
                          : ''
                      }`}
                    />
                  </div>
                  {errors[index]?.color && touched[index]?.color && (
                    <p className="text-sm text-red-600">
                      {errors[index]?.color}
                    </p>
                  )}
                </div>
              </div>

              {/* Preview */}
              <div className="flex items-center space-x-2 pt-2">
                <span className="text-sm text-gray-600">Preview:</span>
                <div
                  className="rounded-full bg-current px-3 py-1 text-sm font-medium text-white"
                  style={{ backgroundColor: status.color }}
                >
                  {status.name || 'Status Name'}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add More Button */}
      <div className="flex justify-center">
        <Button
          type="button"
          variant="outline"
          onClick={addNewStatus}
          className="flex items-center space-x-2"
        >
          <Plus className="size-4" />
          <span>Add More Status</span>
        </Button>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-3 border-t pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={closeSheet}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} isLoading={isLoading}>
          {t('update')}
        </Button>
      </div>
    </form>
  )
}

export default TaskStatusForm
