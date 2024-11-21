/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
import prisma from '@/lib/db_connection'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
// import GoogleProvider from 'next-auth/providers/google'
import { sendError } from './utils'
import { Provider, userRole } from '@prisma/client'
import { Adapter } from 'next-auth/adapters'

export const authOptions: NextAuthOptions = {
  providers: [
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_ID as string,
    //   clientSecret: process.env.GOOGLE_SECRET as string,
    // }),

    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: {
          label: 'Email:',
          type: 'text',
          placeholder: 'email',
        },
      },
      async authorize(credentials) {
        if (!credentials) {
          return null
        }
        const { email } = credentials

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
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
                accessToken: true,
                providerAccountId: true,
              },
            },
          },
        })

        if (!user) {
          return null
        }

        const account = user.account[0]

        const data: any = {
          role: user.role,
          photo: user.photo,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          bio: user.bio,
          dateOfBirth: user.dateOfBirth,
          departmentId: user.departmentId,

          provider: account.provider,
          accessToken: account.accessToken,
          providerAccountId: account.providerAccountId,
        }
        return data
      },
    }),
  ],
  adapter: PrismaAdapter(prisma) as Adapter,
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (['google'].includes(account?.provider || '')) {
        try {
          const userExist = await prisma.user.findUnique({
            where: {
              email: user.email!,
            },
          })

          if (!userExist) {
            await prisma.user.create({
              data: {
                email: user.email!,
                fullName: user.name || profile?.name,
                role: user.role as userRole,
                photo: user.image || profile?.image,
                account: {
                  create: {
                    provider: account!.provider as Provider,
                    providerAccountId: account!.providerAccountId,
                    accessToken: account!.access_token,
                    refresh_token: account!.refresh_token,
                    expires_at: account!.expires_at,
                  },
                },
              },
            })
          } else {
            await prisma.account.upsert({
              where: {
                provider_providerAccountId: {
                  provider: account!.provider as Provider,
                  providerAccountId: account!.providerAccountId,
                },
              },
              update: {
                accessToken: account!.access_token,
                refresh_token: account!.refresh_token,
                expires_at: account!.expires_at,
              },
              create: {
                email: userExist.email,
                provider: account!.provider as Provider,
                providerAccountId: account!.providerAccountId,
                accessToken: account!.access_token,
                refresh_token: account!.refresh_token,
                expires_at: account!.expires_at,
              },
            })
          }

          return true
        } catch (error) {
          // sendError(error)
          return false
        }
      }

      if (user) {
        return true
      }
      return false
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url
      else if (url.startsWith('/')) return new URL(url, baseUrl).toString()
      return baseUrl
    },
    async session({ session, token }) {
      session.role = token.role
      session.email = token.email
      session.fullName = token.fullName
      session.photo = token.photo
      session.phone = token.phone
      session.bio = token.bio
      session.dateOfBirth = token.dateOfBirth
      session.departmentId = token.departmentId
      session.provider = token.provider
      session.accessToken = token.accessToken
      session.providerAccountId = token.providerAccountId

      return session
    },
    async jwt({ token, user, account }) {
      try {
        if (user) {
          token.role = user.role
          token.email = user.email!
          token.fullName = user.fullName
          token.photo = user.photo
          token.phone = user.phone
          token.bio = user.bio
          token.dateOfBirth = user.dateOfBirth
          token.departmentId = user.departmentId

          const accountInfo = await prisma.account.findUnique({
            where: { email: user.email },
            select: {
              provider: true,
              accessToken: true,
              providerAccountId: true,
            },
          })

          if (accountInfo) {
            token.provider = accountInfo.provider
            token.accessToken = accountInfo.accessToken ?? ''
            token.providerAccountId = accountInfo.providerAccountId
          }
        } else if (account?.provider) {
          const dbUser = await prisma.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider: account?.provider as Provider,
                providerAccountId: account?.providerAccountId,
              },
            },
            select: {
              provider: true,
              providerAccountId: true,
              accessToken: true,
              user: {
                select: {
                  role: true,
                  email: true,
                  fullName: true,
                  photo: true,
                  phone: true,
                  bio: true,
                  dateOfBirth: true,
                  department: true,
                },
              },
            },
          })

          if (dbUser && dbUser.user) {
            token.role = dbUser.user.role
            token.email = dbUser.user.email
            token.fullName = dbUser.user.fullName ?? ''
            token.photo = dbUser.user.photo ?? ''
            token.phone = dbUser.user.phone ?? ''
            token.bio = dbUser.user.bio ?? ''
            token.dateOfBirth = dbUser.user.dateOfBirth ?? null
            token.departmentId = dbUser.user.department?.id ?? null

            token.provider = dbUser.provider
            token.providerAccountId = dbUser.providerAccountId
            token.accessToken = dbUser.accessToken ?? ''
          }
        }
      } catch (error) {
        sendError(error)
        console.log('Failed to update token', error)
      }

      return token
    },
  },
  pages: {
    signIn: '/sign-in',
    error: '/',
  },
  debug: false,

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
}
