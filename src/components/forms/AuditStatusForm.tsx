'use client'

import { toast } from '@/hooks/use-toast'
import {
  createAuditStatus,
  updateAuditStatusById,
} from '@/lib/actions/kpi-dimensions/audit-status.actions'
import {
  auditStatusSchema,
  IAuditStatusManipulator,
} from '@/schema/kpi-dimensions/audit-status.schema'
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

interface IAuditStatusFormProps {
  data?: IAuditStatusResponse
}

const AuditStatusForm: FC<IAuditStatusFormProps> = ({
  data: auditStatusData,
}) => {
  const isEdit = !!auditStatusData
  const queryClient = useQueryClient()
  const t = useTranslations('general')

  const { actions } = useSheetStore((store) => store)
  const { closeSheet } = actions

  const initialRules =
    auditStatusData?.auditRules && auditStatusData.auditRules.length > 0
      ? auditStatusData.auditRules
      : [{ label: '', color: '#000000' }]
  // Format dates for initial values
  const initialValues = {
    name: auditStatusData?.name ?? '',
    auditRules: initialRules,
  }

  const formik = useFormik<IAuditStatusManipulator>({
    initialValues,
    enableReinitialize: false,
    validationSchema: toFormikValidationSchema(auditStatusSchema),
    onSubmit: (values) => {
      // Additional validation
      const validRules = values.auditRules.filter(
        (rule) => rule.label.trim() !== '' && rule.color.trim() !== '',
      )

      if (validRules.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Validation Error',
          description: 'At least one valid audit rule is required',
        })
        return
      }

      if (isEdit && auditStatusData) {
        editMutation(auditStatusData.id)
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
    mutationFn: async () => await createAuditStatus(values),
    onSuccess: (newData) => {
      queryClient.setQueryData(
        ['audit-status'],
        (oldData: IAuditStatusResponse[] | undefined) => {
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
    mutationFn: async (id: number) => {
      return await updateAuditStatusById(id, values)
    },
    onSuccess: (updatedData, id) => {
      queryClient.setQueryData(
        ['audit-status'],
        (oldData: IAuditStatusResponse[] | undefined) => {
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
      console.error('Update error:', error)
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error?.message || 'An error occurred while updating',
      })
    },
  })

  const isLoading = addLoading || editLoading

  // Handler to add a new empty rule row
  const handleAddRule = () => {
    setFieldValue('auditRules', [
      ...values.auditRules,
      { label: '', color: '#000000' },
    ])
  }

  // Handler to remove a rule row by index
  const handleRemoveRule = (index: number) => {
    const updatedRules = values.auditRules.filter((_, i) => i !== index)
    setFieldValue('auditRules', updatedRules)
  }

  // Handler for individual rule change
  const handleRuleChange = (
    index: number,
    field: 'label' | 'color',
    value: string,
  ) => {
    const updatedRules = [...values.auditRules]

    updatedRules[index] = { ...updatedRules[index], [field]: value }
    setFieldValue('auditRules', updatedRules)
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
          <h2 className="text-base font-medium text-zinc-800">
            {t('audit-rules')}
          </h2>
          <div className="flex w-full flex-col items-center text-sm">
            <div className="flex w-full items-center gap-4 text-sm">
              <span className="w-full">{t('label')}</span>
              <span className="w-40">{t('color')}</span>
              <span className="w-20"></span>
            </div>
            {values.auditRules.map((rule, index) => {
              const labelError = getIn(errors, `auditRules[${index}].label`)
              const labelTouched = getIn(touched, `auditRules[${index}].label`)
              const colorError = getIn(errors, `auditRules[${index}].color`)
              const colorTouched = getIn(touched, `auditRules[${index}].color`)

              return (
                <div
                  key={index}
                  className="mt-4 flex w-full items-center gap-4"
                >
                  <div className="relative flex w-full flex-col">
                    <Input
                      type="text"
                      name={`auditRules[${index}].label`}
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
                  <div className="relative flex w-40 flex-col">
                    <Input
                      type="color"
                      name={`auditRules[${index}].color`}
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

export default AuditStatusForm
