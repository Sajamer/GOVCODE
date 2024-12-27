'use server'

import prisma from '@/lib/db_connection'
import {
  IManualManipulator,
  IUserUpdateManipulator,
} from '@/schema/user.schema'
import { IUsers } from '@/types/users'
import { createHashedPassword, sendError } from '../utils'

// Unified error handler
const handleError = (error: unknown, message: string) => {
  console.error(error, message)
  throw new Error(message)
}

// Create account logic with OTP
export const createAccount = async ({
  fullName,
  email,
  password,
  confirmPassword,
}: {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}): Promise<IActionResponse> => {
  try {
    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } })

    if (existingUser)
      return {
        error: true,
        errorCode: 'USER_ALREADY_EXISTS',
        message: 'User already exists',
      }

    // check passwords and compare and hash
    if (password !== confirmPassword)
      return {
        error: true,
        errorCode: 'PASSWORD_MISMATCH',
        message: 'Passwords do not match',
      }

    // we need to hash and salt the password
    const { salt, hash } = await createHashedPassword(password)

    // create user

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        accounts: {
          create: {
            provider: 'credentials',
            providerAccountId: email,
            type: 'email',
          },
        },
      },
    })

    // save the password to the user
    await prisma.password.create({
      data: {
        userId: user.id,
        salt,
        hash,
      },
    })

    // send the verification email to user.
    return {
      error: false,
      message: 'Account created successfully',
      data: user,
    }
  } catch (error) {
    sendError(error)
    handleError(error, 'Failed to create account')
    return {
      error: true,
      errorCode: 'CREATE_ACCOUNT_FAILED',
      message: 'Failed to create account',
    }
  }
}

export async function verifyOTP(
  email: string,
  inputOtp: string,
): Promise<boolean> {
  const storedOtp = await prisma.otp.findUnique({
    where: { email },
  })

  if (!storedOtp || storedOtp.expiresAt < new Date()) {
    return false
  }

  if (storedOtp.otp === inputOtp) {
    await prisma.otp.delete({ where: { email } })
    return true
  }

  return false
}

export const getAllOrganizationUsers = async (
  searchParams?: Record<string, string>,
) => {
  try {
    const params = searchParams || {}

    const organizationId = +(params?.organizationId ?? 0)
    const limit = +(params?.limit ?? '10')
    const page = +(params?.page ?? '1')

    const skip = (page - 1) * limit

    // Fetch users through the organization->departments->users relationship
    const users = await prisma.user.findMany({
      skip,
      take: limit,
      where: {
        department: {
          organizationId, // Match organization ID via department
        },
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!users || users.length === 0) {
      return []
    }

    return users as IUsers[]
  } catch (error) {
    sendError(error)
    handleError(error, 'Failed to fetch users')
    throw new Error('Failed to fetch users by organization')
  }
}

export const addUserManually = async (dto: IManualManipulator) => {
  try {
    const { fullName, email, password, departmentId, role } = dto
    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } })

    if (existingUser)
      return {
        error: true,
        errorCode: 'USER_ALREADY_EXISTS',
        message: 'User already exists',
      }

    // we need to hash and salt the password
    const { salt, hash } = await createHashedPassword(password)

    // create user

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        departmentId,
        role,
        accounts: {
          create: {
            provider: 'credentials',
            providerAccountId: email,
            type: 'email',
          },
        },
      },
    })

    // save the password to the user
    await prisma.password.create({
      data: {
        userId: user.id,
        salt,
        hash,
      },
    })

    // send the verification email to user.
    return {
      error: false,
      message: 'Account created successfully',
      data: user,
    }
  } catch (error) {
    sendError(error)
    handleError(error, 'Failed to create account')
    return {
      error: true,
      errorCode: 'CREATE_ACCOUNT_FAILED',
      message: 'Failed to create account',
    }
  }
}

export const deleteUser = async (id: string) => {
  try {
    const user = await prisma.user.delete({
      where: { id },
    })

    return user
  } catch (error) {
    sendError(error)
    handleError(error, 'Failed to delete user')
    throw new Error('Failed to delete user')
  }
}

export const updateUser = async (id: string, dto: IUserUpdateManipulator) => {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        fullName: dto.fullName,
        role: dto.role,
        departmentId: dto.departmentId,
      },
    })

    return user
  } catch (error) {
    sendError(error)
    handleError(error, 'Failed to update user')
    throw new Error('Failed to update user')
  }
}
