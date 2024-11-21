/* eslint-disable @typescript-eslint/no-unused-vars */
import { sendError } from '@/lib/utils'
import { validate } from '@/lib/validate'
import { randomUUID, createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import SMTPConnection from 'nodemailer/lib/smtp-connection'

import prisma from '@/lib/db_connection'
import { BodySchema, OtpValidationSchema } from '@/schema/otp.schema'
import { verifyOTP } from '@/lib/actions/user.actions'

export const dynamic = 'force-dynamic'

export async function sendEmailOTP(email: string): Promise<string> {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await prisma.otp.upsert({
      where: { email },
      update: { otp, expiresAt },
      create: { email, otp, expiresAt },
    })

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    } as SMTPConnection.Options)

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="text-align: center; color: #4CAF50;">Gov code</h2>
        <p style="font-size: 16px; color: #333;">Hello,</p>
        <p style="font-size: 16px; color: #333;">Thank you for using Gov code. To complete your action, please use the OTP code below:</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="display: inline-block; font-size: 24px; font-weight: bold; color: #4CAF50; padding: 10px 20px; border: 2px solid #4CAF50; border-radius: 5px;">${otp}</span>
        </div>
        <p style="font-size: 16px; color: #333;">This code will expire in 10 minutes.</p>
        <p style="font-size: 16px; color: #333;">If you did not request this code, please ignore this email.</p>
        <p style="font-size: 16px; color: #333;">Best regards,<br/>The Gov code Team</p>
      </div>
    `,
    }

    await transporter.sendMail(mailOptions)

    return otp
  } catch (error) {
    // sendError(error)
    throw new Error('Failed to send OTP. Please try again later.')
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return validate(
    { body: BodySchema },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async (validatedReq) => {
      try {
        const { body } = validatedReq

        await sendEmailOTP(body.email)

        const response: IResponse<unknown> = {
          message: 'OTP sent to your email. Please enter the OTP to continue.',
          status: 200,
        }
        return NextResponse.json(response)
      } catch (error) {
        sendError(error)
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'
        const response: IResponse<unknown> = {
          message: 'Error sending email',
          data: errorMessage,
          status: 500,
        }
        return NextResponse.json(response)
      }
    },
    false,
    ['POST'],
  )(req)
}

export async function PUT(req: NextRequest): Promise<NextResponse> {
  return validate(
    { body: OtpValidationSchema },
    async (validatedReq) => {
      try {
        const { body } = validatedReq
        const isValid = await verifyOTP(body.email, body.otp)

        if (isValid) {
          const user = await prisma.user.findUnique({
            where: {
              email: body.email,
            },
          })

          if (!user) {
            const accessToken = createHash('sha256')
              .update(randomUUID())
              .digest('hex')

            await prisma.user.create({
              data: {
                email: body.email,

                account: {
                  create: {
                    provider: 'credential',
                    accessToken,
                    providerAccountId: randomUUID(),
                  },
                },
              },
            })
          }

          const response: IResponse<null> = {
            message: 'OTP verified successfully',
            status: 200,
          }
          return NextResponse.json(response)
        } else {
          const response: IResponse<null> = {
            message: 'Invalid OTP',
            status: 400,
          }
          return NextResponse.json(response)
        }
      } catch (error) {
        sendError(error)
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'
        const response: IResponse<unknown> = {
          message: 'Error validating OTP',
          data: errorMessage,
          status: 500,
        }
        return NextResponse.json(response)
      }
    },
    false,
    ['PUT'],
  )(req)
}
