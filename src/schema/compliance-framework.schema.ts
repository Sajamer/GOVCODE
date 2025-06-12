import { z } from 'zod'

export const complianceFrameworkSchema = z.object({
  name: z.string().min(2, {
    message: 'Framework name must be at least 2 characters.',
  }),
  statusId: z.number({ required_error: 'Status is required' }),
  file: z.instanceof(File, {
    message: 'Please upload an Excel file',
  }),
})

export type IComplianceFrameworkManipulator = z.infer<
  typeof complianceFrameworkSchema
>
