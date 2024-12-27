import { z } from 'zod'

const { object, string } = z

export const registrationSchema = () => {
  return object({
    email: string().email(),
    fullName: string().min(2).max(50),
    password: string().min(8).max(100),
    confirmPassword: string().min(8).max(100),
  }).refine((data) => data.confirmPassword === data.password, {
    message: 'Passwords do not match',
  })
}

export const loginSchema = () => {
  return object({
    email: string().email(),
    password: string().min(8).max(100),
  })
}

export const acceptInvitationSchema = () => {
  return object({
    password: string().min(8).max(100),
    confirmPassword: string().min(8).max(100),
  }).refine((data) => data.confirmPassword === data.password, {
    message: 'Passwords do not match',
  })
}
