'use client '

import { toast } from '@/hooks/use-toast'
import { createOrganization } from '@/lib/actions/organizationActions'
import { organizationSchema } from '@/schema/organization.schema'
import { useSheetStore } from '@/stores/sheet-store'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useFormik } from 'formik'
import { Edit2, Trash } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { FC, useState } from 'react'
import { toFormikValidationSchema } from 'zod-formik-adapter'
import AddNewComponent from '../shared/AddNewComponent'
import ErrorText from '../shared/ErrorText'
import LabeledInput from '../shared/inputs/LabeledInput'
import LabeledTextArea from '../shared/textArea/LabeledTextArea'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
// import { usePathname } from 'next/navigation'

const OrganizationForm: FC = () => {
  const queryClient = useQueryClient()
  const t = useTranslations('general')
  // const isArabic = usePathname().includes('/ar')

  const { actions } = useSheetStore((store) => store)
  const { closeSheet } = actions

  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editValue, setEditValue] = useState<string>('')
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const {
    values,
    errors,
    getFieldProps,
    setFieldError,
    handleSubmit,
    setValues,
    dirty,
    touched,
  } = useFormik<IOrganizationManipulator>({
    initialValues: {
      name: '',
      description: '',
      logo: '',
      website: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      timezone: '',
      currency: '',
      departments: [],
    },
    enableReinitialize: true,
    validationSchema: toFormikValidationSchema(organizationSchema),
    onSubmit: () => {
      addMutation()
    },
  })

  const { mutate: addMutation, isPending: addLoading } = useMutation({
    mutationFn: async () => await createOrganization(values),
    onSuccess: (organization) => {
      queryClient.setQueryData(
        ['organizations'],
        (oldData: IOrganization[] | undefined) => {
          return oldData ? [...oldData, organization] : [organization]
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

  const handleNewDepartment = (department: string): boolean => {
    if (department.length < 4) {
      setFieldError(
        'departments',
        'Department name must be at least 4 characters',
      )
      return false
    }
    if (values.departments.find((item) => item.name === department)) {
      setFieldError('departments', 'Department already exists')
      return false
    }

    setFieldError('departments', '')
    setValues((prev) => ({
      ...prev,
      departments: [...prev.departments, { name: department }],
    }))
    return true
  }

  const handleEditClick = (index: number, name: string): void => {
    setEditingIndex(index)
    setEditValue(name)
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setEditValue(e.target.value)
  }

  const handleEditSave = (index: number): void => {
    if (editValue.length < 4) {
      setFieldError(
        'departments',
        'Department name must be at least 4 characters',
      )
      return
    }

    setFieldError('departments', '')
    const updatedDepartments = values.departments.map((item, i) =>
      i === index ? { ...item, name: editValue } : item,
    )
    setValues((prev) => ({
      ...prev,
      departments: updatedDepartments,
    }))
    setEditingIndex(null)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="styleScrollbar flex size-full max-h-full flex-col justify-between overflow-y-auto"
    >
      <div className="flex flex-col items-center justify-center gap-4 ">
        <LabeledInput
          label={'Organization Name*'}
          placeholder={'Enter organization name'}
          {...getFieldProps('name')}
          error={touched.name && errors.name ? errors.name : ''}
        />

        <LabeledInput
          type="email"
          label={'Organization Email*'}
          placeholder={'Enter organization email'}
          {...getFieldProps('email')}
          error={touched.email && errors.email ? errors.email : ''}
        />

        <LabeledTextArea
          label={t('Description')}
          placeholder={'Enter description'}
          className="resize-none"
          {...getFieldProps('description')}
          error={
            touched.description && errors.description ? errors.description : ''
          }
        />

        <LabeledInput
          label={'Country'}
          placeholder={'Enter country'}
          {...getFieldProps('country')}
          error={touched.country && errors.country ? errors.country : ''}
        />

        <LabeledInput
          label={'City'}
          placeholder={'Enter city'}
          {...getFieldProps('city')}
          error={touched.city && errors.city ? errors.city : ''}
        />

        <LabeledInput
          label={'State'}
          placeholder={'Enter state'}
          {...getFieldProps('state')}
          error={touched.state && errors.state ? errors.state : ''}
        />

        <div className="flex w-full flex-col items-start gap-5">
          <h3 className="text-sm font-medium text-neutral-800">
            Add Departments
          </h3>
          <div className="flex w-full flex-col items-start gap-2">
            {values.departments.map((item, index) => (
              <div
                key={item.name}
                className="relative flex h-[2.76125rem] w-full items-center justify-between rounded-[0.875rem] border border-neutral-100 bg-neutral-0 px-5 py-3"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleEditClick(index, item.name)}
              >
                {editingIndex === index ? (
                  <Input
                    type="text"
                    value={editValue}
                    onChange={handleEditChange}
                    onBlur={() => handleEditSave(index)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleEditSave(index)
                    }}
                    autoFocus
                    className="!h-fit w-full rounded-md border-none p-0 focus:outline-none"
                  />
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-neutral-800">
                      {item.name}
                    </span>
                    {hoveredIndex === index && !editingIndex && (
                      <Edit2
                        size={10}
                        className="text-neutral-500 transition-opacity duration-200"
                      />
                    )}
                  </div>
                )}
                <Button
                  variant={'ghost'}
                  type="button"
                  className="size-[2.375rem] bg-transparent p-0 hover:bg-transparent"
                  onClick={() => {
                    const currentDepartments = values.departments
                    currentDepartments.splice(index, 1)
                    setValues((prev) => ({
                      ...prev,
                      departments: currentDepartments,
                    }))
                  }}
                >
                  <Trash
                    size="16"
                    className="cursor-pointer text-destructive"
                  />
                </Button>
              </div>
            ))}
            <div className="relative w-full">
              <AddNewComponent
                placeholder="New Department"
                callback={(label) => handleNewDepartment(label)}
              />
              {errors.departments && (
                <ErrorText
                  error={
                    Array.isArray(errors.departments)
                      ? errors.departments.join(', ')
                      : errors.departments
                  }
                />
              )}
            </div>
          </div>
        </div>
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
          isLoading={addLoading}
          disabled={addLoading || !dirty}
        >
          Create Organization
        </Button>
      </div>
    </form>
  )
}

export default OrganizationForm
