'use server'

import prisma from '@/lib/db_connection'
import { pbkdf2Sync, randomBytes } from 'crypto'
import { getSession, signIn } from 'next-auth/react'
import { sendError } from '../utils'

export const hashPassword = async (
  password: string,
  salt: string,
): Promise<string> => {
  const hash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return hash
}

export const generateSalt = async (): Promise<string> => {
  return randomBytes(16).toString('hex')
}

export const createHashedPassword = async (
  password: string,
): Promise<{ salt: string; hash: string }> => {
  const salt = await generateSalt()
  const hash = await hashPassword(password, salt)
  return { salt, hash }
}

export const comparePasswords = async (
  password: string,
  salt: string,
  hash: string,
): Promise<boolean> => {
  const newHash = await hashPassword(password, salt)
  return newHash === hash
}

// Unified error handler
const handleError = (error: unknown, message: string) => {
  console.error(error, message)
  throw new Error(message)
}

type IActionResponse =
  | { error: false; message: string; data: unknown }
  | {
      error: true
      message: string
      errorCode: unknown
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
        account: {
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

// Sign-in user logic
export const signInUser = async ({
  email,
  otp,
}: {
  email: string
  otp: string
}) => {
  try {
    // Verify OTP
    const isValid = await verifyOTP(email, otp)
    if (!isValid) throw new Error('Invalid OTP')

    // Check if the user exists
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new Error('User not found')

    // Perform sign-in using next-auth
    const signInResponse = await signIn('credentials', {
      email,
      redirect: true,
      callbackUrl: '/',
    })
    if (!signInResponse?.ok) throw new Error('Failed to sign in user')

    return { accountId: user.id, message: 'User signed in successfully' }
  } catch (error) {
    sendError(error)
    handleError(error, 'Failed to sign in user')
  }
}

// Get the current logged-in user
export const getCurrentUser = async () => {
  try {
    const session = await getSession()
    if (!session || !session.user?.email) return null

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })
    return user || null
  } catch (error) {
    console.error(error)
    sendError(error)
    return null
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
