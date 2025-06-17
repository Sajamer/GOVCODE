import { z } from 'zod'

const auditRuleSchema = z.object({
  label: z.string(),
  color: z.string(),
})

export const auditStatusSchema = z.object({
  name: z.string(),
  auditRules: z.array(auditRuleSchema),
})

export type IAuditStatusManipulator = z.infer<typeof auditStatusSchema>
