import { z } from 'zod'

export const auditFrameworkSchema = z.object({
  frameworkId: z.string({
    required_error: 'Framework is required',
  }),
  name: z.string().min(6, {
    message: 'audit cycle number must be at least 6 characters.',
  }),
  startDate: z.date(),
  auditBy: z.string().min(2, {
    message: 'Audit by must be at least 2 characters.',
  }),
  description: z.string().optional(),
})

export type IAuditFrameworkManipulator = z.infer<typeof auditFrameworkSchema>
