import { ChartTypes } from '@prisma/client'
import { z } from 'zod'

const { object, string, number, nativeEnum, array } = z

export const ParamsSchema = z.object({
  id: z.number().int().positive(),
})

export const dashboardSchema = object({
  name: string().min(5),
  chartType: nativeEnum(ChartTypes).default(ChartTypes.bar),
  dashboardKPIs: array(number(), {
    required_error: 'This field is required.',
  }).min(1, {
    message: 'At least one kpi is required',
  }),
})

export type IDashboardManipulator = z.infer<typeof dashboardSchema>
