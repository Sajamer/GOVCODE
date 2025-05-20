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
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Framework name must be at least 2 characters.',
  }),
  file: z.instanceof(File, {
    message: 'Please upload an Excel file',
  }),
})

export default function FrameworkForm() {
  const t = useTranslations('general')
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      file: undefined,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)
      const formData = new FormData()
      formData.append('name', values.name)
      if (values.file) {
        formData.append('file', values.file)
      }

      const response = await fetch('/api/framework', {
        method: 'POST',
        body: formData,
      })

      if (!response) {
        throw new Error('Failed to create framework')
      }

      // form.reset()
      // You might want to add a success toast or message here
    } catch (error) {
      console.error('Error creating framework:', error)
      // You might want to add an error toast or message here
    } finally {
      setIsLoading(false)
    }
  }
  // Form submission handler

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
