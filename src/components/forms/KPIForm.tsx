import {
  calibrationOptions,
  frequencyOptions,
  kpiTypeOptions,
  unitOptions,
} from '@/constants/global-constants'
import { BodySchema } from '@/schema/kpi.schema'
import { useSheetStore } from '@/stores/sheet-store'
import { IKpiManipulator } from '@/types/kpi'
import { Calibration, Frequency, KPI, KPIType, Units } from '@prisma/client'
import { useFormik } from 'formik'
import { FC } from 'react'
import { toFormikValidationSchema } from 'zod-formik-adapter'
import BasicDropdown from '../shared/dropdowns/BasicDropdown'
import MultiSelect from '../shared/dropdowns/MultiSelect'
import LabeledInput from '../shared/inputs/LabeledInput'
import LabeledTextArea from '../shared/textArea/LabeledTextArea'
import { Button } from '../ui/button'
import { Switch } from '../ui/switch'

interface IKpiFormProps {
  data?: KPI
}

const KPIForm: FC<IKpiFormProps> = ({ data: kpiData }) => {
  const isEdit = !!kpiData

  const { actions } = useSheetStore((store) => store)
  const { closeSheet } = actions

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
      KPIObjective: [], // kpiData?. ?? [],
      KPICompliance: [], // kpiData?.KPICompliance ?? [],
      KPIProcess: [], // kpiData?.KPIProcess ?? [],
    },
    enableReinitialize: true,
    validationSchema: toFormikValidationSchema(BodySchema),
    onSubmit: () => {
      // isEdit ? editMutation(kpiData.id) : addMutation()
    },
  })

  // const { mutate: addMutation, isPending: addLoading } = useMutation({
  //   mutationFn: () => {},
  //   // axiosPost<ICourseManipulator, ICourseManipulator>('courses', values),
  //   onSuccess: () => {
  //     toast({
  //       variant: 'success',
  //       title: 'Success',
  //       description: `${values.name} successfully added`,
  //     })
  //     closeSheet()
  //   },
  //   onError: (error: AxiosErrorType) => {
  //     toast({
  //       variant: 'destructive',
  //       title: 'Resend Failed',
  //       description: error?.message,
  //     })
  //   },
  // })

  // const { mutate: editMutation, isPending: editLoading } = useMutation({
  //   mutationFn: (id: number) => {},
  //   // axiosPut<ICourseManipulator, ICourseManipulator>('courses/' + id, values),
  //   onSuccess: () => {
  //     toast({
  //       variant: 'success',
  //       title: 'Success',
  //       description: `${values.name} successfully updated`,
  //     })
  //     closeSheet()
  //   },
  //   onError: (error: AxiosErrorType) => {
  //     toast({
  //       variant: 'destructive',
  //       title: 'Resend Failed',
  //       description: error?.message,
  //     })
  //   },
  // })

  const isLoading = false // addLoading || editLoading

  const test = [
    {
      id: 1,
      value: 'next.js',
      label: 'Next.js',
    },
    {
      id: 2,
      value: 'sveltekit',
      label: 'SvelteKit',
    },
    {
      id: 3,
      value: 'nuxt.js',
      label: 'Nuxt.js',
    },
  ]

  return (
    <form
      onSubmit={handleSubmit}
      className="styleScrollbar flex size-full max-h-full flex-col justify-between overflow-y-auto"
    >
      <div className="flex flex-col items-center justify-center gap-4 ">
        <LabeledInput
          label="KPI Owner"
          placeholder="Enter KPI Owner"
          {...getFieldProps('owner')}
          error={touched.owner && errors.owner ? errors.owner : ''}
        />
        <LabeledInput
          label="KPI Name"
          placeholder="Enter KPI name"
          {...getFieldProps('name')}
          error={touched.name && errors.name ? errors.name : ''}
        />
        <LabeledTextArea
          label="Description"
          placeholder="Enter KPI Description"
          className="resize-none"
          {...getFieldProps('description')}
          error={
            touched.description && errors.description ? errors.description : ''
          }
        />
        <div className="flex w-full flex-col items-start justify-start gap-3">
          <h3 className="text-sm font-medium text-zinc-800">
            Measurement Equation:
          </h3>
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm font-medium leading-[1.05625rem] text-zinc-500">
              as Number
            </span>
            <Switch
              id="pricing-mode"
              checked={values.measurement_equation}
              onCheckedChange={(checked) => {
                console.log('checked: ', checked)
                if (checked) {
                  setValues((prev) => ({
                    ...prev,
                    measurement_equation: true,
                    measurementNumber: undefined,
                  }))
                } else {
                  setValues((prev) => ({
                    ...prev,
                    measurement_equation: false,
                    measurementDenominator: undefined,
                    measurementNumerator: undefined,
                  }))
                }
              }}
            />
            <span className="text-sm font-medium leading-[1.05625rem] text-zinc-500">
              as Numerator/Denominator
            </span>
          </div>
        </div>
        {values.measurement_equation ? (
          <>
            <LabeledInput
              label="Denominator"
              placeholder="Enter Denominator text"
              {...getFieldProps('measurementDenominator')}
              error={
                touched.measurementDenominator && errors.measurementDenominator
                  ? errors.measurementDenominator
                  : ''
              }
            />
            <LabeledInput
              label="Numerator"
              placeholder="Enter Numerator text"
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
            label="Measurement Number"
            placeholder="Enter Number text"
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
          label="Unit of measurement"
          triggerStyle="h-11"
          placeholder="Select default unit"
          defaultValue={unitOptions?.find(
            (option) => option.value === values.unit,
          )}
          error={errors.unit && touched.unit ? errors.unit : ''}
          {...getFieldProps('unit')}
          callback={(option) => setFieldValue('unit', option.value)}
        />
        <BasicDropdown
          data={frequencyOptions ?? []}
          label="Frequency"
          triggerStyle="h-11"
          placeholder="Select default frequency"
          defaultValue={frequencyOptions?.find(
            (option) => option.value === values.frequency,
          )}
          error={errors.frequency && touched.frequency ? errors.frequency : ''}
          {...getFieldProps('frequency')}
          callback={(option) => setFieldValue('frequency', option.value)}
        />
        <BasicDropdown
          data={kpiTypeOptions ?? []}
          label="Measurement type"
          triggerStyle="h-11"
          placeholder="Select default measurement type"
          defaultValue={kpiTypeOptions?.find(
            (option) => option.value === values.type,
          )}
          error={errors.type && touched.type ? errors.type : ''}
          {...getFieldProps('type')}
          callback={(option) => setFieldValue('type', option.value)}
        />
        <BasicDropdown
          data={calibrationOptions ?? []}
          label="Desired direction"
          triggerStyle="h-11"
          placeholder="Select default direction"
          defaultValue={calibrationOptions?.find(
            (option) => option.value === values.calibration,
          )}
          error={
            errors.calibration && touched.calibration ? errors.calibration : ''
          }
          {...getFieldProps('calibration')}
          callback={(option) => setFieldValue('calibration', option.value)}
        />
        <MultiSelect
          label={'Objectives'}
          placeholder="select all objectives needed"
          data={test}
          hasArrow
          isMulti
        />
        <LabeledInput
          label="Information source"
          placeholder="Enter Information source"
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
          Close
        </Button>
        <Button
          type="submit"
          className="h-11 w-fit min-w-[6.25rem] rounded-full px-5 text-sm font-medium"
          isLoading={isLoading}
          disabled={isLoading || !dirty}
        >
          {isEdit ? 'Update Kpi' : 'Add New Kpi'}
        </Button>
      </div>
    </form>
  )
}

export default KPIForm
