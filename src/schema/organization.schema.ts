import { z } from 'zod'

const { object, array, string } = z

const organizationDepartmentsSchema = z.object({
  name: string({ required_error: 'This field is required.' })
    .min(4, {
      message: 'Be at least 4 characters long',
    })
    .max(128, { message: 'must be at most 128 characters' })
    .trim(),
})

export const organizationSchema = object({
  name: string().min(3),
  email: string().email(),
  description: string().optional(),
  logo: string().optional(),
  website: string().optional(),
  phone: string().optional(),
  address: string().optional(),
  city: string().optional(),
  state: string().optional(),
  country: string().optional(),
  postalCode: string().optional(),
  timezone: string().optional(),
  currency: string().optional(),
  departments: array(organizationDepartmentsSchema, {
    required_error: 'This field is required.',
  }).min(1, {
    message: 'At least one department is required',
  }),
})

export const DepartmentParamsSchema = z.object({
  id: z.preprocess((val) => {
    if (typeof val === 'string') {
      const parsed = parseInt(val, 10)
      return isNaN(parsed) ? undefined : parsed
    }
    return val
  }, z.number().int().positive().optional()),
})
