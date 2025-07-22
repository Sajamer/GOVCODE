import { auth } from '@/lib/auth'
import prisma from '@/lib/db_connection'
import { unlink } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

// DELETE endpoint to remove attachment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Verify user authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: attachmentId } = await params

    // Get attachment info from database
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
    })

    if (!attachment) {
      return NextResponse.json(
        { error: 'Attachment not found' },
        { status: 404 },
      )
    }

    // Delete file from filesystem if it's a local file
    if (attachment.url.startsWith('/uploads/')) {
      const filename = path.basename(attachment.url)
      const filepath = path.join(process.cwd(), 'public', 'uploads', filename)

      try {
        await unlink(filepath)
      } catch (error) {
        console.warn('Failed to delete file from filesystem:', error)
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete from database
    await prisma.attachment.delete({
      where: { id: attachmentId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete attachment' },
      { status: 500 },
    )
  }
}

// GET endpoint to serve files
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: attachmentId } = await params

    // Get attachment info from database
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
    })

    if (!attachment) {
      return NextResponse.json(
        { error: 'Attachment not found' },
        { status: 404 },
      )
    }

    return NextResponse.json({
      id: attachment.id,
      name: attachment.name,
      url: attachment.url,
      size: attachment.size,
      type: attachment.type,
    })
  } catch (error) {
    console.error('Get attachment error:', error)
    return NextResponse.json(
      { error: 'Failed to get attachment' },
      { status: 500 },
    )
  }
}
