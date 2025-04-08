import { z } from 'zod'

const FieldSchema = z.object({
  attributeName: z.string(),
  value: z.string().optional(),
  type: z.string(), // MongoDB ObjectId as string
})

const LevelSchema = z.object({
  levelName: z.string(),
  fields: z.array(FieldSchema),
})

export const indicatorSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  numberOfLevels: z.number(),
  levels: z.array(LevelSchema),
})

export type IIndicatorManipulator = z.infer<typeof indicatorSchema>
