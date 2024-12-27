'use client'

import { getUserRoles } from '@/constants/global-constants'
import { toast } from '@/hooks/use-toast'
import { getDepartmentsByOrganizationId } from '@/lib/actions/department.actions'
import { addUserManually, updateUser } from '@/lib/actions/userActions'
import {
  IManualManipulator,
  manualSchema,
  userUpdateSchema,
} from '@/schema/user.schema'
import { useSheetStore } from '@/stores/sheet-store'
import { IUsers } from '@/types/users'
import { userRole } from '@prisma/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useFormik } from 'formik'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { FC } from 'react'
import { toFormikValidationSchema } from 'zod-formik-adapter'
import BasicDropdown from '../shared/dropdowns/BasicDropdown'
import LabeledInput from '../shared/inputs/LabeledInput'
import PasswordInput from '../shared/inputs/PasswordInput'
import { Button } from '../ui/button'

interface IManualUserFormProps {
  data?: IUsers
}

const ManualUserForm: FC<IManualUserFormProps> = ({ data: userData }) => {
  const isEdit = !!userData

  const t = useTranslations('general')
  const queryClient = useQueryClient()

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
  } = useFormik<IManualManipulator>({
    initialValues: {
      fullName: userData?.fullName ?? '',
      email: '',
      password: '',
      role: userData?.role ?? userRole.userDepartment,
      departmentId: userData?.department?.id ?? 0,
    },
    enableReinitialize: true,
    validationSchema: isEdit
      ? toFormikValidationSchema(userUpdateSchema)
      : toFormikValidationSchema(manualSchema),
    onSubmit: () => {
      if (isEdit) {
        editMutation(userData.id)
      } else {
        addMutation()
      }
    },
  })

  const { mutate: addMutation, isPending: addLoading } = useMutation({
    mutationFn: async () => await addUserManually(values),
    onSuccess: (newUser) => {
      const textToCopy = `Email: ${values.email}\nPassword: ${values.password}`

      // Copy to clipboard
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          toast({
            variant: 'success',
            title: 'User added successfully',
            description: `Credentials copied to clipboard.`,
          })
        })
        .catch((error) => {
          toast({
            variant: 'warning',
            title: 'Copied Failed!',
            description: 'User created but failed to copy credentials.',
          })
          console.error('Failed to copy text to clipboard:', error)
        })

      queryClient.setQueryData(['users'], (oldData: IUsers[]) => [
        ...oldData,
        newUser.data,
      ])
      closeSheet()
    },
    onError: (error: AxiosErrorType) => {
      toast({
        variant: 'destructive',
        title: 'Failed to create user.',
        description: error?.message,
      })
    },
  })

  const { mutate: editMutation, isPending: editLoading } = useMutation({
    mutationFn: async (id: string) => await updateUser(id, values),
    onSuccess: (updatedUser, id) => {
      queryClient.setQueryData(['users'], (oldData: IUsers[] | undefined) => {
        if (!oldData) return []

        return oldData.map((user) => {
          if (user.id === id) {
            return {
              ...user,
              ...updatedUser,
            }
          }
          return user
        })
      })

      toast({
        variant: 'success',
        title: 'Success',
        description: `${values.fullName} data successfully updated`,
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

  const isLoading = editLoading || addLoading

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

        {!isEdit && (
          <>
            <LabeledInput
              label={'Email'}
              type="email"
              placeholder={'Enter organization email'}
              {...getFieldProps('email')}
              error={touched.email && errors.email ? errors.email : ''}
            />

            <PasswordInput
              label={'Password'}
              placeholder={'Enter password'}
              {...getFieldProps('password')}
              error={touched.password && errors.password ? errors.password : ''}
              onGeneratePassword={(generatedPassword) =>
                setFieldValue('password', generatedPassword)
              }
            />
          </>
        )}

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
          isLoading={isLoading}
          disabled={isLoading || !dirty}
        >
          {isEdit ? 'Update user' : 'Add User'}
        </Button>
      </div>
    </form>
  )
}

export default ManualUserForm
