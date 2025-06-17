'use client'

import { toast } from '@/hooks/use-toast'
import { createAudit } from '@/lib/actions/audit-framework.actions'
import { CustomUser } from '@/lib/auth'
import {
  auditFrameworkSchema,
  IAuditFrameworkManipulator,
} from '@/schema/audit-framework.schema'
import { IFramework, IFrameWorkAuditCycle } from '@/types/framework'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useFormik } from 'formik'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { FC, useMemo } from 'react'
import { toFormikValidationSchema } from 'zod-formik-adapter'
import LabeledInput from '../shared/inputs/LabeledInput'
import LabeledTextArea from '../shared/textArea/LabeledTextArea'
import { Button } from '../ui/button'

interface IAuditFormProps {
  onClose: () => void
  frameworkId: string
  frameworkName: string
  auditLength: number
}

const AuditForm: FC<IAuditFormProps> = ({
  frameworkId,
  frameworkName,
  auditLength,
  onClose,
}) => {
  const queryClient = useQueryClient()
  const isArabic = usePathname().includes('/ar')
  const t = useTranslations('general')
  const { data: session } = useSession()
  const userData = session?.user as CustomUser | undefined

  // Memoize the audit cycle number to prevent recalculation on every render
  const auditCycleNumber = useMemo(
    () => `${auditLength + 1}-${new Date().getFullYear()}-${frameworkName}`,
    [auditLength, frameworkName],
  )

  // Memoize initial values to prevent object recreation on every render
  const initialValues = useMemo<IAuditFrameworkManipulator>(
    () => ({
      frameworkId,
      name: auditCycleNumber,
      startDate: new Date(),
      auditBy: userData?.id || '',
      description: '',
    }),
    [frameworkId, auditCycleNumber, userData?.id],
  )

  const { values, errors, getFieldProps, handleSubmit, touched } =
    useFormik<IAuditFrameworkManipulator>({
      initialValues,
      enableReinitialize: true,
      validationSchema: toFormikValidationSchema(auditFrameworkSchema),
      onSubmit: () => {
        addMutation()
      },
    })

  const { mutate: addMutation, isPending: addLoading } = useMutation({
    mutationFn: async () => await createAudit(values),
    onSuccess: (newData: IFrameWorkAuditCycle) => {
      queryClient.invalidateQueries({
        queryKey: ['all-audits'],
      })

      queryClient.setQueryData(
        ['frameworks'],
        (oldData: { frameworks: IFramework[] } | undefined) => {
          if (!oldData) return { frameworks: [] }
          return {
            frameworks: oldData.frameworks.map((framework) => {
              if (framework.id === frameworkId) {
                return {
                  ...framework,
                  auditCycles: [...(framework.auditCycles || []), newData].sort(
                    (a, b) =>
                      new Date(b.startDate).getTime() -
                      new Date(a.startDate).getTime(),
                  ),
                }
              }
              return framework
            }),
          }
        },
      )

      toast({
        variant: 'success',
        title: 'Success',
        description: `${values.name} successfully added`,
      })
      onClose()
    },
    onError: (error: AxiosErrorType) => {
      toast({
        variant: 'destructive',
        title: 'Resend Failed',
        description: error?.message,
      })
    },
  })

  const isLoading = addLoading

  return (
    <form
      dir={isArabic ? 'rtl' : 'ltr'}
      onSubmit={handleSubmit}
      className="styleScrollbar flex size-full max-h-full flex-col gap-5 overflow-y-auto"
    >
      <div className="flex flex-col items-start justify-center gap-5">
        <div className="flex w-full items-center justify-between gap-5">
          <LabeledInput
            disabled={true}
            label={t('audit-cycle-number')}
            placeholder={t('audit-cycle-number-placeholder')}
            {...getFieldProps('name')}
            error={touched.name && errors.name ? errors.name : ''}
          />
          <LabeledInput
            disabled={true}
            label={t('creation-date')}
            placeholder={t('creation-date-placeholder')}
            {...getFieldProps('startDate')}
            value={
              values.startDate
                ? new Date(values.startDate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : ''
            }
            error={''}
          />
        </div>
        <LabeledInput
          disabled={true}
          label={t('created-by')}
          placeholder={t('created-by-placeholder')}
          {...getFieldProps('auditBy')}
          value={userData?.fullName || ''}
          error={touched.auditBy && errors.auditBy ? errors.auditBy : ''}
        />
        <LabeledTextArea
          label={t('Description')}
          placeholder={t('description-placeholder')}
          className="resize-none"
          {...getFieldProps('description')}
          error={
            touched.description && errors.description ? errors.description : ''
          }
        />
      </div>
      <div className="mt-5 flex w-full items-center justify-end gap-3">
        <Button
          type="button"
          variant={'outline'}
          className="w-full max-w-36 sm:max-w-[10.25rem]"
          onClick={() => onClose()}
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

export default AuditForm
