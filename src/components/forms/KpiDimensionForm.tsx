'use client'

import { toast } from '@/hooks/use-toast'
import { useTab } from '@/hooks/useTab'
import {
  createCompliance,
  updateComplianceById,
} from '@/lib/actions/kpi-dimensions/compliance.actions'
import {
  createObjective,
  updateObjectiveById,
} from '@/lib/actions/kpi-dimensions/objective.actions'
import {
  createProcess,
  updateProcessById,
} from '@/lib/actions/kpi-dimensions/process.actions'
import {
  IKpiDimensionManipulator,
  kpiDimensionSchema,
} from '@/schema/kpi-dimensions/kpi-dimensions.schema'
import { useSheetStore } from '@/stores/sheet-store'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useFormik } from 'formik'
import { useTranslations } from 'next-intl'
import { FC } from 'react'
import { toFormikValidationSchema } from 'zod-formik-adapter'
import LabeledInput from '../shared/inputs/LabeledInput'
import { Button } from '../ui/button'

interface IKpiDimensionFormProps {
  data?: IKpiDimensionResponse
}

const KpiDimensionForm: FC<IKpiDimensionFormProps> = ({
  data: kpiDimensionData,
}) => {
  const isEdit = !!kpiDimensionData
  const queryClient = useQueryClient()
  const t = useTranslations('general')
  const tab = useTab()

  const { actions } = useSheetStore((store) => store)
  const { closeSheet } = actions

  // Format dates for initial values
  const initialValues = {
    name: kpiDimensionData?.name ?? '',
  }

  const formik = useFormik<IKpiDimensionManipulator>({
    initialValues,
    enableReinitialize: false,
    validationSchema: toFormikValidationSchema(kpiDimensionSchema),
    onSubmit: () => {
      if (isEdit && kpiDimensionData) {
        if (tab === 'processes') {
          editProcessMutation(kpiDimensionData.id)
        } else if (tab === 'compliances') {
          editComplianceMutation(kpiDimensionData.id)
        } else {
          editObjectiveMutation(kpiDimensionData.id)
        }
      } else {
        if (tab === 'processes') {
          addProcessMutation()
        } else if (tab === 'compliances') {
          addComplianceMutation()
        } else {
          addObjectiveMutation()
        }
      }
    },
  })

  const { values, errors, getFieldProps, handleSubmit, touched } = formik

  const { mutate: addProcessMutation, isPending: addProcessLoading } =
    useMutation({
      mutationFn: async () => await createProcess(values),
      onSuccess: (newData) => {
        queryClient.invalidateQueries({
          queryKey: ['multipleOptionsDatabaseValues'],
        })
        queryClient.setQueryData(
          ['kpi-dimensions', tab],
          (oldData: IKpiDimensionResponse[] | undefined) => {
            return oldData ? [...oldData, newData] : [newData]
          },
        )
        toast({
          variant: 'success',
          title: 'Success',
          description: `Process successfully created`,
        })
        closeSheet()
      },
      onError: (error: AxiosErrorType) => {
        toast({
          variant: 'destructive',
          title: 'Process Failed to create',
          description: error?.message,
        })
      },
    })

  const { mutate: editProcessMutation, isPending: editProcessLoading } =
    useMutation({
      mutationFn: async (id: number) => await updateProcessById(id, values),
      onSuccess: (updatedData, id) => {
        queryClient.invalidateQueries({
          queryKey: ['multipleOptionsDatabaseValues'],
        })
        queryClient.setQueryData(
          ['kpi-dimensions', tab],
          (oldData: IKpiDimensionResponse[] | undefined) => {
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

  const { mutate: addObjectiveMutation, isPending: addObjectiveLoading } =
    useMutation({
      mutationFn: async () => await createObjective(values),
      onSuccess: (newData) => {
        queryClient.invalidateQueries({
          queryKey: ['multipleOptionsDatabaseValues'],
        })
        queryClient.setQueryData(
          ['kpi-dimensions', tab],
          (oldData: IKpiDimensionResponse[] | undefined) => {
            return oldData ? [...oldData, newData] : [newData]
          },
        )
        toast({
          variant: 'success',
          title: 'Success',
          description: `Objective successfully created`,
        })
        closeSheet()
      },
      onError: (error: AxiosErrorType) => {
        toast({
          variant: 'destructive',
          title: 'Objective Failed to create',
          description: error?.message,
        })
      },
    })

  const { mutate: editObjectiveMutation, isPending: editObjectiveLoading } =
    useMutation({
      mutationFn: async (id: number) => await updateObjectiveById(id, values),
      onSuccess: (updatedData, id) => {
        queryClient.invalidateQueries({
          queryKey: ['multipleOptionsDatabaseValues'],
        })
        queryClient.setQueryData(
          ['kpi-dimensions', tab],
          (oldData: IKpiDimensionResponse[] | undefined) => {
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

  const { mutate: addComplianceMutation, isPending: addComplianceLoading } =
    useMutation({
      mutationFn: async () => await createCompliance(values),
      onSuccess: (newData) => {
        queryClient.invalidateQueries({
          queryKey: ['multipleOptionsDatabaseValues'],
        })
        queryClient.setQueryData(
          ['kpi-dimensions', tab],
          (oldData: IKpiDimensionResponse[] | undefined) => {
            return oldData ? [...oldData, newData] : [newData]
          },
        )
        toast({
          variant: 'success',
          title: 'Success',
          description: `Compliance successfully created`,
        })
        closeSheet()
      },
      onError: (error: AxiosErrorType) => {
        toast({
          variant: 'destructive',
          title: 'Compliance Failed to create',
          description: error?.message,
        })
      },
    })

  const { mutate: editComplianceMutation, isPending: editComplianceLoading } =
    useMutation({
      mutationFn: async (id: number) => await updateComplianceById(id, values),
      onSuccess: (updatedData, id) => {
        queryClient.invalidateQueries({
          queryKey: ['multipleOptionsDatabaseValues'],
        })
        queryClient.setQueryData(
          ['kpi-dimensions', tab],
          (oldData: IKpiDimensionResponse[] | undefined) => {
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

  const isLoading =
    addComplianceLoading ||
    editComplianceLoading ||
    addProcessLoading ||
    editProcessLoading ||
    addObjectiveLoading ||
    editObjectiveLoading

  return (
    <form
      onSubmit={handleSubmit}
      className="styleScrollbar flex size-full max-h-full flex-col justify-between overflow-y-auto"
    >
      <div className="flex w-full flex-col items-center gap-3">
        <LabeledInput
          label={'Name'}
          placeholder={'Enter status name'}
          {...getFieldProps('name')}
          error={touched.name && errors.name ? errors.name : ''}
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

export default KpiDimensionForm
