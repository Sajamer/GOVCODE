'use client'

import { toast } from '@/hooks/use-toast'
import {
  createStatus,
  updateStatusById,
} from '@/lib/actions/kpi-dimensions/status.actions'
import { IStatusManipulator, statusSchema } from '@/schema/status.schema'
import { useSheetStore } from '@/stores/sheet-store'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getIn, useFormik } from 'formik'
import { Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { FC } from 'react'
import { toFormikValidationSchema } from 'zod-formik-adapter'
import ErrorText from '../shared/ErrorText'
import LabeledInput from '../shared/inputs/LabeledInput'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

interface IStatusFormProps {
  data?: IStatusResponse
}

const StatusForm: FC<IStatusFormProps> = ({ data: statusData }) => {
  const isEdit = !!statusData
  const queryClient = useQueryClient()
  const t = useTranslations('general')

  const { actions } = useSheetStore((store) => store)
  const { closeSheet } = actions

  const initialRules =
    statusData?.rules && statusData.rules.length > 0
      ? statusData.rules
      : [{ label: '', min: 0, max: 0, color: '#000000' }]

  // Format dates for initial values
  const initialValues = {
    name: statusData?.name ?? '',
    rules: initialRules,
  }

  const formik = useFormik<IStatusManipulator>({
    initialValues,
    enableReinitialize: false, // Change to false to prevent re-initialization
    validationSchema: toFormikValidationSchema(statusSchema),
    onSubmit: () => {
      if (isEdit && statusData) {
        editMutation(statusData.id)
      } else {
        addMutation()
      }
    },
  })

  const {
    values,
    errors,
    getFieldProps,
    handleSubmit,
    setFieldValue,
    handleBlur,
    touched,
  } = formik

  const { mutate: addMutation, isPending: addLoading } = useMutation({
    mutationFn: async () => await createStatus(values),
    onSuccess: (newData) => {
      queryClient.invalidateQueries({
        queryKey: ['allKpiStatus'],
      })
      queryClient.setQueryData(
        ['kpi-status'],
        (oldData: IStatusResponse[] | undefined) => {
          return oldData ? [...oldData, newData] : [newData]
        },
      )
      toast({
        variant: 'success',
        title: 'Success',
        description: `Status successfully assigned`,
      })
      closeSheet()
    },
    onError: (error: AxiosErrorType) => {
      toast({
        variant: 'destructive',
        title: 'Status Failed to assign',
        description: error?.message,
      })
    },
  })

  const { mutate: editMutation, isPending: editLoading } = useMutation({
    mutationFn: async (id: number) => await updateStatusById(id, values),
    onSuccess: (updatedData, id) => {
      queryClient.invalidateQueries({
        queryKey: ['allKpiStatus'],
      })
      queryClient.setQueryData(
        ['kpi-status'],
        (oldData: IStatusResponse[] | undefined) => {
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

  // Handler to add a new empty rule row
  const handleAddRule = () => {
    setFieldValue('rules', [
      ...values.rules,
      { label: '', min: 0, max: 0, color: '#000000' },
    ])
  }

  // Handler to remove a rule row by index
  const handleRemoveRule = (index: number) => {
    const updatedRules = values.rules.filter((_, i) => i !== index)
    setFieldValue('rules', updatedRules)
  }

  // Handler for individual rule change
  const handleRuleChange = (
    index: number,
    field: 'label' | 'min' | 'max' | 'color',
    value: string,
  ) => {
    const updatedRules = [...values.rules]
    // Convert to number for min and max fields
    if (field === 'min' || field === 'max') {
      updatedRules[index] = {
        ...updatedRules[index],
        [field]: value === '' ? 0 : Number(value),
      }
    } else {
      updatedRules[index] = { ...updatedRules[index], [field]: value }
    }
    setFieldValue('rules', updatedRules)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="styleScrollbar flex size-full max-h-full flex-col justify-between overflow-y-auto"
    >
      <div className="flex w-full flex-col items-center gap-3">
        <LabeledInput
          label={t('Name')}
          placeholder={t('status-name-placeholder')}
          {...getFieldProps('name')}
          error={touched.name && errors.name ? errors.name : ''}
        />

        <div className="mt-4 flex w-full flex-col gap-4 overflow-x-hidden">
          <h2 className="text-base font-medium text-zinc-800">{t('rules')}</h2>
          <div className="flex w-full flex-col items-center text-sm">
            <div className="flex w-full items-center gap-4 text-sm">
              <span className="w-full">{t('label')}</span>
              <span className="w-full">{t('min')} &gt;=</span>
              <span className="w-full">{t('max')} &lt;=</span>
              <span className="w-40">{t('color')}</span>
              <span className="w-20"></span>
            </div>
            {values.rules.map((rule, index) => {
              const labelError = getIn(errors, `rules[${index}].label`)
              const labelTouched = getIn(touched, `rules[${index}].label`)
              const minError = getIn(errors, `rules[${index}].min`)
              const minTouched = getIn(touched, `rules[${index}].min`)
              const maxError = getIn(errors, `rules[${index}].max`)
              const maxTouched = getIn(touched, `rules[${index}].max`)
              const colorError = getIn(errors, `rules[${index}].color`)
              const colorTouched = getIn(touched, `rules[${index}].color`)

              return (
                <div
                  key={index}
                  className="mt-4 flex w-full items-center gap-4"
                >
                  <div className="relative flex w-full flex-col">
                    <Input
                      type="text"
                      name={`rules[${index}].label`}
                      value={rule.label}
                      onChange={(e) =>
                        handleRuleChange(index, 'label', e.target.value)
                      }
                      onBlur={handleBlur}
                      placeholder="Label"
                      className="rounded border p-2"
                    />
                    {labelTouched && labelError && (
                      <ErrorText error={labelError} />
                    )}
                  </div>
                  <div className="relative flex w-full flex-col">
                    <Input
                      type="number"
                      min={0}
                      name={`rules[${index}].min`}
                      step="any"
                      value={rule.min}
                      onChange={(e) =>
                        handleRuleChange(index, 'min', e.target.value)
                      }
                      onBlur={handleBlur}
                      placeholder="Min"
                      className="rounded border p-2"
                    />
                    {minTouched && minError && <ErrorText error={minError} />}
                  </div>
                  <div className="relative flex w-full flex-col">
                    <Input
                      type="number"
                      min={0 || rule.min} // Set minimum value based on current min
                      name={`rules[${index}].max`}
                      step="any"
                      value={rule.max}
                      onChange={(e) =>
                        handleRuleChange(index, 'max', e.target.value)
                      }
                      onBlur={handleBlur}
                      placeholder="Max"
                      className="rounded border p-2"
                    />
                    {maxTouched && maxError && <ErrorText error={maxError} />}
                  </div>
                  <div className="relative flex w-40 flex-col">
                    <Input
                      type="color"
                      name={`rules[${index}].color`}
                      value={rule.color}
                      onChange={(e) =>
                        handleRuleChange(index, 'color', e.target.value)
                      }
                      onBlur={handleBlur}
                      className="rounded border p-2"
                    />
                    {colorTouched && colorError && (
                      <ErrorText error={colorError} />
                    )}
                  </div>
                  <Button
                    type="button"
                    variant={'icon'}
                    className="px-1 text-red-500 hover:scale-105"
                    onClick={() => handleRemoveRule(index)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              )
            })}
          </div>
          <button
            type="button"
            onClick={handleAddRule}
            className="self-end text-sm text-primary hover:underline"
          >
            + {t('add-more')}
          </button>
        </div>
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

export default StatusForm
