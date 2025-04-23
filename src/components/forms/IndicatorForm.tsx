/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { toast } from '@/hooks/use-toast'
import { createIndicator, getAttributeTypes } from '@/lib/actions/indicator.actions'
import { transformIndicatorFormData } from '@/lib/transformers'
import {
  IIndicatorManipulator,
  indicatorSchema,
} from '@/schema/indicator.schema'
import { useSheetStore } from '@/stores/sheet-store'
import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useFormik } from 'formik'
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { FC, useEffect, useState } from 'react'
import { toFormikValidationSchema } from 'zod-formik-adapter'
import LabeledInput from '../shared/inputs/LabeledInput'
import LabeledTextArea from '../shared/textArea/LabeledTextArea'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import StepperIndicator from '../shared/stepper/StepperIndicator'
import { INDICATOR_FORM_STEPS } from '@/constants/stepper-constants'
import { IMongoIndicator } from '@/types/indicator'
import { IField, ILevel } from '@/types/indicator'
import { getNestedError } from '@/lib/utils'
import ErrorText from '../shared/ErrorText'

interface IIndicatorFormProps {
  data?: IMongoIndicator
}

interface IDynamicFieldProps {
  levelIndex: number[]
  fieldIndex: number
  getFieldProps: ReturnType<typeof useFormik>['getFieldProps']
  setFieldValue: (field: string, value: any) => void
  touched: Record<string, any>
  errors: Record<string, any>
  onDelete: () => void
  totalFields: number
  currentPath: string
}

interface ILevelComponentProps {
  levelIndex: number[]
  levelNumber: string
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
  levelNumber,
  getFieldProps,
  touched,
  errors,
  values,
  setFieldValue,
  depth = 0,
  parentPath = 'levels',
  totalAllowedLevels = 1,
  onDelete,
  showDelete = true
}) => {
  const [isExpanded, setIsExpanded] = useState(true)
  
  // Build the path based on the level index
  const currentPath = levelIndex.length === 1 
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
      depth: depth + 1
    }
    
    setFieldValue(`${currentPath}.subLevels`, [...currentSubLevels, newSubLevel])
  }

  return (
    <div className="mb-6 rounded-lg border-2 p-4" style={{ marginLeft: `${depth * 20}px` }}>
      <div className="flex items-center gap-2 mb-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1"
        >
          {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </Button>
        <div className="flex-1">
          <LabeledInput
            label={`Level ${depth === 0 ? '1.' + (levelIndex[0] + 1) : (depth + 1) + '.' + (levelIndex[levelIndex.length - 1] + 1)} Name`}
            placeholder="Enter level name"
            {...getFieldProps(`${currentPath}.levelName`)}
            error={getNestedError(errors as NestedErrors, `${currentPath}.levelName`)}
          />
        </div>
        {showDelete && onDelete && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mt-6 hover:bg-destructive/10 hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>

      {isExpanded && (
        <>
          <div className="my-4 w-full flex justify-end">
            {canAddSubLevel && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSubLevel}
                className="flex items-center gap-2"
              >
                <Plus className="size-4" /> Add Sub-Level
              </Button>
            )}
          </div>

          {(currentLevel?.subLevels ?? []).map((_: ILevel, subIndex: number) => {
            return (
              <LevelComponent
                key={subIndex}
                levelIndex={[...levelIndex, subIndex]}                
                levelNumber={(depth + 2).toString()}
                getFieldProps={getFieldProps}
                touched={touched}
                errors={errors}
                values={values}
                setFieldValue={setFieldValue}
                depth={depth + 1}
                parentPath={currentPath}
                totalAllowedLevels={totalAllowedLevels}
                showDelete={depth > 0 ? true : currentLevel?.subLevels?.length > 1}
                onDelete={() => {
                  const newSubLevels = [...(currentLevel?.subLevels ?? [])]
                  newSubLevels.splice(subIndex, 1)
                  setFieldValue(`${currentPath}.subLevels`, newSubLevels)
                }}
              />
            )
          })}
        </>
      )}
    </div>
  )
}

const DynamicField: FC<IDynamicFieldProps> = ({
  levelIndex,
  fieldIndex,
  getFieldProps,
  setFieldValue,
  touched,
  errors,
  onDelete,
  totalFields,
  currentPath
}) => {  const { data: attributeTypes = [] } = useQuery<IAttributeType[]>({
    queryKey: ['attributeTypes'],
    queryFn: getAttributeTypes
  })

  const fieldPath = `${currentPath}.fields.${fieldIndex}`

  // Transform attribute types to match Select component format
  const transformedAttributeTypes = attributeTypes.map((type) => ({
    _id: type._id,
    name: type.name,
    description: type.description
  }))

  return (
    <div className="mb-4 flex items-center gap-4">
      <LabeledInput
        label={`Field ${fieldIndex + 1} Name*`}
        placeholder="Enter attribute name"
        {...getFieldProps(`${fieldPath}.attributeName`)}
        error={getNestedError(errors as NestedErrors, `${fieldPath}.attributeName`)}
      />
      <div className="relative flex flex-col gap-1">
        <label className="text-neutral-800 font-medium text-sm">Type*</label>
        <Select
          value={getFieldProps(`${fieldPath}.type`).value}
          onValueChange={(value) => 
            setFieldValue(`${fieldPath}.type`, value)
          }
        >
          <SelectTrigger className="w-52 h-11">
            <SelectValue placeholder="Select type"/>
          </SelectTrigger>
          <SelectContent>
            {transformedAttributeTypes.map((type) => (
              <SelectItem key={type._id} value={type._id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {getNestedError(errors as NestedErrors, `${fieldPath}.type`) && <ErrorText error={getNestedError(errors as NestedErrors, `${fieldPath}.type`)} />}
      </div>
      
      <LabeledInput
        label="Value (optional)"
        placeholder="Enter value"
        {...getFieldProps(`${fieldPath}.value`)}
        error={getNestedError(errors as NestedErrors, `${fieldPath}.value`)}
      />
      {totalFields > 1 && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="mt-6 hover:bg-destructive/10 hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="size-4" />
        </Button>
      )}
    </div>
  )
}

const IndicatorForm: FC<IIndicatorFormProps> = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const { actions } = useSheetStore((store) => store)
  const { closeSheet } = actions
  const t = useTranslations('general')
  const queryClient = useQueryClient()

  const initialValues = {
    name: '',
    description: '',
    numberOfLevels: 1,
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
          depth: 0
        }
      ])
    }
  }, [formik.values.levels.length, formik.setFieldValue])

  // Effect to handle numberOfLevels changes
  useEffect(() => {
    const prevNumberOfLevels = values.levels.reduce((maxDepth, level) => {
      const getMaxDepth = (l: ILevel): number => {
        if (!l.subLevels?.length) return l.depth ?? 0
        return Math.max(...l.subLevels.map(sl => getMaxDepth(sl)))
      }
      return Math.max(maxDepth, getMaxDepth(level))
    }, 0) + 1

    if (prevNumberOfLevels !== values.numberOfLevels) {
      const trimNestedLevels = (levels: ILevel[], currentDepth: number, maxDepth: number): ILevel[] => {
        return levels.map(level => ({
          ...level,
          subLevels: currentDepth < maxDepth - 1 && level.subLevels?.length 
            ? trimNestedLevels(level.subLevels, currentDepth + 1, maxDepth)
            : []
        }))
      }

      const trimmedLevels = trimNestedLevels(values.levels, 0, values.numberOfLevels)
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
        depth: 0
      }
    ])
  }

  const validateNestedLevels = async (levels: ILevel[], basePath: string): Promise<boolean> => {
    let isValid = true;
    for (let i = 0; i < levels.length; i++) {
      const currentPath = `${basePath}.${i}`;
      await validateField(`${currentPath}.levelName`);
      
      // Validate current level's name
      const levelErrors = errors.levels?.[i] as { levelName?: string };
      if (levelErrors?.levelName) {
        isValid = false;
      }

      // Validate sub-levels recursively
      if (levels[i].subLevels?.length > 0) {
        const subLevelsValid = await validateNestedLevels(levels[i].subLevels, `${currentPath}.subLevels`);
        isValid = isValid && subLevelsValid;
      }
    }
    return isValid;
  };

  const validateStep = async () => {
    switch (currentStep) {
      case 0:
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
        setCurrentStep(prev => prev + 1)
      }
    }
  }

  const handleBack = (): void => {
    setCurrentStep(prev => prev - 1)
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
  
  const renderLevelValues = (level: ILevel, path: string, levelNumber: string, indent: number = 0) => (
    <div key={path} className="mb-6 rounded-lg border-2 p-4" style={{ marginLeft: `${indent * 20}px` }}>
      <h3 className="mb-4 text-lg font-semibold">Level {levelNumber}: {level.levelName}</h3>
      {level.fields.map((field: IField, fieldIndex: number) => (
        <div key={`${path}.fields.${fieldIndex}`} className="mb-4">
          <LabeledInput
            label={field.attributeName}
            placeholder={`Enter value for ${field.attributeName}`}
            type={field.type === 'number' ? 'number' : 'text'}
            {...getFieldProps(`${path}.fields.${fieldIndex}.value`)}
            error={getNestedError(errors as NestedErrors, `${path}.fields.${fieldIndex}.value`)}
          />
        </div>
      ))}
      {level.subLevels?.map((subLevel: ILevel, subIndex: number) => {
        const subLevelNumber = indent === 0 
          ? `${levelNumber}.${subIndex + 1}`  // For same level sub-levels (1.1, 1.2, etc.)
          : `${indent + 1}`  // For nested levels (2, 3, etc.)
        
        return renderLevelValues(
          subLevel, 
          `${path}.subLevels.${subIndex}`, 
          subLevelNumber,
          indent + 1
        )
      })}
    </div>
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
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
            />            <LabeledInput
              label={'How many depth levels this indicator can have?'}
              type="number"
              min={1}
              max={5}
              placeholder={'Enter number of depth levels'}
              {...getFieldProps('numberOfLevels')}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (value > 5) {
                  setFieldValue('numberOfLevels', 5);
                } else if (value < 1) {
                  setFieldValue('numberOfLevels', 1);
                } else {
                  setFieldValue('numberOfLevels', value);
                }
              }}
              error={touched.numberOfLevels && errors.numberOfLevels ? errors.numberOfLevels : ''}
            />
          </div>
        )
      case 1:
        return (
          <div className="w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Level Configuration</h2>
              <Button
                type="button"
                variant="outline"
                onClick={addTopLevel}
                className="flex items-center gap-2"
              >
                <Plus className="size-4" /> Add Level
              </Button>
            </div>
            {values.levels.map((level: ILevel, index: number) => (
              <LevelComponent
                key={index}
                levelIndex={[index]}
                levelNumber={(index + 1).toString()}
                getFieldProps={getFieldProps}
                touched={touched}
                errors={errors}
                values={values}
                setFieldValue={setFieldValue}
                totalAllowedLevels={values.numberOfLevels}
                showDelete={values.levels.length > 1}
                onDelete={() => {
                  const newLevels = [...values.levels];
                  newLevels.splice(index, 1);
                  setFieldValue('levels', newLevels);
                }}
              />
            ))}
          </div>
        )     
        case 2: {
        const renderLevel = (level: ILevel, levelPaths: number[]) => {
          const currentPath = levelPaths.length === 1 
            ? `levels.${levelPaths[0]}` 
            : `levels.${levelPaths[0]}.subLevels.${levelPaths.slice(1).join('.subLevels.')}`;
          
          return (
            <div key={currentPath} className="mb-6 rounded-lg border-2 p-4" style={{ marginLeft: `${(levelPaths.length - 1) * 32}px` }}>
              <h3 className="mb-4 text-lg font-semibold">{level.levelName}</h3>              {level.fields.map((field: IField, fieldIndex: number) => (
                <DynamicField
                  key={fieldIndex}
                  levelIndex={levelPaths}
                  fieldIndex={fieldIndex}
                  getFieldProps={getFieldProps}
                  setFieldValue={setFieldValue}
                  touched={touched}
                  errors={errors}
                  onDelete={() => {
                    const currentFields = [...level.fields];
                    currentFields.splice(fieldIndex, 1);
                    setFieldValue(`${currentPath}.fields`, currentFields);
                  }}
                  totalFields={level.fields.length}
                  currentPath={currentPath}
                />
              ))}
              <div className="flex justify-end mb-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentFields = [...level.fields];
                    setFieldValue(`${currentPath}.fields`, [
                      ...currentFields,
                      { attributeName: '', value: '', type: '' }
                    ]);
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus className="size-4" /> Add Field
                </Button>
              </div>
              {level.subLevels?.map((subLevel: ILevel, subIndex: number) =>
                renderLevel(subLevel, [...levelPaths, subIndex])
              )}
            </div>
          );
        };

        return (
          <div className="w-full">
            <h2 className="mb-4 text-xl font-bold">Field Configuration</h2>
            {values.levels.map((level: ILevel, index: number) => 
              renderLevel(level, [index])
            )}
          </div>
        );
      }
      default:
        return null;
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
          {currentStep === INDICATOR_FORM_STEPS.length - 1 ? t('save') : 'next'}
        </Button>
      </div>
    </form>
  )
}

export default IndicatorForm
