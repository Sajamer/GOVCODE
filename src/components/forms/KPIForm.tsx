import { toast } from '@/hooks/use-toast'
import { useSheetStore } from '@/stores/sheet-store'
import { KPI } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import { useFormik } from 'formik'
import { FC } from 'react'
import { z } from 'zod'
import { toFormikValidationSchema } from 'zod-formik-adapter'
import LabeledInput from '../shared/inputs/LabeledInput'
import LabeledTextArea from '../shared/textArea/LabeledTextArea'
import { Button } from '../ui/button'

interface IKpiFormProps {
  data?: KPI
}

const BodySchema = z.object({
  title: z.string(),
  description: z.string(),
  difficulty: z.string(),
  icon: z.string(),
  duration: z.number(),
})

const KPIForm: FC<IKpiFormProps> = ({ data: kpiData }) => {
  const isEdit = !!kpiData
  const difficultyOptions = ['beginner', 'intermediate', 'advanced']

  const { actions } = useSheetStore((store) => store)
  const { closeSheet } = actions

  const { values, errors, getFieldProps, handleSubmit, dirty, touched } =
    useFormik<ICourseManipulator>({
      initialValues: {
        title: kpiData?.frequency ?? '',
        description: kpiData?.description ?? '',
        difficulty: kpiData?.departmentId ?? '',
        icon: kpiData?.calibration ?? '',
        duration: kpiData?.measurementDenominator ?? 0,
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
        description: `${values.title} successfully added`,
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
        description: `${values.title} successfully updated`,
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
          label="Title"
          placeholder="Enter Course Title"
          {...getFieldProps('title')}
          error={touched.title && errors.title ? errors.title : ''}
        />
        <LabeledTextArea
          label="Description"
          placeholder="Enter Course Description"
          className="resize-none"
          {...getFieldProps('description')}
          error={
            touched.description && errors.description ? errors.description : ''
          }
        />
        <LabeledInput
          label="Duration"
          placeholder="Enter Course Duration"
          type="number"
          {...getFieldProps('duration')}
          error={touched.duration && errors.duration ? errors.duration : ''}
        />
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700">
            Difficulty
          </label>
          <select
            {...getFieldProps('difficulty')}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            value={values.difficulty}
          >
            <option value="">Select Difficulty</option>
            {difficultyOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {touched.difficulty && errors.difficulty ? (
            <p className="mt-1 text-sm text-red-600">{errors.difficulty}</p>
          ) : null}
        </div>
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
