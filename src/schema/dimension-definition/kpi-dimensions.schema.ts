import { z } from 'zod'

const { object, string } = z

export const kpiDimensionSchema = object({
  name: string(),
})

export type IKpiDimensionManipulator = z.infer<typeof kpiDimensionSchema>
