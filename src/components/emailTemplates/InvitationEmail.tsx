import { FC } from 'react'

interface IInvitationEmailProps {
  invitationLink: string
}

export const InvitationEmail: FC<IInvitationEmailProps> = ({
  invitationLink,
}) => (
  <div
    style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '10px',
      backgroundColor: '#f9f9f9',
    }}
  >
    <h2 style={{ textAlign: 'center', color: '#01324b' }}>
      You&apos;re Invited!
    </h2>
    <p style={{ fontSize: '16px', color: '#333' }}>Hello,</p>
    <p style={{ fontSize: '16px', color: '#333' }}>
      We are excited to invite you to join <strong>Gov Code</strong>, where you
      can collaborate, manage tasks, and achieve more together. Click the button
      below to accept your invitation and get started:
    </p>
    <div style={{ textAlign: 'center', margin: '20px 0' }}>
      <a
        href={invitationLink}
        style={{
          display: 'inline-block',
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#ffffff',
          backgroundColor: '#266a55',
          padding: '12px 20px',
          textDecoration: 'none',
          borderRadius: '5px',
        }}
      >
        Accept Invitation
      </a>
    </div>
    <p style={{ fontSize: '16px', color: '#333' }}>
      If you have any questions or need assistance, feel free to reach out to
      our support team.
    </p>
    <p style={{ fontSize: '16px', color: '#333' }}>
      Best regards,
      <br />
      The Gov Code Team
    </p>
    <div
      style={{
        marginTop: '20px',
        padding: '10px',
        textAlign: 'center',
        fontSize: '14px',
        color: '#666',
        borderTop: '1px solid #ddd',
      }}
    >
      <p>
        If you did not expect this invitation, you can safely ignore this email.
      </p>
      <p>
        Need help?
        <a
          href="mailto:support@example.com"
          style={{ color: '#01324b', textDecoration: 'underline' }}
        >
          Contact Support
        </a>
      </p>
    </div>
  </div>
)
