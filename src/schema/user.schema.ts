import { userRole } from '@prisma/client'
import { z } from 'zod'

const { object, string, number } = z

export const invitationSchema = object({
  fullName: string().min(3, { message: 'Be at least 3 characters long' }),
  email: string().email(),
  role: z.nativeEnum(userRole).default(userRole.userDepartment),
  departmentId: number(),
  invitedByUserId: string(),
})

export const manualSchema = object({
  fullName: string().min(3, { message: 'Be at least 3 characters long' }),
  email: string().email(),
  password: string().min(8).max(100),
  role: z.nativeEnum(userRole).default(userRole.userDepartment),
  departmentId: number(),
})

export const userUpdateSchema = object({
  fullName: string().min(3, { message: 'Be at least 3 characters long' }),
  role: z.nativeEnum(userRole).default(userRole.userDepartment),
  departmentId: number(),
})

export const myProfileSchema = object({
  fullName: string().min(3, { message: 'Be at least 3 characters long' }),
  phone: string().nullable(),
  photo: string().nullable(),
})

export type IInvitationManipulator = z.infer<typeof invitationSchema>
export type IManualManipulator = z.infer<typeof manualSchema>
export type IUserUpdateManipulator = z.infer<typeof userUpdateSchema>
export type IMyProfileManipulator = z.infer<typeof myProfileSchema>
