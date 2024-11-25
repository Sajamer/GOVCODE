/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/naming-convention */
import prisma from '@/lib/db_connection'
import '@auth/core/jwt'
import { PrismaAdapter } from '@auth/prisma-adapter'
import NextAuth, {
  Session as NextAuthSession,
  User as NextAuthUser,
} from 'next-auth'
import { JWT } from 'next-auth/jwt'
import Credentials from 'next-auth/providers/credentials'
import { comparePasswords } from './actions/userActions'

interface CustomUser extends NextAuthUser {
  id: string
  role: string
  email: string
  fullName: string
  photo: string
  phone: string
  bio: string
  dateOfBirth: string
  departmentId: string
  access_token: string
  providerAccountId: string
}

interface CustomSession extends NextAuthSession {
  user: {
    id: string
    role: string
    email: string
    fullName: string
    photo: string
    phone: string
    bio: string
    dateOfBirth: string
    departmentId: string
    access_token: string
    providerAccountId: string
  }
}

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
          select: {
            id: true,
            role: true,
            email: true,
            fullName: true,
            photo: true,
            phone: true,
            bio: true,
            dateOfBirth: true,
            departmentId: true,
            account: {
              select: {
                provider: true,
                providerAccountId: true,
                access_token: true,
              },
            },
          },
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
    async jwt({ token, user }: { token: JWT; user?: NextAuthUser }) {
      if (user) {
        const customUser = user as CustomUser

        token.id = customUser.id
        token.role = customUser.role
        token.email = customUser.email
        token.fullName = customUser.fullName
        token.photo = customUser.photo
        token.phone = customUser.phone
        token.bio = customUser.bio
        token.dateOfBirth = customUser.dateOfBirth
        token.departmentId = customUser.departmentId
        token.access_token = customUser.access_token
        token.providerAccountId = customUser.providerAccountId
      }
      return token
    },
    async session({
      session,
      token,
    }: {
      session: NextAuthSession
      token: JWT
    }) {
      const customSession = session as CustomSession

      customSession.user.id = token.id as string
      customSession.user.role = token.role as string
      customSession.user.email = token.email as string
      customSession.user.fullName = token.fullName as string
      customSession.user.photo = token.photo as string
      customSession.user.phone = token.phone as string
      customSession.user.bio = token.bio as string
      customSession.user.dateOfBirth = token.dateOfBirth as string
      customSession.user.departmentId = token.departmentId as string
      customSession.user.access_token = token.access_token as string
      customSession.user.providerAccountId = token.providerAccountId as string

      return customSession
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
})
