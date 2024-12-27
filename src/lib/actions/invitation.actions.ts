'use server'

import prisma from '@/lib/db_connection'
import { IInvitationManipulator } from '@/schema/user.schema'
import crypto from 'crypto'
import { sendEmail } from '../server-utils'
import { createHashedPassword, sendError } from '../utils'

export async function inviteUser({
  email,
  role,
  fullName,
  departmentId,
  invitedByUserId,
}: IInvitationManipulator) {
  const token = crypto.randomBytes(32).toString('hex') // Generate secure token
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  // Save the invitation in the database
  const invitation = await prisma.invitation.create({
    data: {
      email,
      role,
      fullName,
      departmentId,
      invitedByUserId,
      token,
      expiresAt,
    },
  })

  // Construct invitation link
  const invitationLink = `${process.env.NEXT_PUBLIC_BASE_URL}accept-invitation?token=${token}`
  // const emailHTML = renderToStaticMarkup(
  //   createElement(InvitationEmail, { invitationLink }),
  // )

  // Send invitation email
  await sendEmail({
    to: email,
    subject: 'You Are Invited to Join Gov Code',
    html: `
    <div
      style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 10px;
        background-color: #f9f9f9;
      "
    >
      <h2 style="text-align: center; color: #01324b;">
        You're Invited!
      </h2>
      <p style="font-size: 16px; color: #333;">Hello,</p>
      <p style="font-size: 16px; color: #333;">
        We are excited to invite you to join <strong>Gov Code</strong>, where you
        can collaborate, manage tasks, and achieve more together. Click the button
        below to accept your invitation and get started:
      </p>
      <div style="text-align: center; margin: 20px 0;">
        <a
          href="${invitationLink}"
          style="
            display: inline-block;
            font-size: 16px;
            font-weight: bold;
            color: #ffffff;
            background-color: #266a55;
            padding: 12px 20px;
            text-decoration: none;
            border-radius: 5px;
          "
        >
          Accept Invitation
        </a>
      </div>
      <p style="font-size: 16px; color: #333;">
        If you have any questions or need assistance, feel free to reach out to
        our support team.
      </p>
      <p style="font-size: 16px; color: #333;">
        Best regards,
        <br />
        The Gov Code Team
      </p>
      <div
        style="
          margin-top: 20px;
          padding: 10px;
          text-align: center;
          font-size: 14px;
          color: #666;
          border-top: 1px solid #ddd;
        "
      >
        <p>
          If you did not expect this invitation, you can safely ignore this email.
        </p>
        <p>
          Need help?
          <a
            href="mailto:support@example.com"
            style="color: #01324b; text-decoration: underline;"
          >
            Contact Support
          </a>
        </p>
      </div>
    </div>
  `,
  })

  return invitation
}

export async function acceptInvitation(token: string, password: string) {
  try {
    const invitation = await prisma.invitation.findUnique({ where: { token } })

    if (!invitation || invitation.expiresAt < new Date()) {
            return {
              error: true,
              message: 'Invalid or expired invitation.',
              errorCode: 'USER_ALREADY_EXISTS',
            }
    }

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
    })

    if (existingUser)
      return {
        error: true,
        errorCode: 'USER_ALREADY_EXISTS',
        message: 'User already exists',
      }

    // we need to hash and salt the password
    const { salt, hash } = await createHashedPassword(password)

    // Create the user account
    const user = await prisma.user.create({
      data: {
        fullName: invitation.fullName,
        email: invitation.email,
        role: invitation.role,
        departmentId: invitation.departmentId,
        accounts: {
          create: {
            provider: 'credentials',
            providerAccountId: invitation.email,
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

    // Update the invitation status
    await prisma.invitation.update({
      where: { token },
      data: { status: 'accepted' },
    })

    return user
  } catch (error) {
    sendError(error)
    return {
      error: true,
      errorCode: 'CREATE_ACCOUNT_FAILED',
      message: 'Failed to create account',
    }
  }
}
