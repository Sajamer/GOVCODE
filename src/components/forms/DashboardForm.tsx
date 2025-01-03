'use client'

import { getChartTypeOptions } from '@/constants/global-constants'
import { toast } from '@/hooks/use-toast'
import {
  createDashboard,
  getDashboardById,
  updateDashboardById,
} from '@/lib/actions/dashboard.actions'
import { getAllKPI } from '@/lib/actions/kpiActions'
import {
  dashboardSchema,
  IDashboardManipulator,
} from '@/schema/dashboard.schema'
import { useSheetStore } from '@/stores/sheet-store'
import { IDashboardResponse } from '@/types/dashboard'
import { ChartTypes } from '@prisma/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useFormik } from 'formik'
import { useTranslations } from 'next-intl'
// import { usePathname } from 'next/navigation'
import { FC } from 'react'
import { toFormikValidationSchema } from 'zod-formik-adapter'
import BasicDropdown from '../shared/dropdowns/BasicDropdown'
import MultiSelect from '../shared/dropdowns/MultiSelect'
import LabeledInput from '../shared/inputs/LabeledInput'
import { Button } from '../ui/button'

const DashboardForm: FC = () => {
  const queryClient = useQueryClient()
  const t = useTranslations('general')
  // const isArabic = usePathname().includes('/ar')
  const { isEdit, rowId } = useSheetStore((store) => store)

  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard', rowId],
    queryFn: async () => await getDashboardById(Number(rowId)),
    staleTime: 1000 * 60 * 5,
    enabled: isEdit,
  })

  const { data: kpisData } = useQuery({
    queryKey: ['kpis'],
    queryFn: async () => await getAllKPI(),
    staleTime: 1000 * 60 * 5,
  })

  const kpiOptions = kpisData?.map((option) => ({
    id: option.id,
    label: option.name,
    value: option.name,
  }))

  const chartTypeOptions = getChartTypeOptions(t)

  const { actions } = useSheetStore((store) => store)
  const { closeSheet } = actions

  const {
    values,
    errors,
    getFieldProps,
    setFieldValue,
    handleSubmit,
    handleBlur,
    dirty,
    touched,
  } = useFormik<IDashboardManipulator>({
    initialValues: {
      name: dashboardData?.name ?? '',
      chartType: dashboardData?.chartType ?? ChartTypes.bar,
      dashboardKPIs:
        dashboardData?.dashboardKPIs?.map((obj) => obj.kpiId) ?? [],
    },
    enableReinitialize: true,
    validationSchema: toFormikValidationSchema(dashboardSchema),
    onSubmit: () => {
      if (isEdit && dashboardData) {
        editMutation(dashboardData?.id)
      } else {
        addMutation()
      }
    },
  })

  const { mutate: addMutation, isPending: addLoading } = useMutation({
    mutationFn: async () => await createDashboard(values),
    onSuccess: (newData) => {
      queryClient.setQueryData(
        ['dashboards'],
        (oldData: IDashboardManipulator[] | undefined) => {
          return oldData ? [...oldData, newData] : [newData]
        },
      )
      toast({
        variant: 'success',
        title: 'Success',
        description: `${values.name} successfully added`,
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

  const { mutate: editMutation, isPending: editLoading } = useMutation({
    mutationFn: async (id: number) => await updateDashboardById(id, values),
    onSuccess: (updatedData, id) => {
      queryClient.setQueryData(
        ['dashboards'],
        (oldData: IDashboardResponse[] | undefined) => {
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
      <div className="flex flex-col items-center justify-center gap-4 ">
        <LabeledInput
          label={t('dashboard-title')}
          placeholder={t('dashboard-placeholder')}
          {...getFieldProps('name')}
          error={touched.name && errors.name ? errors.name : ''}
        />

        <BasicDropdown
          data={chartTypeOptions ?? []}
          label={t('chartType')}
          triggerStyle="h-11"
          placeholder={t('chartType-placeholder')}
          defaultValue={chartTypeOptions?.find(
            (option) => option.value === values.chartType,
          )}
          error={errors.chartType && touched.chartType ? errors.chartType : ''}
          {...getFieldProps('chartType')}
          callback={(option) => setFieldValue('chartType', option.value)}
        />

        <MultiSelect
          instanceId={'kpis'}
          label={t('kpis')}
          placeholder={t('kpi-placeholder')}
          data={kpiOptions ?? []}
          hasArrow
          isMulti
          name="dashboardKPIs"
          value={
            kpiOptions &&
            kpiOptions.length > 0 &&
            kpiOptions?.filter((option) => {
              return values.dashboardKPIs.includes(option.id)
            })
          }
          error={
            touched.dashboardKPIs && errors.dashboardKPIs
              ? typeof errors.dashboardKPIs === 'string'
                ? errors.dashboardKPIs
                : String(errors.dashboardKPIs)
              : undefined
          }
          onBlur={handleBlur}
          onChange={(newValue) => {
            const selectedOptions = newValue as IMultiSelectOptions[]

            setFieldValue(
              'dashboardKPIs',
              selectedOptions.map((option) => option.id),
            )
          }}
        />
      </div>
      <div className="flex h-[3.625rem] w-full items-center justify-end gap-2 pt-3.5">
        <Button
          type="button"
          onClick={closeSheet}
          variant={'outline'}
          className="h-11 w-[6.25rem] rounded-[2.5rem] border border-zinc-200 text-sm font-medium text-zinc-800"
        >
          {t('close')}
        </Button>
        <Button
          type="submit"
          className="h-11 w-fit min-w-[6.25rem] rounded-full px-5 text-sm font-medium"
          isLoading={isLoading}
          disabled={isLoading || !dirty}
        >
          {isEdit ? t('update') : t('create')}
        </Button>
      </div>
    </form>
  )
}

export default DashboardForm
