'use client'

import LabeledInput from '@/components/shared/inputs/LabeledInput'
import LabeledTextArea from '@/components/shared/textArea/LabeledTextArea'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'
import { updateOrganizationById } from '@/lib/actions/organizationActions'
import { organizationSchema } from '@/schema/organization.schema'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useFormik } from 'formik'
import { Info } from 'lucide-react'
import { FC } from 'react'
import { toFormikValidationSchema } from 'zod-formik-adapter'

interface IOrganizationDetailsComponentProps {
  data: IOrganizationWithDepartments
}

const OrganizationDetailsComponent: FC<IOrganizationDetailsComponentProps> = ({
  data,
}) => {
  const queryClient = useQueryClient()

  const tabTriggerClasses =
    'py-2 px-5 relative group ring-0 focus-visible:ring-0 focus-visible:border-none text-[#939AAC] text-sm font-semibold flex items-center gap-2 data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent focus-visible:bg-transparent dark:bg-transparent dark:data-[state=active]:bg-transparent dark:data-[state=active]:text-primary'

  const {
    values,
    errors,
    getFieldProps,
    // setFieldValue,
    handleSubmit,
    // setValues,
    // handleBlur,
    // dirty,
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
    },
    enableReinitialize: true,
    validationSchema: toFormikValidationSchema(organizationSchema),
    onSubmit: () => {
      editMutation(data.id)
    },
  })

  console.log('departments:', data.departments)

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
              <CardFooter>
                <Button
                  type="submit"
                  isLoading={editLoading}
                  disabled={editLoading}
                >
                  Save changes
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="text-2xl">Departments Within</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 py-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {data.departments.map((department) => (
                    <div
                      key={department.id}
                      className="rounded-md bg-neutral-100 p-2"
                    >
                      <span className="text-sm font-medium">
                        {department.name}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
      </Tabs>
    </div>
  )
}

export default OrganizationDetailsComponent
