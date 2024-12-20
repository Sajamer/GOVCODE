'use client'

import AddNewComponent from '@/components/shared/AddNewComponent'
import DragAndDropImage from '@/components/shared/DragAndDropImage'
import ErrorText from '@/components/shared/ErrorText'
import LabeledInput from '@/components/shared/inputs/LabeledInput'
import LabeledTextArea from '@/components/shared/textArea/LabeledTextArea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'
import { updateOrganizationById } from '@/lib/actions/organizationActions'
import { organizationSchema } from '@/schema/organization.schema'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useFormik } from 'formik'
import { Edit2, Info, Trash } from 'lucide-react'
import Image from 'next/image'
import { FC, useState } from 'react'
import { toFormikValidationSchema } from 'zod-formik-adapter'
import OrganizationTree from './OrganizationTree'

interface IOrganizationDetailsComponentProps {
  data: IOrganizationWithDepartments
}

const OrganizationDetailsComponent: FC<IOrganizationDetailsComponentProps> = ({
  data,
}) => {
  const chartData = [
    {
      expanded: true,
      type: 'person',
      data: {
        image: '/assets/images/avatar-placeholder.png',
        name: 'John Doe',
        title: 'Moderator',
        index: 0,
      },
      children: [
        {
          expanded: true,
          type: 'person',
          data: {
            image: '/assets/images/avatar-placeholder.png',
            name: 'Jane Smith',
            title: 'Collaborator',
            index: 1,
          },
          children: [
            {
              expanded: false,
              type: 'person',
              data: {
                image: '/assets/images/avatar-placeholder.png',
                name: 'Sam Wilson',
                title: 'User',
                index: 2,
              },
            },
            {
              expanded: false,
              type: 'person',
              data: {
                image: '/assets/images/avatar-placeholder.png',
                name: 'Alice Brown',
                title: 'User',
                index: 3,
              },
            },
          ],
        },
        {
          expanded: true,
          type: 'person',
          data: {
            image: '/assets/images/avatar-placeholder.png',
            name: 'Robert Green',
            title: 'Collaborator',
            index: 4,
          },
          children: [
            {
              expanded: false,
              type: 'person',
              data: {
                image: '/assets/images/avatar-placeholder.png',
                name: 'Nancy White',
                title: 'User',
                index: 5,
              },
            },
            {
              expanded: false,
              type: 'person',
              data: {
                image: '/assets/images/avatar-placeholder.png',
                name: 'Shadow Wolf',
                title: 'User',
                index: 6,
              },
            },
          ],
        },
      ],
    },
  ]

  const queryClient = useQueryClient()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editValue, setEditValue] = useState<string>('')

  const tabTriggerClasses =
    'py-2 px-5 relative group ring-0 focus-visible:ring-0 focus-visible:border-none text-[#939AAC] text-sm font-semibold flex items-center gap-2 data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent focus-visible:bg-transparent dark:bg-transparent dark:data-[state=active]:bg-transparent dark:data-[state=active]:text-primary'

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
      name: data.name,
      description: data.description || '',
      logo: data.logo || '',
      website: data.website || '',
      phone: data.phone || '',
      email: data.email || '',
      address: data.address || '',
      city: data.city || '',
      state: data.state || '',
      country: data.country || '',
      postalCode: data.postalCode || '',
      timezone: data.timezone || '',
      currency: data.currency || '',
      departments: data.departments.map((department) => ({
        id: department.id,
        name: department.name,
      })),
    },
    enableReinitialize: true,
    validationSchema: toFormikValidationSchema(organizationSchema),
    onSubmit: () => {
      editMutation(data.id)
    },
  })

  const { mutate: editMutation, isPending: editLoading } = useMutation({
    mutationFn: async (id: number) => await updateOrganizationById(id, values),
    onSuccess: (updatedKPI, id) => {
      queryClient.setQueryData(
        ['kpis'],
        (oldData: IOrganization[] | undefined) => {
          if (!oldData) return []

          return oldData.map((kpi) => {
            if (kpi.id === id) {
              return {
                ...kpi,
                ...updatedKPI,
              }
            }
            return kpi
          })
        },
      )

      toast({
        variant: 'success',
        title: 'Success',
        description: `${values.name} successfully updated`,
      })
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

  const handleSaveEdit = (index: number) => {
    if (editValue.length < 2) {
      setFieldError(
        'departments',
        'Department name must be at least 2 characters',
      )
      return
    }

    setFieldError('departments', '')
    const updatedDepartments = values.departments.map((dept, i) =>
      i === index ? { ...dept, name: editValue } : dept,
    )
    setValues((prev) => ({ ...prev, departments: updatedDepartments }))
    setEditingIndex(null)
  }

  return (
    <div className="w-full">
      <Tabs defaultValue="organization-details" className="w-full">
        <TabsList className="flex w-fit items-center justify-start">
          <TabsTrigger
            value="organization-details"
            className={tabTriggerClasses}
          >
            Organization Details
          </TabsTrigger>
          <TabsTrigger value="user-access" className={tabTriggerClasses}>
            User Access
          </TabsTrigger>
          <TabsTrigger value="organization-tree" className={tabTriggerClasses}>
            Organization Tree
          </TabsTrigger>
        </TabsList>
        <TabsContent value="organization-details" className="mt-10 w-full">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            <Card>
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="text-2xl">Organization Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 py-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="row-span-2 flex w-full items-center justify-center">
                    {values.logo ? (
                      <Image
                        src={values.logo}
                        alt={values.name}
                        width={150}
                        height={150}
                        className="rounded-full border border-gray-200 object-cover shadow-sm"
                      />
                    ) : (
                      <DragAndDropImage
                        callback={(url) => {
                          setValues((prev) => ({ ...prev, logo: url }))
                        }}
                      />
                    )}
                  </div>
                  <LabeledInput
                    label={'Organization Name*'}
                    placeholder={'Enter organization name'}
                    {...getFieldProps('name')}
                    error={touched.name && errors.name ? errors.name : ''}
                  />
                  <LabeledInput
                    label={'Organization Email*'}
                    type="email"
                    placeholder={'Enter organization email'}
                    {...getFieldProps('email')}
                    error={touched.email && errors.email ? errors.email : ''}
                  />
                  <LabeledInput
                    label={'Country'}
                    placeholder={'Enter country'}
                    {...getFieldProps('country')}
                    error={
                      touched.country && errors.country ? errors.country : ''
                    }
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
                  <div className="col-span-2 w-full">
                    <LabeledTextArea
                      label={'Description'}
                      placeholder={'Enter organization description'}
                      className="resize-none"
                      {...getFieldProps('description')}
                      error={
                        touched.description && errors.description
                          ? errors.description
                          : ''
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="text-2xl">Departments Within</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 py-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {values.departments.map((department, index) => (
                    <div
                      key={department.id || index + 1}
                      className="relative flex h-[2.76125rem] w-full items-center justify-between rounded-lg border border-neutral-100 bg-neutral-0 px-5 py-3"
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onClick={() => handleEditClick(index, department.name)}
                    >
                      {editingIndex === index ? (
                        <Input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleSaveEdit(index)}
                          onKeyDown={(e) =>
                            e.key === 'Enter' && handleSaveEdit(index)
                          }
                          autoFocus
                          className="!h-fit w-full rounded-md border-none p-0 focus:outline-none"
                        />
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium text-neutral-800">
                            {department.name}
                          </span>
                          {hoveredIndex === index && !editingIndex && (
                            <Edit2
                              size={10}
                              className="text-neutral-500 transition-opacity duration-200"
                            />
                          )}
                        </div>
                      )}
                      {!department.id && (
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
                      )}
                    </div>
                  ))}
                </div>
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
              </CardContent>
            </Card>
            <div className="col-span-2 flex w-full justify-end">
              <Button
                type="submit"
                isLoading={editLoading}
                disabled={editLoading || !dirty}
              >
                Save changes
              </Button>
            </div>
          </form>
        </TabsContent>
        <TabsContent value="user-access" className="mt-5">
          <div className="flex items-start gap-3 rounded-[1.25rem] bg-neutral-100 p-[1.875rem]">
            <Info className="mt-[0.31rem] size-4 min-w-4 text-neutral-600" />
            <div className="flex flex-col items-start gap-1">
              <h3 className="text-base font-medium text-neutral-800">
                People who can access this organization:
              </h3>
              <p className="text-sm font-medium text-neutral-600">
                Only the people listed below can access this consolidated
                organization. If you can&apos;t find someone, they may not have
                been invited to {values.name} organization.
              </p>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="organization-tree" className="mt-5">
          <OrganizationTree chartData={chartData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default OrganizationDetailsComponent
