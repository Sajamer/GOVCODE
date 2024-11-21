import { z } from 'zod'

export const BodySchema = z.object({
  name: z.string().min(5),
  description: z.string().min(5),
  owner: z.string().min(5),
  measurementNumerator: z.string().optional(),
  measurementDenominator: z.string().optional(),
  measurementNumber: z.string().optional(),
  resources: z.string().optional(),
  unit: z.string(),
  frequency: z.string(),
  type: z.string(),
  calibration: z.string(),
})
