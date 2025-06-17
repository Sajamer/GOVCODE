'use client'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import { getAllAuditStatuses } from '@/lib/actions/kpi-dimensions/audit-status.actions'
import {
  complianceFrameworkSchema,
  IComplianceFrameworkManipulator,
} from '@/schema/compliance-framework.schema'
import { useSheetStore } from '@/stores/sheet-store'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

export default function ComplianceFrameworkForm() {
  const t = useTranslations('general')
  const queryClient = useQueryClient()
  const { actions } = useSheetStore((store) => store)
  const { closeSheet } = actions

  const [isLoading, setIsLoading] = useState(false)

  const { data } = useQuery({
    queryKey: ['audit-status'],
    queryFn: async () => await getAllAuditStatuses(),
    staleTime: 5 * 60 * 1000,
  })

  const auditStatusOptions =
    data?.map((status) => ({
      id: status.id,
      label: status.name,
      value: status.name,
    })) || []

  const form = useForm<IComplianceFrameworkManipulator>({
    resolver: zodResolver(complianceFrameworkSchema),
    defaultValues: {
      name: '',
      statusId: undefined,
      file: undefined,
    },
  })
  async function onSubmit(values: IComplianceFrameworkManipulator) {
    try {
      setIsLoading(true)
      const formData = new FormData()
      formData.append('name', values.name)
      if (values.statusId) {
        formData.append('statusId', values.statusId.toString())
      }
      if (values.file) {
        formData.append('file', values.file)
      }

      const response = await fetch('/api/framework', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to create framework')
      }

      toast({
        title: 'Framework Created',
        variant: 'success',
        description: 'The compliance framework has been created successfully.',
      })

      queryClient.invalidateQueries({
        queryKey: ['frameworks'],
      })

      closeSheet()
    } catch (error: AxiosErrorType) {
      toast({
        title: 'Creation Failed',
        description:
          error?.message ||
          'There was an error creating the compliance framework.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('name')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('framework-name-placeholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />{' '}
        <FormField
          control={form.control}
          name="statusId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('audit-status')}</FormLabel>
              <FormControl>
                <select
                  value={field.value || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    field.onChange(value ? Number(value) : undefined)
                  }}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="">{t('select-status')}</option>
                  {auditStatusOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('excel-file')}</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      field.onChange(file)
                    }
                  }}
                  className="hover:file:bg-primary/90 file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-1 file:text-sm file:font-semibold file:text-primary-foreground"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-end">
          <Button type="submit" isLoading={isLoading} disabled={isLoading}>
            {t('create')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
