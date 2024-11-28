import { z } from 'zod'

const { object, string, number, array } = z

export const ParamsSchema = z.object({
  id: z.preprocess((val) => {
    if (typeof val === 'string') {
      const parsed = parseInt(val, 10)
      return isNaN(parsed) ? undefined : parsed
    }
    return val
  }, z.number().int().positive().optional()),
})

export const BodySchema = object({
  code: string().min(3),
  name: string().min(5),
  description: string().min(5),
  owner: string().min(5),
  measurementNumerator: string().optional(),
  measurementDenominator: string().optional(),
  measurementNumber: string().optional(),
  resources: string().optional(),
  unit: string(),
  frequency: string(),
  type: string(),
  calibration: string(),
  departmentId: number(),
  objectives: array(number()).optional(),
  compliances: array(number()).optional(),
  processes: array(number()).optional(),
})
