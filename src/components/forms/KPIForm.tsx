'use client'

import {
  getCalibrationOptions,
  getFrequencyOptions,
  getKpiTypeOptions,
  getUnitOptions,
} from '@/constants/global-constants'
import { toast } from '@/hooks/use-toast'
import { getDepartmentsByOrganizationId } from '@/lib/actions/department.actions'
import { getAllStatuses } from '@/lib/actions/kpi-dimensions/status.actions'
import { createKPI, updateKPI } from '@/lib/actions/kpiActions'
import { CustomUser } from '@/lib/auth'
import { axiosGet } from '@/lib/axios'
import { BodySchema } from '@/schema/kpi.schema'
import { useGlobalStore } from '@/stores/global-store'
import { useSheetStore } from '@/stores/sheet-store'
import {
  IKpiFormDropdownData,
  IKpiManipulator,
  IKpiResponse,
} from '@/types/kpi'
import { Calibration, Frequency, KPIType, Units } from '@prisma/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useFormik } from 'formik'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FC } from 'react'
import { toFormikValidationSchema } from 'zod-formik-adapter'
import BasicDropdown from '../shared/dropdowns/BasicDropdown'
import MultiSelect from '../shared/dropdowns/MultiSelect'
import LabeledInput from '../shared/inputs/LabeledInput'
import LabeledTextArea from '../shared/textArea/LabeledTextArea'
import { Button } from '../ui/button'
import { Switch } from '../ui/switch'

interface IKpiFormProps {
  data?: IKpiResponse
}

const KPIForm: FC<IKpiFormProps> = ({ data: kpiData }) => {
  const isEdit = !!kpiData
  const queryClient = useQueryClient()
  const t = useTranslations('general')
  const isArabic = usePathname().includes('/ar')

  const { data: session } = useSession()
  const userData = session?.user as CustomUser | undefined

  const { organizationId, departmentId } = useGlobalStore((store) => store)
  const { actions } = useSheetStore((store) => store)
  const { closeSheet } = actions

  const { data: departmentData } = useQuery({
    queryKey: ['departments', organizationId],
    queryFn: async () => await getDepartmentsByOrganizationId(organizationId),
    staleTime: 1000 * 60 * 5,
  })

  const { data: statusData } = useQuery({
    queryKey: ['allKpiStatus'],
    queryFn: async () => await getAllStatuses(),
    staleTime: 1000 * 60 * 5,
  })

  const unitOptions = getUnitOptions(t)
  const frequencyOptions = getFrequencyOptions(t)
  const kpiTypeOptions = getKpiTypeOptions(t)
  const calibrationOptions = getCalibrationOptions(t)

  const { data: multipleOptionsDatabaseValues } = useQuery({
    queryKey: ['multipleOptionsDatabaseValues'],
    queryFn: () => axiosGet<IKpiFormDropdownData>('kpis'),
    staleTime: 1000 * 60 * 5,
  })

  const departmentOptions = departmentData?.map((option) => ({
    id: String(option.id),
    label: option.name,
    value: option.name,
  }))

  const statusOptions = statusData?.map((option) => ({
    id: String(option.id),
    label: option.name,
    value: option.name,
  }))

  const objectivesOptions =
    multipleOptionsDatabaseValues?.data?.objectives?.map((option) => ({
      id: option.id,
      label: option.name,
      value: option.name,
    }))

  const complianceOptions =
    multipleOptionsDatabaseValues?.data?.compliances?.map((option) => ({
      id: option.id,
      label: option.name,
      value: option.name,
    }))

  const processOptions = multipleOptionsDatabaseValues?.data?.processes?.map(
    (option) => ({
      id: option.id,
      label: option.name,
      value: option.name,
    }),
  )

  const {
    values,
    errors,
    getFieldProps,
    setFieldValue,
    handleSubmit,
    setValues,
    handleBlur,
    dirty,
    touched,
  } = useFormik<IKpiManipulator>({
    initialValues: {
      code: kpiData?.code ?? '',
      departmentId: kpiData?.departmentId ?? 0,
      statusType: kpiData?.statusType ?? 'default',
      statusId: kpiData?.statusId ?? null,
      owner: kpiData?.owner ?? '',
      name: kpiData?.name ?? '',
      description: kpiData?.description ?? '',
      measurement_equation: !!(
        kpiData?.measurementDenominator || kpiData?.measurementNumerator
      ),
      measurementDenominator: kpiData?.measurementDenominator ?? undefined,
      measurementNumerator: kpiData?.measurementNumerator ?? undefined,
      measurementNumber: kpiData?.measurementNumber ?? undefined,
      resources: kpiData?.resources ?? undefined,
      unit: kpiData?.unit ?? Units.PERCENTAGE,
      frequency: kpiData?.frequency ?? Frequency.MONTHLY,
      type: kpiData?.type ?? KPIType.CUMULATIVE,
      calibration: kpiData?.calibration ?? Calibration.INCREASING,
      objectives: kpiData?.objectives?.map((obj) => obj.id) ?? [],
      compliances: kpiData?.compliances?.map((obj) => obj.id) ?? [],
      processes: kpiData?.processes?.map((obj) => obj.id) ?? [],
    },
    enableReinitialize: true,
    validationSchema: toFormikValidationSchema(BodySchema),
    validate: (values) => {
      const errors: { statusId?: string } = {}
      if (values.statusType !== 'default' && !values.statusId) {
        errors.statusId =
          "Status ID is required when status type is not 'default'"
      }
      return errors
    },
    onSubmit: () => {
      if (isEdit) {
        editMutation(kpiData.id)
      } else {
        addMutation()
      }
    },
  })

  const { mutate: addMutation, isPending: addLoading } = useMutation({
    mutationFn: async () => await createKPI(values),
    onSuccess: (newKPI) => {
      queryClient.setQueryData(
        ['kpis', userData?.role, organizationId, departmentId],
        (oldData: { kpis: IKpiResponse[]; totalCount: number } | undefined) => {
          if (!oldData) return { kpis: [newKPI], totalCount: 1 }
          return {
            kpis: [...oldData.kpis, newKPI],
            totalCount: oldData.totalCount + 1,
          }
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
    mutationFn: async (id: number) => await updateKPI(id, values),
    onSuccess: (updatedKPI, id) => {
      queryClient.setQueryData(
        ['kpis', userData?.role, organizationId, departmentId],
        (oldData: { kpis: IKpiResponse[]; totalCount: number } | undefined) => {
          if (!oldData) return { kpis: [], totalCount: 0 }

          return {
            ...oldData,
            kpis: oldData.kpis.map((kpi) => {
              if (kpi.id === id) {
                return {
                  ...kpi,
                  ...updatedKPI,
                }
              }
              return kpi
            }),
          }
        },
      )
      toast({
        variant: 'success',
        title: 'Success',
        description: `${values.code} successfully updated`,
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
          label={t('kpi-code')}
          placeholder={t('kpi-code-placeholder')}
          {...getFieldProps('code')}
          error={touched.code && errors.code ? errors.code : ''}
        />
        <BasicDropdown
          data={departmentOptions ?? []}
          label={t('department')}
          triggerStyle="h-11"
          placeholder={t('department-placeholder')}
          defaultValue={departmentOptions?.find(
            (option) => +option.id === values.departmentId,
          )}
          error={
            errors.departmentId && touched.departmentId
              ? errors.departmentId
              : ''
          }
          {...getFieldProps('departmentId')}
          callback={(option) => setFieldValue('departmentId', +option.id)}
        />
        <LabeledInput
          label={t('kpi-owner')}
          placeholder={t('kpi-owner-placeholder')}
          {...getFieldProps('owner')}
          error={touched.owner && errors.owner ? errors.owner : ''}
        />
        <LabeledInput
          label={t('kpi-name')}
          placeholder={t('kpi-name-placeholder')}
          {...getFieldProps('name')}
          error={touched.name && errors.name ? errors.name : ''}
        />
        <LabeledTextArea
          label={t('Description')}
          placeholder={t('kpi-description-placeholder')}
          className="resize-none"
          {...getFieldProps('description')}
          error={
            touched.description && errors.description ? errors.description : ''
          }
        />
        <div className="flex w-full flex-col items-start justify-start gap-3">
          <h3 className="text-sm font-medium text-zinc-800">
            {t('measurement-equation')}:
          </h3>
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm font-medium leading-[1.05625rem] text-zinc-500">
              {t('as-number')}:
            </span>
            <Switch
              id="pricing-mode"
              dir={isArabic ? 'rtl' : 'ltr'}
              checked={values.measurement_equation}
              onCheckedChange={(checked) => {
                if (checked) {
                  setValues((prev) => ({
                    ...prev,
                    measurement_equation: true,
                    measurementNumber: '',
                  }))
                } else {
                  setValues((prev) => ({
                    ...prev,
                    measurement_equation: false,
                    measurementDenominator: '',
                    measurementNumerator: '',
                  }))
                }
              }}
            />
            <span className="text-sm font-medium leading-[1.05625rem] text-zinc-500">
              {t('as-numerator-or-denominator')}:
            </span>
          </div>
        </div>
        {values.measurement_equation ? (
          <>
            <LabeledInput
              label={t('denominator')}
              placeholder={t('denominator-placeholder')}
              {...getFieldProps('measurementDenominator')}
              error={
                touched.measurementDenominator && errors.measurementDenominator
                  ? errors.measurementDenominator
                  : ''
              }
            />
            <LabeledInput
              label={t('numerator')}
              placeholder={t('numerator-placeholder')}
              {...getFieldProps('measurementNumerator')}
              error={
                touched.measurementNumerator && errors.measurementNumerator
                  ? errors.measurementNumerator
                  : ''
              }
            />
          </>
        ) : (
          <LabeledInput
            label={t('measurement-number')}
            placeholder={t('measurement-number-placeholder')}
            {...getFieldProps('measurementNumber')}
            error={
              touched.measurementNumber && errors.measurementNumber
                ? errors.measurementNumber
                : ''
            }
          />
        )}
        <BasicDropdown
          data={unitOptions ?? []}
          label={t('unit-of-measurement')}
          triggerStyle="h-11"
          placeholder={t('unit-of-measurement-placeholder')}
          defaultValue={unitOptions?.find(
            (option) => option.value === values.unit,
          )}
          error={errors.unit && touched.unit ? errors.unit : ''}
          {...getFieldProps('unit')}
          callback={(option) => setFieldValue('unit', option.value)}
        />
        <BasicDropdown
          label={t('frequency')}
          placeholder={t('frequency-placeholder')}
          data={frequencyOptions ?? []}
          triggerStyle="h-11"
          disabled={
            isEdit &&
            (kpiData?.targets?.length > 0 || kpiData?.actuals?.length > 0)
          }
          defaultValue={frequencyOptions?.find(
            (option) => option.value === values.frequency,
          )}
          error={errors.frequency && touched.frequency ? errors.frequency : ''}
          {...getFieldProps('frequency')}
          callback={(option) => setFieldValue('frequency', option.value)}
        />
        <BasicDropdown
          label={t('measurement-type')}
          placeholder={t('measurement-type-placeholder')}
          data={kpiTypeOptions ?? []}
          triggerStyle="h-11"
          defaultValue={kpiTypeOptions?.find(
            (option) => option.value === values.type,
          )}
          error={errors.type && touched.type ? errors.type : ''}
          {...getFieldProps('type')}
          callback={(option) => setFieldValue('type', option.value)}
        />
        <BasicDropdown
          label={t('desired-direction')}
          placeholder={t('desired-direction-placeholder')}
          data={calibrationOptions ?? []}
          triggerStyle="h-11"
          defaultValue={calibrationOptions?.find(
            (option) => option.value === values.calibration,
          )}
          error={
            errors.calibration && touched.calibration ? errors.calibration : ''
          }
          {...getFieldProps('calibration')}
          callback={(option) => setFieldValue('calibration', option.value)}
        />
        <div className="flex w-full flex-col items-start justify-start gap-3">
          <h3 className="text-sm font-medium text-zinc-800">
            Choose Status Type:
          </h3>
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm font-medium leading-[1.05625rem] text-zinc-500">
              Default
            </span>
            <Switch
              id="status-mode"
              dir={isArabic ? 'rtl' : 'ltr'}
              checked={values.statusType !== 'default'}
              onCheckedChange={(checked) => {
                setValues((prev) => ({
                  ...prev,
                  statusType: checked ? 'custom' : 'default',
                  statusId: null,
                }))
              }}
            />
            <span className="text-sm font-medium leading-[1.05625rem] text-zinc-500">
              Custom
            </span>
          </div>
        </div>
        {values.statusType !== 'default' && (
          <>
            {statusOptions?.length === 0 && (
              <div className="flex w-full items-center justify-start gap-2 text-sm text-primary">
                <span>You should add custom status first. </span>
                <Link
                  href={'/kpi-dimensions?tab=status-description'}
                  className="underline"
                >
                  Click Here
                </Link>
              </div>
            )}
            <BasicDropdown
              data={statusOptions ?? []}
              label={'status'}
              triggerStyle="h-11"
              placeholder={'Select status'}
              defaultValue={statusOptions?.find(
                (option) => +option.id === values.statusId,
              )}
              error={errors.statusId && touched.statusId ? errors.statusId : ''}
              {...getFieldProps('statusId')}
              callback={(option) => setFieldValue('statusId', +option.id)}
            />
          </>
        )}
        <MultiSelect
          instanceId={'objectives'}
          label={t('objectives')}
          placeholder={t('objectives-placeholder')}
          data={objectivesOptions ?? []}
          hasArrow
          isMulti
          name="objectives"
          defaultValue={objectivesOptions?.filter((option) =>
            values.objectives.includes(option.id),
          )}
          error={
            touched.objectives && errors.objectives
              ? typeof errors.objectives === 'string'
                ? errors.objectives
                : String(errors.objectives)
              : undefined
          }
          onBlur={handleBlur}
          onChange={(newValue) => {
            const selectedOptions = newValue as IMultiSelectOptions[]

            setFieldValue(
              'objectives',
              selectedOptions.map((option) => option.id),
            )
          }}
        />
        <MultiSelect
          instanceId={'compliances'}
          label={t('compliances')}
          placeholder={t('compliances-placeholder')}
          data={complianceOptions ?? []}
          hasArrow
          isMulti
          name="compliances"
          defaultValue={complianceOptions?.filter((option) =>
            values.compliances.includes(option.id),
          )}
          error={
            touched.compliances && errors.compliances
              ? typeof errors.compliances === 'string'
                ? errors.compliances
                : String(errors.compliances)
              : undefined
          }
          onBlur={handleBlur}
          onChange={(newValue) => {
            const selectedOptions = newValue as IMultiSelectOptions[]

            setFieldValue(
              'compliances',
              selectedOptions.map((option) => option.id),
            )
          }}
        />
        <MultiSelect
          instanceId={'processes'}
          label={t('processes')}
          placeholder={t('processes-placeholder')}
          data={processOptions ?? []}
          hasArrow
          isMulti
          name="processes"
          defaultValue={processOptions?.filter((option) =>
            values.processes.includes(option.id),
          )}
          error={
            touched.processes && errors.processes
              ? typeof errors.processes === 'string'
                ? errors.processes
                : String(errors.processes)
              : undefined
          }
          onBlur={handleBlur}
          onChange={(newValue) => {
            const selectedOptions = newValue as IMultiSelectOptions[]

            setFieldValue(
              'processes',
              selectedOptions.map((option) => option.id),
            )
          }}
        />
        <LabeledInput
          label={t('information-source')}
          placeholder={t('information-source-placeholder')}
          {...getFieldProps('resources')}
          error={touched.resources && errors.resources ? errors.resources : ''}
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
          {isEdit ? t('update-kpi') : t('create-kpi')}
        </Button>
      </div>
    </form>
  )
}

export default KPIForm
