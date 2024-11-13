/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
import prisma from '@/lib/db_connection'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
// import { randomUUID } from 'crypto'
// import { sendError } from './utils'
// import { Provider } from '@prisma/client'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
    }),

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
            username: true,
            status: true,
            photo: true,
            points: true,
            fullName: true,
            subscription: {
              select: {
                endDate: true,
              },
            },
            account: {
              select: {
                provider: true,
                accessToken: true,
                providerAccountId: true,
              },
            },
          },
        })

        if (!user || user.status === 'banned') {
          return null
        }

        const isSubscribed =
          user?.subscription && new Date(user.subscription.endDate) > new Date()

        const account = user.account[0]

        const data: any = {
          role: user.role,
          username: user.username,
          photo: user.photo,
          fullName: user.fullName,
          points: user.points,
          email: user.email,
          isSubscribed,
          provider: account.provider,
          accessToken: account.accessToken,
          providerAccountId: account.providerAccountId,
        }
        return data
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXT_PUBLIC_SECRET,
  // callbacks: {
  //   async signIn({ user, account, profile }) {
  //     if (['google', 'facebook'].includes(account?.provider || '')) {
  //       try {
  //         const userExist = await prisma.user.findUnique({
  //           where: {
  //             email: user.email!,
  //           },
  //         })

  //         const username = userExist?.username || randomUUID()

  //         if (!userExist) {
  //           await prisma.user.create({
  //             data: {
  //               email: user.email!,
  //               username,
  //               fullName: user.name || profile?.name,
  //               photo: user.image || profile?.image,
  //               subscription: {
  //                 create: {
  //                   planName: 'FREE',
  //                 },
  //               },
  //               account: {
  //                 create: {
  //                   provider: account!.provider as Provider,
  //                   providerAccountId: account!.providerAccountId,
  //                   accessToken: account!.access_token,
  //                   refresh_token: account!.refresh_token,
  //                   expires_at: account!.expires_at,
  //                 },
  //               },
  //             },
  //           })
  //         } else {
  //           await prisma.account.upsert({
  //             where: {
  //               provider_providerAccountId: {
  //                 provider: account!.provider as Provider,
  //                 providerAccountId: account!.providerAccountId,
  //               },
  //             },
  //             update: {
  //               accessToken: account!.access_token,
  //               refresh_token: account!.refresh_token,
  //               expires_at: account!.expires_at,
  //             },
  //             create: {
  //               username: userExist.username,
  //               provider: account!.provider as Provider,
  //               providerAccountId: account!.providerAccountId,
  //               accessToken: account!.access_token,
  //               refresh_token: account!.refresh_token,
  //               expires_at: account!.expires_at,
  //             },
  //           })
  //           await prisma.subscription.upsert({
  //             where: {
  //               username: userExist.username,
  //             },
  //             update: {},
  //             create: {
  //               username: userExist.username,
  //             },
  //           })
  //         }

  //         return true
  //       } catch (error) {
  //         // sendError(error)
  //         return false
  //       }
  //     }

  //     return true
  //   },

  //   async redirect({ url, baseUrl }) {
  //     if (url.startsWith(baseUrl)) return url
  //     else if (url.startsWith('/')) return new URL(url, baseUrl).toString()
  //     return baseUrl
  //   },
  //   async session({ session, token }) {
  //     session.role = token.role
  //     session.email = token.email
  //     session.username = token.username
  //     session.photo = token.photo
  //     session.fullName = token.fullName
  //     session.isSubscribed = token.isSubscribed
  //     session.points = token.points
  //     session.provider = token.provider
  //     session.accessToken = token.accessToken
  //     session.providerAccountId = token.providerAccountId

  //     return session
  //   },
  //   async jwt({ token, user, account }) {
  //     try {
  //       if (user) {
  //         const subscription = await prisma.subscription.findUnique({
  //           where: { username: user.username },
  //           select: { endDate: true },
  //         })

  //         const isSubscribed =
  //           subscription && new Date(subscription.endDate) > new Date()

  //         token.role = user.role
  //         token.email = user.email!
  //         token.username = user.username
  //         token.isSubscribed = isSubscribed ?? false
  //         token.photo = user.photo
  //         token.fullName = user.fullName
  //         token.points = user.points

  //         const accountInfo = await prisma.account.findUnique({
  //           where: { username: user.username },
  //           select: {
  //             provider: true,
  //             accessToken: true,
  //             providerAccountId: true,
  //           },
  //         })

  //         if (accountInfo) {
  //           token.provider = accountInfo.provider
  //           token.accessToken = accountInfo.accessToken ?? ''
  //           token.providerAccountId = accountInfo.providerAccountId
  //         }
  //       } else if (account?.provider) {
  //         const dbUser = await prisma.account.findUnique({
  //           where: {
  //             provider_providerAccountId: {
  //               provider: account?.provider as Provider,
  //               providerAccountId: account?.providerAccountId,
  //             },
  //           },
  //           select: {
  //             provider: true,
  //             providerAccountId: true,
  //             accessToken: true,
  //             user: {
  //               select: {
  //                 role: true,
  //                 email: true,
  //                 username: true,
  //                 photo: true,
  //                 points: true,
  //                 fullName: true,
  //                 subscription: {
  //                   select: {
  //                     endDate: true,
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //         })

  //         if (dbUser && dbUser.user) {
  //           const isSubscribed =
  //             dbUser.user.subscription &&
  //             new Date(dbUser.user.subscription.endDate) > new Date()

  //           token.role = dbUser.user.role
  //           token.email = dbUser.user.email
  //           token.username = dbUser.user.username
  //           token.isSubscribed = isSubscribed ?? false
  //           token.photo = dbUser.user.photo ?? ''
  //           token.fullName = dbUser.user.fullName ?? ''
  //           token.points = dbUser.user.points ?? 0
  //           token.provider = dbUser.provider
  //           token.providerAccountId = dbUser.providerAccountId
  //           token.accessToken = dbUser.accessToken ?? ''
  //         }
  //       }
  //     } catch (error) {
  //       // sendError(error)
  //       console.log('Failed to update token', error)
  //     }

  //     return token
  //   },
  // },
  pages: {
    error: '/',
  },
  debug: false,

  session: {
    strategy: 'jwt',
    maxAge: 15 * 24 * 60 * 60, // 15 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
}
