import { z } from 'zod'

const { object, array, number, string } = z

export const kpiTargetSchema = array(
  object({
    year: number().int().min(2000),
    period: string({ required_error: 'Period is required' }),
    targetValue: number().nonnegative(),
    kpiId: number().int().positive(),
  }),
)
