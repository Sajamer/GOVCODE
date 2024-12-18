import { z } from 'zod'

const { object, string } = z

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
})
