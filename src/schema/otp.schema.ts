import { z } from 'zod'

export const BodySchema = z.object({
  email: z.string(),
})

export const OtpValidationSchema = z.object({
  email: z.string(),
  otp: z.string(),
})
