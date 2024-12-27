'use client'

import { getUserRoles } from '@/constants/global-constants'
import { toast } from '@/hooks/use-toast'
import { getDepartmentsByOrganizationId } from '@/lib/actions/department.actions'
import { inviteUser } from '@/lib/actions/invitation.actions'
import { IInvitationManipulator, invitationSchema } from '@/schema/user.schema'
import { useSheetStore } from '@/stores/sheet-store'
import { userRole } from '@prisma/client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useFormik } from 'formik'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { FC } from 'react'
import { toFormikValidationSchema } from 'zod-formik-adapter'
import BasicDropdown from '../shared/dropdowns/BasicDropdown'
import LabeledInput from '../shared/inputs/LabeledInput'
import { Button } from '../ui/button'

const InvitationForm: FC = () => {
  const t = useTranslations('general')
  const { data: userData } = useSession()

  const userInvitedById = userData?.user?.id

  const { id } = useParams()
  const organizationId = typeof id === 'string' ? parseInt(id, 10) : 0

  const { data: departmentData } = useQuery({
    queryKey: ['departments', organizationId],
    queryFn: async () => await getDepartmentsByOrganizationId(organizationId),
    staleTime: 1000 * 60 * 5,
  })

  const { actions } = useSheetStore((store) => store)
  const { closeSheet } = actions

  const rolesOptions = getUserRoles(t)
  const departmentOptions = departmentData?.map((option) => ({
    id: String(option.id),
    label: option.name,
    value: option.name,
  }))

  const {
    values,
    errors,
    getFieldProps,
    handleSubmit,
    setFieldValue,
    dirty,
    touched,
  } = useFormik<IInvitationManipulator>({
    initialValues: {
      fullName: '',
      email: '',
      role: userRole.userDepartment,
      departmentId: 0,
      invitedByUserId: userInvitedById ?? '',
    },
    enableReinitialize: true,
    validationSchema: toFormikValidationSchema(invitationSchema),
    onSubmit: () => {
      addMutation()
    },
  })

  const { mutate: addMutation, isPending: addLoading } = useMutation({
    mutationFn: async () => await inviteUser(values),
    onSuccess: () => {
      toast({
        variant: 'success',
        title: 'Check your email',
        description: `Invitation sent successfully to ${values.email}`,
      })
      closeSheet()
    },
    onError: (error: AxiosErrorType) => {
      toast({
        variant: 'destructive',
        title: 'Invitation Failed to send.',
        description: error?.message,
      })
    },
  })

  return (
    <form
      onSubmit={handleSubmit}
      className="styleScrollbar flex size-full max-h-full flex-col justify-between overflow-y-auto"
    >
      <div className="flex flex-col items-center justify-center gap-4 ">
        <LabeledInput
          label={'Full Name'}
          placeholder={'Enter full name'}
          {...getFieldProps('fullName')}
          error={touched.fullName && errors.fullName ? errors.fullName : ''}
        />

        <LabeledInput
          label={'Email'}
          type="email"
          placeholder={'Enter organization email'}
          {...getFieldProps('email')}
          error={touched.email && errors.email ? errors.email : ''}
        />

        <BasicDropdown
          data={departmentOptions ?? []}
          label={t('department')}
          triggerStyle="h-11"
          placeholder={t('department-placeholder')}
          defaultValue={departmentOptions?.find(
            (option) => +option.id === values.departmentId,
          )}
          error={
            errors.departmentId && touched.departmentId
              ? errors.departmentId
              : ''
          }
          {...getFieldProps('departmentId')}
          callback={(option) => setFieldValue('departmentId', +option.id)}
        />

        <BasicDropdown
          label={t('role')}
          placeholder={t('role-placeholder')}
          data={rolesOptions ?? []}
          triggerStyle="h-11"
          defaultValue={rolesOptions?.find(
            (option) => option.value === values.role,
          )}
          error={errors.role && touched.role ? errors.role : ''}
          {...getFieldProps('role')}
          callback={(option) => setFieldValue('role', option.value)}
        />
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
          Send Invitation
        </Button>
      </div>
    </form>
  )
}

export default InvitationForm
