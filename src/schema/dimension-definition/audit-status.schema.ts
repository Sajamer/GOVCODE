import { z } from 'zod'

const auditRuleSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  color: z.string().min(1, 'Color is required'),
})

export const auditStatusSchema = z.object({
  name: z.string().min(1, 'Status name is required'),
  auditRules: z
    .array(auditRuleSchema)
    .min(1, 'At least one audit rule is required'),
})

export type IAuditStatusManipulator = z.infer<typeof auditStatusSchema>
