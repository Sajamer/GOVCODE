/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { toast } from '@/hooks/use-toast'
import { createIndicator } from '@/lib/actions/indicator.actions'
import { transformIndicatorFormData } from '@/lib/transformers'
import {
  IIndicatorManipulator,
  indicatorSchema,
} from '@/schema/indicator.schema'
import { useSheetStore } from '@/stores/sheet-store'
import { useMutation } from '@tanstack/react-query'
import { useFormik } from 'formik'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { FC, useEffect } from 'react'
import { toFormikValidationSchema } from 'zod-formik-adapter'
import LabeledInput from '../shared/inputs/LabeledInput'
import LabeledTextArea from '../shared/textArea/LabeledTextArea'
import { Button } from '../ui/button'

interface IIndicatorFormProps {
  data?: unknown
}

interface IDynamicFieldProps {
  levelIndex: number
  fieldIndex: number
  getFieldProps: ReturnType<typeof useFormik>['getFieldProps']
  touched: Record<string, any>
  errors: Record<string, any>
}

interface ILevelComponentProps {
  levelIndex: number
  getFieldProps: ReturnType<typeof useFormik>['getFieldProps']
  touched: Record<string, any>
  errors: Record<string, any>
  values: IIndicatorManipulator
  setFieldValue: (field: string, value: any) => void
}

const DynamicField: FC<IDynamicFieldProps> = ({
  levelIndex,
  fieldIndex,
  getFieldProps,
  touched,
  errors,
}) => {
  return (
    <div className="mb-4 flex gap-4">
      <LabeledInput
        label={`Field ${fieldIndex + 1} Name`}
        placeholder="Enter attribute name"
        {...getFieldProps(
          `levels.${levelIndex}.fields.${fieldIndex}.attributeName`,
        )}
        error={
          touched.levels?.[levelIndex]?.fields?.[fieldIndex]?.attributeName &&
          errors.levels?.[levelIndex]?.fields?.[fieldIndex]?.attributeName
            ? errors.levels?.[levelIndex]?.fields?.[fieldIndex]?.attributeName
            : ''
        }
      />
      <LabeledInput
        label="Value (optional)"
        placeholder="Enter value"
        {...getFieldProps(`levels.${levelIndex}.fields.${fieldIndex}.value`)}
        error={
          touched.levels?.[levelIndex]?.fields?.[fieldIndex]?.value &&
          errors.levels?.[levelIndex]?.fields?.[fieldIndex]?.value
            ? errors.levels?.[levelIndex]?.fields?.[fieldIndex]?.value
            : ''
        }
      />
    </div>
  )
}

const LevelComponent: FC<ILevelComponentProps> = ({
  levelIndex,
  getFieldProps,
  touched,
  errors,
  values,
  setFieldValue,
}) => {
  const addField = () => {
    // Add null check and default to empty array
    const currentFields = values.levels?.[levelIndex]?.fields ?? []
    setFieldValue(`levels.${levelIndex}.fields`, [
      ...currentFields,
      { attributeName: '', value: '' },
    ])
  }

  return (
    <div className="mb-6 rounded-lg border-2 p-4">
      <LabeledInput
        label={`Level ${levelIndex + 1} Name`}
        placeholder="Enter level name"
        {...getFieldProps(`levels.${levelIndex}.levelName`)}
        error={
          touched.levels?.[levelIndex]?.levelName &&
          errors.levels?.[levelIndex]?.levelName
            ? errors.levels?.[levelIndex]?.levelName
            : ''
        }
      />
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="mb-2 font-semibold underline">Fields:</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addField}
            className="flex items-center gap-2"
          >
            <Plus className="size-4" /> Add Field
          </Button>
        </div>
        {/* Add null check and default to empty array */}
        {(values.levels?.[levelIndex]?.fields ?? []).map((_, fieldIndex) => (
          <DynamicField
            key={fieldIndex}
            levelIndex={levelIndex}
            fieldIndex={fieldIndex}
            getFieldProps={getFieldProps}
            touched={touched}
            errors={errors}
          />
        ))}
      </div>
    </div>
  )
}

const IndicatorForm: FC<IIndicatorFormProps> = () => {
  const { actions } = useSheetStore((store) => store)
  const { closeSheet } = actions
  const t = useTranslations('general')

  // Format dates for initial values
  const initialValues = {
    name: '',
    description: '',
    numberOfLevels: 0,
    levels: [],
  }

  const formik = useFormik<IIndicatorManipulator>({
    initialValues,
    enableReinitialize: false,
    validationSchema: toFormikValidationSchema(indicatorSchema),
    onSubmit: (values) => {
      addMutation(values)
    },
  })

  const {
    errors,
    getFieldProps,
    handleSubmit,
    touched,
    values,
    setFieldValue,
  } = formik

  useEffect(() => {
    const levels = Array(Number(values.numberOfLevels))
      .fill(null)
      .map(() => ({
        levelName: '',
        fields: [
          { attributeName: '', value: '' }, // Start with just one field
        ],
      }))
    setFieldValue('levels', levels)
  }, [values.numberOfLevels, setFieldValue])

  const { mutate: addMutation, isPending: addLoading } = useMutation({
    mutationFn: async (values: IIndicatorManipulator) => {
      const transformedData = transformIndicatorFormData(values)
      return await createIndicator(transformedData)
    },
    onSuccess: () => {
      toast({
        variant: 'success',
        title: 'Success',
        description: 'Indicator successfully created',
      })
      closeSheet()
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to create indicator',
        description: error?.message || 'An error occurred',
      })
    },
  })

  const isLoading = addLoading

  return (
    <form
      onSubmit={handleSubmit}
      className="styleScrollbar flex size-full max-h-full flex-col justify-between overflow-y-auto"
    >
      <div className="flex w-full flex-col items-center gap-3">
        <LabeledInput
          label={'What is the name of this indicator?'}
          placeholder={'Enter indicator name'}
          {...getFieldProps('name')}
          error={touched.name && errors.name ? errors.name : ''}
        />
        <LabeledTextArea
          label={'What is the description of this indicator?'}
          placeholder={'Enter description here'}
          className="resize-none"
          {...getFieldProps('description')}
          error={
            touched.description && errors.description ? errors.description : ''
          }
        />
        <LabeledInput
          label={'How many levels this indicator have?'}
          type="number"
          min={0}
          max={5}
          placeholder={'Enter number of levels'}
          {...getFieldProps('numberOfLevels')}
          error={
            touched.numberOfLevels && errors.numberOfLevels
              ? errors.numberOfLevels
              : ''
          }
        />
        {/* Render dynamic levels */}
        {values.numberOfLevels > 0 && (
          <div className="mt-6 w-full">
            <h2 className="mb-4 text-xl font-bold">Level Configuration</h2>
            {Array.from({ length: values.numberOfLevels }).map((_, index) => (
              <LevelComponent
                key={index}
                levelIndex={index}
                getFieldProps={getFieldProps}
                touched={touched}
                errors={errors}
                values={values}
                setFieldValue={setFieldValue}
              />
            ))}
          </div>
        )}
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

export default IndicatorForm
