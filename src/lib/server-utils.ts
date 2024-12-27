'use server'

import nodemailer from 'nodemailer'
import SMTPConnection from 'nodemailer/lib/smtp-connection'

export async function sendEmail(options: IEmailOptions): Promise<void> {
  try {
    // Set default sender name and email if not provided
    const senderName = options.from || 'Gov Code Team'
    const senderEmail = process.env.EMAIL_USER

    // Create the email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: true, // Use TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    } as SMTPConnection.Options)

    // Configure mail options
    const mailOptions = {
      from: `${senderName} <${senderEmail}>`,
      to: options.to,
      cc: options.cc || undefined, // Optional CC field
      bcc: options.bcc || undefined, // Optional BCC field
      subject: options.subject,
      html: options.html,
    }

    // Send the email
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error('Error sending email:', error)
    throw new Error('Failed to send email. Please try again later.')
  }
}
