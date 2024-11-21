/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth, { DefaultUser } from 'next-auth'

declare module 'next-auth' {
  interface User {
    role: string
    email: string
    fullName: string | null
    photo: string | null
    phone: string | null
    bio: string | null
    dateOfBirth: Date | null
    departmentId: number | null

    provider: string
    providerAccountId: string
    accessToken: string
  }

  interface Session {
    role: string
    email: string
    fullName: string | null
    photo: string | null
    phone: string | null
    bio: string | null
    dateOfBirth: Date | null
    departmentId: number | null

    provider: string
    providerAccountId: string
    accessToken: string
  }
}
declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    email: string
    fullName: string | null
    photo: string | null
    phone: string | null
    bio: string | null
    dateOfBirth: Date | null
    departmentId: number | null
    provider: string
    providerAccountId: string
    accessToken: string
  }
}
