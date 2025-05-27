/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { INDICATOR_FORM_STEPS } from '@/constants/stepper-constants'
import { toast } from '@/hooks/use-toast'
import {
  createIndicator,
  getAttributeTypes,
  getFieldAttributeValues,
} from '@/lib/actions/indicator.actions'
import { transformIndicatorFormData } from '@/lib/transformers'
import { getNestedError } from '@/lib/utils'
import {
  IIndicatorManipulator,
  indicatorSchema,
} from '@/schema/indicator.schema'
import { useSheetStore } from '@/stores/sheet-store'
import { IField, ILevel, IMongoIndicator } from '@/types/indicator'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useFormik } from 'formik'
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { FC, useEffect, useRef, useState } from 'react'
import { toFormikValidationSchema } from 'zod-formik-adapter'
import ErrorText from '../shared/ErrorText'
import LabeledInput from '../shared/inputs/LabeledInput'
import StepperIndicator from '../shared/stepper/StepperIndicator'
import LabeledTextArea from '../shared/textArea/LabeledTextArea'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Switch } from '../ui/switch'

interface IIndicatorFormProps {
  data?: IMongoIndicator
}

interface IDynamicFieldProps {
  fieldIndex: number
  getFieldProps: ReturnType<typeof useFormik>['getFieldProps']
  setFieldValue: (field: string, value: any) => void
  errors: Record<string, any>
  onDelete: () => void
  totalFields: number
  currentPath: string
}

interface ILevelComponentProps {
  levelIndex: number[]
  getFieldProps: ReturnType<typeof useFormik>['getFieldProps']
  touched: Record<string, any>
  errors: Record<string, any>
  values: IIndicatorManipulator
  setFieldValue: (field: string, value: any) => void
  depth?: number
  parentPath?: string
  totalAllowedLevels?: number
  onDelete?: () => void
  showDelete?: boolean
}

interface IAttributeType {
  _id: string
  name: string
  description?: string
}

const LevelComponent: FC<ILevelComponentProps> = ({
  levelIndex,
  getFieldProps,
  touched,
  errors,
  values,
  setFieldValue,
  depth = 0,
  totalAllowedLevels = 1,
  onDelete,
  showDelete = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const t = useTranslations('general')

  // Build the path based on the level index
  const currentPath =
    levelIndex.length === 1
      ? `levels.${levelIndex[0]}`
      : `levels.${levelIndex[0]}.subLevels.${levelIndex.slice(1).join('.subLevels.')}`

  // Get current level data
  let currentLevel = values.levels[levelIndex[0]]
  for (let i = 1; i < levelIndex.length; i++) {
    currentLevel = currentLevel?.subLevels?.[levelIndex[i]]
  }

  // Calculate if we can add more sublevels based on current depth and total allowed levels
  const canAddSubLevel = depth < (totalAllowedLevels ?? 1) - 1

  const addSubLevel = (): void => {
    const currentSubLevels = currentLevel?.subLevels ?? []
    const newSubLevel = {
      levelName: '',
      fields: [{ attributeName: '', value: '', type: '' }],
      subLevels: [],
      depth: depth + 1,
    }

    setFieldValue(`${currentPath}.subLevels`, [
      ...currentSubLevels,
      newSubLevel,
    ])
  }

  return (
    <div
      className="mb-6 rounded-lg border-2 p-4"
      style={{ marginLeft: `${depth * 20}px` }}
    >
      <div className="mb-4 flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1"
        >
          {isExpanded ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </Button>
        <div className="flex-1">
          <LabeledInput
            label={`${t('level')} ${depth === 0 ? '1.' + (levelIndex[0] + 1) : depth + 1 + '.' + (levelIndex[levelIndex.length - 1] + 1)} ${t('name')}`}
            placeholder={t('level-name-placeholder')}
            {...getFieldProps(`${currentPath}.levelName`)}
            error={getNestedError(
              errors as NestedErrors,
              `${currentPath}.levelName`,
            )}
          />
        </div>
        {showDelete && onDelete && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hover:bg-destructive/10 mt-6 hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>

      {isExpanded && (
        <>
          <div className="my-4 flex w-full justify-end">
            {canAddSubLevel && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSubLevel}
                className="flex items-center gap-2"
              >
                <Plus className="size-4" /> {t('add-sub-level')}
              </Button>
            )}
          </div>

          {(currentLevel?.subLevels ?? []).map(
            (_: ILevel, subIndex: number) => {
              return (
                <LevelComponent
                  key={subIndex}
                  levelIndex={[...levelIndex, subIndex]}
                  // levelNumber={(depth + 2).toString()}
                  getFieldProps={getFieldProps}
                  touched={touched}
                  errors={errors}
                  values={values}
                  setFieldValue={setFieldValue}
                  depth={depth + 1}
                  parentPath={currentPath}
                  totalAllowedLevels={totalAllowedLevels}
                  showDelete={
                    depth > 0 ? true : currentLevel?.subLevels?.length > 1
                  }
                  onDelete={() => {
                    const newSubLevels = [...(currentLevel?.subLevels ?? [])]
                    newSubLevels.splice(subIndex, 1)
                    setFieldValue(`${currentPath}.subLevels`, newSubLevels)
                  }}
                />
              )
            },
          )}
        </>
      )}
    </div>
  )
}

const DynamicField: FC<IDynamicFieldProps> = ({
  fieldIndex,
  getFieldProps,
  setFieldValue,
  errors,
  onDelete,
  totalFields,
  currentPath,
}) => {
  const t = useTranslations('general')
  const isArabic = usePathname().includes('/ar')
  // Use refs to maintain state across renders and Dialog open/close cycles
  const formValueRef = useRef<string>('')
  const arrayValuesRef = useRef<string[]>([])
  const previousValuesRef = useRef<string[]>([])
  const [isArrayValueDialogOpen, setIsArrayValueDialogOpen] = useState(false)
  const [localArrayValues, setLocalArrayValues] = useState<string[]>([])
  const [newArrayValue, setNewArrayValue] = useState('')
  const [duplicateError, setDuplicateError] = useState<string | null>(null)
  const [urlError, setUrlError] = useState<string>('')
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const { data: attributeTypes = [] } = useQuery<IAttributeType[]>({
    queryKey: ['attributeTypes'],
    queryFn: getAttributeTypes,
  })

  const fieldPath = `${currentPath}.fields.${fieldIndex}`
  const currentType = getFieldProps(`${fieldPath}.type`).value
  const currentAttributeType = attributeTypes.find(
    (type) => type._id === currentType,
  )
  const fieldValueId = getFieldProps(`${fieldPath}.fieldValueId`).value

  // Add query to fetch field values if fieldValueId exists
  const { data: savedArrayValues = [] } = useQuery({
    queryKey: ['fieldValues', fieldValueId],
    queryFn: () => getFieldAttributeValues(fieldValueId),
    enabled:
      !!fieldValueId && currentAttributeType?.name.toLowerCase() === 'array',
  })

  // This effect runs when savedArrayValues change
  useEffect(() => {
    if (
      currentAttributeType?.name.toLowerCase() === 'array' &&
      savedArrayValues.length > 0
    ) {
      const currentSavedValues = JSON.stringify(savedArrayValues)
      const previousValues = JSON.stringify(previousValuesRef.current)

      // Only update if the values have actually changed
      if (currentSavedValues !== previousValues || isInitialLoad) {
        arrayValuesRef.current = savedArrayValues
        setLocalArrayValues(savedArrayValues)
        previousValuesRef.current = savedArrayValues

        // If there's a current value, keep it only if it exists in the new array
        const currentValue = getFieldProps(`${fieldPath}.value`).value
        if (!currentValue || !savedArrayValues.includes(currentValue)) {
          setFieldValue(`${fieldPath}.value`, '')
        }

        if (isInitialLoad) {
          setIsInitialLoad(false)
        }
      }
    }
  }, [savedArrayValues, fieldPath, currentAttributeType?.name, isInitialLoad])

  // This effect handles non-saved array values
  useEffect(() => {
    if (
      currentAttributeType?.name.toLowerCase() === 'array' &&
      !savedArrayValues.length
    ) {
      try {
        const currentValue = getFieldProps(`${fieldPath}.value`).value
        const arrayValues = getFieldProps(`${fieldPath}.arrayValues`).value

        if (Array.isArray(arrayValues) && arrayValues.length > 0) {
          arrayValuesRef.current = arrayValues
          setLocalArrayValues(arrayValues)
          formValueRef.current = JSON.stringify(arrayValues)
        } else if (currentValue && currentValue.trim() !== '') {
          try {
            const parsedValues = JSON.parse(currentValue)
            if (Array.isArray(parsedValues)) {
              arrayValuesRef.current = parsedValues
              setLocalArrayValues(parsedValues)
              formValueRef.current = currentValue
            } else {
              arrayValuesRef.current = [currentValue]
              setLocalArrayValues([currentValue])
              formValueRef.current = JSON.stringify([currentValue])
            }
          } catch {
            arrayValuesRef.current = [currentValue]
            setLocalArrayValues([currentValue])
            formValueRef.current = JSON.stringify([currentValue])
          }
        }
      } catch (e) {
        console.error('Error handling array values:', e)
        if (isInitialLoad) {
          arrayValuesRef.current = []
          setLocalArrayValues([])
          formValueRef.current = ''
          setIsInitialLoad(false)
        }
      }
    }
  }, [
    currentAttributeType?.name,
    fieldPath,
    savedArrayValues.length,
    isInitialLoad,
  ])

  // Handle adding a new array value
  const handleAddArrayValue = () => {
    if (!newArrayValue.trim()) return

    // Check for duplicates (case insensitive)
    if (
      arrayValuesRef.current.some(
        (value) => value.toLowerCase() === newArrayValue.trim().toLowerCase(),
      )
    ) {
      setDuplicateError('This value already exists in the array')
      return
    }

    // Create new array with the added value
    const updatedValues = [...arrayValuesRef.current, newArrayValue.trim()]

    // Update refs and state
    arrayValuesRef.current = updatedValues
    setLocalArrayValues(updatedValues)

    // Update form value - select the newly added value as the current selection
    const selectedValue = newArrayValue.trim()
    setFieldValue(`${fieldPath}.value`, selectedValue)

    // Also store the complete array of values for later use
    setFieldValue(`${fieldPath}.arrayValues`, updatedValues)

    // Clear input and error
    setNewArrayValue('')
    setDuplicateError(null)
  }

  // Handle deleting an array value
  const handleDeleteArrayValue = (index: number) => {
    // Create new array without the deleted item
    const updatedValues = arrayValuesRef.current.filter((_, i) => i !== index)

    // Update refs and state
    arrayValuesRef.current = updatedValues
    setLocalArrayValues(updatedValues)

    // Update form value
    const jsonString = JSON.stringify(updatedValues)
    formValueRef.current = jsonString
    setFieldValue(`${fieldPath}.value`, '') // Clear selected value if array changes

    // Also update the full array values for the field
    setFieldValue(`${fieldPath}.arrayValues`, updatedValues)
  }

  // Sync array values with form when dialog opens
  const handleDialogOpenChange = (open: boolean) => {
    if (open) {
      // When opening the dialog, refresh array values from current form state
      try {
        const currentValue = getFieldProps(`${fieldPath}.value`).value
        if (currentValue && currentValue.trim() !== '') {
          const parsedValues = JSON.parse(currentValue)
          arrayValuesRef.current = parsedValues
          setLocalArrayValues(parsedValues)
          formValueRef.current = currentValue
        }
      } catch {
        // Use existing values if parsing fails
      }
    }
    setIsArrayValueDialogOpen(open)
  }

  const renderValueInput = () => {
    if (!currentAttributeType) return null
    switch (currentAttributeType.name.toLowerCase()) {
      case 'array':
        return (
          <div className="flex w-full items-end gap-2">
            <div className="relative flex w-full flex-col gap-1">
              <label className="text-sm font-medium text-neutral-800">
                {t('manage-first')}
              </label>
              <Select
                value={getFieldProps(`${fieldPath}.value`).value}
                onValueChange={(selectedValue) => {
                  // Allow the Select component to display the selected value
                  // without modifying the underlying array
                  setFieldValue(`${fieldPath}.value`, selectedValue)
                }}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={t('select-value')} />
                </SelectTrigger>
                <SelectContent>
                  {localArrayValues.map((value, index) => (
                    <SelectItem key={index} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Dialog
              open={isArrayValueDialogOpen}
              onOpenChange={handleDialogOpenChange}
            >
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="size-4" /> {t('manage-values')}
                </Button>
              </DialogTrigger>

              <DialogContent
                className="sm:max-w-md"
                dir={isArabic ? 'rtl' : 'ltr'}
              >
                <DialogHeader>
                  <DialogTitle>{t('manage-array-values')}</DialogTitle>
                  <DialogDescription>
                    {t('add-or-remove-values')}
                  </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                  {/* Display existing values with delete buttons */}
                  {localArrayValues.length > 0 ? (
                    <ul className="list-disc space-y-2 pl-6">
                      {localArrayValues.map((value, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between gap-2"
                        >
                          <span>{value}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteArrayValue(index)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {t('no-values-added-yet')}
                    </p>
                  )}

                  {/* Add new value input field */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-end gap-2">
                      <LabeledInput
                        label=""
                        type="text"
                        placeholder={t('enter-new-value')}
                        value={newArrayValue}
                        onChange={(e) => {
                          setNewArrayValue(e.target.value)
                          if (duplicateError) setDuplicateError(null)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddArrayValue()
                          }
                        }}
                        error={duplicateError ?? ''}
                      />
                      <Button
                        type="button"
                        onClick={handleAddArrayValue}
                        className="mt-6"
                      >
                        {t('add')}
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )
      case 'object':
        return (
          <LabeledTextArea
            label={t('value-object')}
            placeholder={t('value-object-placeholder')}
            {...getFieldProps(`${fieldPath}.value`)}
            error={getNestedError(errors as NestedErrors, `${fieldPath}.value`)}
            onChange={(e) => {
              try {
                // Validate JSON format
                JSON.parse(e.target.value)
                setFieldValue(`${fieldPath}.value`, e.target.value)
              } catch {
                // If invalid JSON, still update the field but it will show validation error
                setFieldValue(`${fieldPath}.value`, e.target.value)
              }
            }}
          />
        )
      case 'yes/no':
        return (
          <div className="flex h-14 w-full items-end justify-start gap-3">
            <span className="text-sm font-medium leading-[1.05625rem] text-zinc-500">
              {t('no')}
            </span>
            <Switch
              id="yes-no-mode"
              dir={isArabic ? 'rtl' : 'ltr'}
              checked={getFieldProps(`${fieldPath}.value`).value === true}
              onCheckedChange={(checked) => {
                setFieldValue(`${fieldPath}.value`, checked)
              }}
            />
            <span className="text-sm font-medium leading-[1.05625rem] text-zinc-500">
              {t('yes')}
            </span>
          </div>
        )
      case 'attachment':
        return (
          <LabeledInput
            label={t('value-url')}
            type="url"
            placeholder={t('value-url-placeholder')}
            {...getFieldProps(`${fieldPath}.value`)}
            error={
              urlError ||
              getNestedError(errors as NestedErrors, `${fieldPath}.value`)
            }
            onChange={(e) => {
              // Validate URL format
              const urlPattern =
                /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
              const isValidUrl = urlPattern.test(e.target.value)

              // Set the field value
              setFieldValue(`${fieldPath}.value`, e.target.value)

              // Set URL validation error if invalid
              if (!isValidUrl && e.target.value.trim() !== '') {
                setUrlError('Please enter a valid URL')
              } else {
                setUrlError('')
              }
            }}
          />
        )
      case 'number':
        return (
          <LabeledInput
            label={t('value-optional')}
            type="number"
            placeholder={t('value-number-placeholder')}
            {...getFieldProps(`${fieldPath}.value`)}
            onChange={(e) => {
              // Convert the number input to a string before setting it in the form
              setFieldValue(`${fieldPath}.value`, e.target.value.toString())
            }}
            error={getNestedError(errors as NestedErrors, `${fieldPath}.value`)}
          />
        )
      default:
        return (
          <LabeledInput
            label={t('value-optional')}
            type={currentAttributeType.name.toLowerCase() ?? 'text'}
            placeholder={t('value-placeholder')}
            {...getFieldProps(`${fieldPath}.value`)}
            error={getNestedError(errors as NestedErrors, `${fieldPath}.value`)}
          />
        )
    }
  }

  return (
    <div className="mb-4 flex items-start gap-4">
      <LabeledInput
        label={`${t('field')} ${fieldIndex + 1} ${t('Name')}*`}
        placeholder={t('field-placeholder')}
        {...getFieldProps(`${fieldPath}.attributeName`)}
        error={getNestedError(
          errors as NestedErrors,
          `${fieldPath}.attributeName`,
        )}
      />
      <div className="relative flex flex-col gap-1">
        <label className="text-sm font-medium text-neutral-800">
          {t('type')}*
        </label>
        <Select
          value={getFieldProps(`${fieldPath}.type`).value}
          onValueChange={(value) => {
            setFieldValue(`${fieldPath}.type`, value)
            setFieldValue(`${fieldPath}.value`, '') // Reset value when type changes
          }}
        >
          <SelectTrigger className="h-11 w-52">
            <SelectValue placeholder={t('select-type')} />
          </SelectTrigger>
          <SelectContent>
            {attributeTypes.map((type) => (
              <SelectItem key={type._id} value={type._id}>
                {t(type.name?.toLocaleLowerCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {getNestedError(errors as NestedErrors, `${fieldPath}.type`) && (
          <ErrorText
            error={getNestedError(errors as NestedErrors, `${fieldPath}.type`)}
          />
        )}
      </div>
      {renderValueInput()}
      {totalFields > 1 && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hover:bg-destructive/10 mt-6 hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="size-4" />
        </Button>
      )}
    </div>
  )
}

const IndicatorForm: FC<IIndicatorFormProps> = ({ data }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const { actions } = useSheetStore((store) => store)
  const { closeSheet } = actions
  const t = useTranslations('general')
  const queryClient = useQueryClient()

  const initialValues = {
    name: data?.name || '',
    description: data?.description || '',
    numberOfLevels: data?.numberOfLevels || 1,
    levels: data?.levels || [],
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
    validateField,
  } = formik

  // Effect to create initial level if none exists
  useEffect(() => {
    if (formik.values.levels.length === 0) {
      formik.setFieldValue('levels', [
        {
          levelName: '',
          fields: [{ attributeName: '', value: '', type: '' }],
          subLevels: [],
          depth: 0,
        },
      ])
    }
  }, [formik.values.levels.length, formik.setFieldValue])

  // Effect to handle numberOfLevels changes
  useEffect(() => {
    const prevNumberOfLevels =
      values.levels.reduce((maxDepth, level) => {
        const getMaxDepth = (l: ILevel): number => {
          if (!l.subLevels?.length) return l.depth ?? 0
          return Math.max(...l.subLevels.map((sl) => getMaxDepth(sl)))
        }
        return Math.max(maxDepth, getMaxDepth(level))
      }, 0) + 1

    if (prevNumberOfLevels !== values.numberOfLevels) {
      const trimNestedLevels = (
        levels: ILevel[],
        currentDepth: number,
        maxDepth: number,
      ): ILevel[] => {
        return levels.map((level) => ({
          ...level,
          subLevels:
            currentDepth < maxDepth - 1 && level.subLevels?.length
              ? trimNestedLevels(level.subLevels, currentDepth + 1, maxDepth)
              : [],
        }))
      }

      const trimmedLevels = trimNestedLevels(
        values.levels,
        0,
        values.numberOfLevels,
      )
      setFieldValue('levels', trimmedLevels, false)
    }
  }, [values.numberOfLevels])

  const addTopLevel = (): void => {
    const currentLevels = values.levels ?? []
    setFieldValue('levels', [
      ...currentLevels,
      {
        levelName: '',
        fields: [{ attributeName: '', value: '', type: '' }],
        subLevels: [],
        depth: 0,
      },
    ])
  }

  const validateNestedLevels = async (
    levels: ILevel[],
    basePath: string,
  ): Promise<boolean> => {
    let isValid = true
    for (let i = 0; i < levels.length; i++) {
      const currentPath = `${basePath}.${i}`
      await validateField(`${currentPath}.levelName`)

      // Validate current level's name
      const levelErrors = errors.levels?.[i] as { levelName?: string }
      if (levelErrors?.levelName) {
        isValid = false
      }

      // Validate sub-levels recursively
      if (levels[i].subLevels?.length > 0) {
        const subLevelsValid = await validateNestedLevels(
          levels[i].subLevels,
          `${currentPath}.subLevels`,
        )
        isValid = isValid && subLevelsValid
      }
    }
    return isValid
  }

  const validateStep = async () => {
    switch (currentStep) {
      case 0: {
        await validateField('name')
        await validateField('numberOfLevels')
        const isNameValid = !errors.name
        const isDepthValid = !errors.numberOfLevels && values.numberOfLevels > 0

        if (!isNameValid || !isDepthValid) {
          setFieldValue('name', values.name, true)
          setFieldValue('numberOfLevels', values.numberOfLevels, true)
          return false
        }
        return true
      }
      case 1:
        return await validateNestedLevels(values.levels, 'levels')
      case 2:
        return true
      default:
        return false
    }
  }

  const handleNext = async (): Promise<void> => {
    if (await validateStep()) {
      if (currentStep === INDICATOR_FORM_STEPS.length - 1) {
        handleSubmit()
      } else {
        setCurrentStep((prev) => prev + 1)
      }
    }
  }

  const handleBack = (): void => {
    setCurrentStep((prev) => prev - 1)
  }

  const handleStepClick = (step: number): void => {
    if (step < currentStep) {
      setCurrentStep(step)
    }
  }

  const { mutate: addMutation, isPending: addLoading } = useMutation({
    mutationFn: async (values: IIndicatorManipulator) => {
      const transformedData = transformIndicatorFormData(values)
      return await createIndicator(transformedData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['indicators'],
      })
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="flex w-full flex-col items-center gap-3">
            <LabeledInput
              label={t('indicator-name')}
              placeholder={t('indicator-name-placeholder')}
              {...getFieldProps('name')}
              error={touched.name && errors.name ? errors.name : ''}
            />
            <LabeledTextArea
              label={t('indicator-textArea-description')}
              placeholder={t('indicator-textArea-description-placeholder')}
              className="resize-none"
              {...getFieldProps('description')}
              error={
                touched.description && errors.description
                  ? errors.description
                  : ''
              }
            />
            <LabeledInput
              label={t('indicator-depth')}
              type="number"
              min={1}
              max={5}
              placeholder={t('indicator-depth-placeholder')}
              {...getFieldProps('numberOfLevels')}
              onChange={(e) => {
                const value = parseInt(e.target.value)
                if (value > 5) {
                  setFieldValue('numberOfLevels', 5)
                } else if (value < 1) {
                  setFieldValue('numberOfLevels', 1)
                } else {
                  setFieldValue('numberOfLevels', value)
                }
              }}
              error={
                touched.numberOfLevels && errors.numberOfLevels
                  ? errors.numberOfLevels
                  : ''
              }
            />
          </div>
        )
      case 1:
        return (
          <div className="w-full">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">{t('level-configuration')}</h2>
              <Button
                type="button"
                variant="outline"
                onClick={addTopLevel}
                className="flex items-center gap-2"
              >
                <Plus className="size-4" /> {t('add-level')}
              </Button>
            </div>
            {values.levels.map((level: ILevel, index: number) => (
              <LevelComponent
                key={index}
                levelIndex={[index]}
                // levelNumber={(index + 1).toString()}
                getFieldProps={getFieldProps}
                touched={touched}
                errors={errors}
                values={values}
                setFieldValue={setFieldValue}
                totalAllowedLevels={values.numberOfLevels}
                showDelete={values.levels.length > 1}
                onDelete={() => {
                  const newLevels = [...values.levels]
                  newLevels.splice(index, 1)
                  setFieldValue('levels', newLevels)
                }}
              />
            ))}
          </div>
        )
      case 2: {
        const renderLevel = (level: ILevel, levelPaths: number[]) => {
          const currentPath =
            levelPaths.length === 1
              ? `levels.${levelPaths[0]}`
              : `levels.${levelPaths[0]}.subLevels.${levelPaths.slice(1).join('.subLevels.')}`

          return (
            <div
              key={currentPath}
              className="mb-6 rounded-lg border-2 p-4"
              style={{ marginLeft: `${(levelPaths.length - 1) * 32}px` }}
            >
              <h3 className="mb-4 text-lg font-semibold">{level.levelName}</h3>{' '}
              {level.fields.map((field: IField, fieldIndex: number) => (
                <DynamicField
                  key={fieldIndex}
                  // levelIndex={levelPaths}
                  fieldIndex={fieldIndex}
                  getFieldProps={getFieldProps}
                  setFieldValue={setFieldValue}
                  // touched={touched}
                  errors={errors}
                  onDelete={() => {
                    const currentFields = [...level.fields]
                    currentFields.splice(fieldIndex, 1)
                    setFieldValue(`${currentPath}.fields`, currentFields)
                  }}
                  totalFields={level.fields.length}
                  currentPath={currentPath}
                />
              ))}
              <div className="mb-4 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentFields = [...level.fields]
                    setFieldValue(`${currentPath}.fields`, [
                      ...currentFields,
                      { attributeName: '', value: '', type: '' },
                    ])
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus className="size-4" /> {t('add-field')}
                </Button>
              </div>
              {level.subLevels?.map((subLevel: ILevel, subIndex: number) =>
                renderLevel(subLevel, [...levelPaths, subIndex]),
              )}
            </div>
          )
        }

        return (
          <div className="w-full">
            <h2 className="mb-4 text-xl font-bold">
              {t('field-configuration')}
            </h2>
            {values.levels.map((level: ILevel, index: number) =>
              renderLevel(level, [index]),
            )}
          </div>
        )
      }
      default:
        return null
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="styleScrollbar flex size-full max-h-full flex-col justify-between overflow-y-auto"
    >
      <div className="mb-8">
        <StepperIndicator
          steps={INDICATOR_FORM_STEPS}
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />
      </div>

      <div className="flex-1">{renderStepContent()}</div>

      <div className="mt-5 flex w-full items-center justify-end gap-3">
        {currentStep > 0 && (
          <Button
            type="button"
            variant="outline"
            className="w-full max-w-36 sm:max-w-[10.25rem]"
            onClick={handleBack}
          >
            {t('back')}
          </Button>
        )}
        <Button
          type="button"
          disabled={isLoading}
          isLoading={isLoading}
          className="w-full max-w-36 sm:max-w-[10.25rem]"
          onClick={handleNext}
        >
          {currentStep === INDICATOR_FORM_STEPS.length - 1
            ? t('save')
            : t('next')}
        </Button>
      </div>
    </form>
  )
}

export default IndicatorForm
