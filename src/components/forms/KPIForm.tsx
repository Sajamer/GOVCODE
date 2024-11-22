import { toast } from '@/hooks/use-toast'
import { useSheetStore } from '@/stores/sheet-store'
import { Calibration, Frequency, KPI, KPIType, Units } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import { useFormik } from 'formik'
import { FC } from 'react'
import { toFormikValidationSchema } from 'zod-formik-adapter'
import LabeledInput from '../shared/inputs/LabeledInput'
import LabeledTextArea from '../shared/textArea/LabeledTextArea'
import { Button } from '../ui/button'
import { IKpiManipulator } from '@/types/kpi'
import { BodySchema } from '@/schema/kpi.schema'

interface IKpiFormProps {
  data?: KPI
}

const KPIForm: FC<IKpiFormProps> = ({ data: kpiData }) => {
  const isEdit = !!kpiData
  const difficultyOptions = ['beginner', 'intermediate', 'advanced']

  const { actions } = useSheetStore((store) => store)
  const { closeSheet } = actions

  const { values, errors, getFieldProps, handleSubmit, dirty, touched } =
    useFormik<IKpiManipulator>({
      initialValues: {
        name: kpiData?.name ?? '',
        description: kpiData?.description ?? '',
        owner: kpiData?.owner ?? '',
        measurementDenominator: kpiData?.measurementDenominator ?? undefined,
        measurementNumerator: kpiData?.measurementNumerator ?? undefined,
        measurementNumber: kpiData?.measurementNumber ?? undefined,
        resources: kpiData?.resources ?? undefined,
        unit: kpiData?.unit ?? Units.PERCENTAGE,
        frequency: kpiData?.frequency ?? Frequency.MONTHLY,
        type: kpiData?.type ?? KPIType.CUMULITIVE,
        calibration: kpiData?.calibration ?? Calibration.INCREASING,
      },
      enableReinitialize: true,
      validationSchema: toFormikValidationSchema(BodySchema),
      onSubmit: () => {
        // isEdit ? editMutation(kpiData.id) : addMutation()
      },
    })

  const { mutate: addMutation, isPending: addLoading } = useMutation({
    mutationFn: () => {},
    // axiosPost<ICourseManipulator, ICourseManipulator>('courses', values),
    onSuccess: () => {
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
    mutationFn: (id: number) => {},
    // axiosPut<ICourseManipulator, ICourseManipulator>('courses/' + id, values),
    onSuccess: () => {
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
          label="KPI Owner"
          placeholder="Enter KPI Owner"
          type="number"
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
