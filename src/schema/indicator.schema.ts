import { z } from 'zod'

const FieldSchema = z.object({
  attributeName: z.string().min(1, 'Field name is required'),
  value: z.string().optional(),
  type: z.string().min(1, 'Field type is required'),
})

// Using recursive type for nested levels
const LevelSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    levelName: z.string().min(1, 'Level name is required'),
    fields: z.array(FieldSchema),
    subLevels: z.array(LevelSchema).default([]),
    depth: z.number().min(0).default(0)
  })
)

export const indicatorSchema = z.object({
  name: z.string().min(1, 'Indicator name is required'),
  description: z.string().optional(),
  numberOfLevels: z.number().min(1, 'At least one level is required').max(5, 'Maximum 5 levels allowed'),
  levels: z.array(LevelSchema).min(1, 'At least one level is required'),
})

export type IIndicatorManipulator = z.infer<typeof indicatorSchema>
