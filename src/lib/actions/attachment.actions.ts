'use server'

import prisma from '@/lib/db_connection'
import { sendError } from '../utils'

export interface IAttachmentManipulator {
  name: string
  url: string
  size?: number
  type?: string
  auditDetailId: string
}

export const createAttachment = async (data: IAttachmentManipulator) => {
  try {
    const attachment = await prisma.attachment.create({
      data: {
        name: data.name,
        url: data.url,
        size: data.size,
        type: data.type,
        auditDetailId: data.auditDetailId,
      },
    })

    return attachment
  } catch (error) {
    sendError(error)
    throw new Error('Error while creating attachment.')
  }
}

export const getAttachmentsByAuditDetailId = async (auditDetailId: string) => {
  try {
    const attachments = await prisma.attachment.findMany({
      where: {
        auditDetailId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return attachments
  } catch (error) {
    sendError(error)
    throw new Error('Error while fetching attachments.')
  }
}

export const deleteAttachment = async (attachmentId: string) => {
  try {
    const deletedAttachment = await prisma.attachment.delete({
      where: {
        id: attachmentId,
      },
    })

    return deletedAttachment
  } catch (error) {
    sendError(error)
    throw new Error('Error while deleting attachment.')
  }
}

export const updateAttachment = async (
  attachmentId: string,
  data: Partial<IAttachmentManipulator>,
) => {
  try {
    const updatedAttachment = await prisma.attachment.update({
      where: {
        id: attachmentId,
      },
      data: {
        name: data.name,
        url: data.url,
        size: data.size,
        type: data.type,
      },
    })

    return updatedAttachment
  } catch (error) {
    sendError(error)
    throw new Error('Error while updating attachment.')
  }
}
