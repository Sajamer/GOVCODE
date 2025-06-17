import { z } from 'zod'

const ruleSchema = z
  .object({
    label: z.string(),
    min: z.coerce.number(), // automatically converts string to number
    max: z.coerce.number(),
    color: z.string(),
  })
  .refine((data) => data.min <= data.max, {
    message: 'Min cannot be greater than Max',
    path: ['min'], // points to the min field
  })

export const statusSchema = z.object({
  name: z.string(),
  rules: z.array(ruleSchema),
})

export type IStatusManipulator = z.infer<typeof statusSchema>
