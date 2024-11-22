/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/naming-convention */
import prisma from '@/lib/db_connection'
import '@auth/core/jwt'
import { PrismaAdapter } from '@auth/prisma-adapter'
import NextAuth from 'next-auth'
import 'next-auth/jwt'
import Credentials from 'next-auth/providers/credentials'
import { comparePasswords } from './actions/user.actions'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
      },
      authorize: async (credentials) => {
        const { email, password } = credentials as {
          email: string
          password: string
        }

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user) return null
        // if (!user.emailVerified) return null

        const passwordData = await prisma.password.findFirst({
          where: { userId: user.id },
        })

        if (!passwordData) return null // if password is not set

        // verify the password
        const isValid = await comparePasswords(
          password,
          passwordData.salt,
          passwordData.hash,
        )

        if (isValid) return user
        return null
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: '/sign-in',
    error: '/sign-in', // error is passed in query string
  },

  callbacks: {
    signIn({ user }) {
      if (user) {
        return true
      }
      return false
    },
    jwt({ token, user }) {
      if (user) {
        return { ...token, ...user }
      }
      return token
    },
    session({ session }) {
      return session
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
})
