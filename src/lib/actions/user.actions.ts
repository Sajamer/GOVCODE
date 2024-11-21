'use server'

import prisma from '@/lib/db_connection'
import { randomUUID, createHash } from 'crypto'
import { signIn, getSession } from 'next-auth/react'
import { sendEmailOTP } from '@/app/api/otp/route'

// Unified error handler
const handleError = (error: unknown, message: string) => {
  console.error(error, message)
  throw new Error(message)
}

export const requestOTP = async (email: string) => {
  try {
    const otp = await sendEmailOTP(email)
    return { otp, message: 'OTP sent successfully' }
  } catch (error) {
    handleError(error, 'Failed to send OTP')
  }
}

// Create account logic with OTP
export const createAccount = async ({
  fullName,
  email,
}: {
  fullName: string
  email: string
}) => {
  try {
    // request OTP
    await requestOTP(email)

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } })

    let user

    if (!existingUser) {
      // Generate an access token
      const accessToken = createHash('sha256')
        .update(randomUUID())
        .digest('hex')

      // Create a new user and associate the account
      user = await prisma.user.create({
        data: {
          email,
          fullName,
          account: {
            create: {
              provider: 'credential',
              providerAccountId: randomUUID(),
              accessToken,
            },
          },
        },
      })
    } else {
      // If user exists, assign it to the `user` variable
      user = existingUser
    }

    return {
      accountId: user.id,
      message:
        'OTP sent successfully. Please verify it to complete registration.',
    }
  } catch (error) {
    handleError(error, 'Failed to create account')
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

  console.log('storedOtp: ', storedOtp, storedOtp?.otp === inputOtp)

  if (!storedOtp || storedOtp.expiresAt < new Date()) {
    return false
  }

  if (storedOtp.otp === inputOtp) {
    await prisma.otp.delete({ where: { email } })
    return true
  }

  return false
}
