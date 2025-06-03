import { z } from 'zod'

const { object, string, number, array } = z

export const ParamsSchema = z.object({
  id: z.number().int().positive(),
})

export const BodySchema = object({
  code: string().min(3),
  name: string().min(3),
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
  statusId: number().nullable(),
  statusType: string().default('default'),
  objectives: array(number()).optional(),
  compliances: array(number()).optional(),
  processes: array(number()).optional(),
}).refine(
  (data) => {
    if (data.statusType !== 'default') {
      return data.statusId !== null && data.statusId !== undefined
    }
    return true
  },
  {
    message: "Status ID is required when status type is not 'default'",
    path: ['statusId'],
  },
)
