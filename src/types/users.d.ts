import { userRole } from '@prisma/client'

export interface IUsers {
  id: string
  email: string
  fullName: string
  role: userRole
  department: IDepartment

  [key: string]: unknown
}
