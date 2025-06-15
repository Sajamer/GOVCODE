'use server'

import prisma from '@/lib/db_connection'
import { sendError } from '../utils'

export interface IAuditDetailsManipulator {
  frameworkAttributeId: string
  auditCycleId: number
  auditBy: string
  ownedBy?: string
  auditRuleId: number
  comment?: string
  recommendation?: string
  // Legacy fields - will be removed after migration
  attachmentUrl?: string
  attachmentName?: string
}

export const getAuditDetailsByFrameworkAndCycle = async (
  frameworkId: string,
  auditCycleId: number,
) => {
  try {
    const auditDetails = await prisma.auditDetails.findMany({
      where: {
        auditCycleId,
        frameworkAttribute: {
          frameworkId,
        },
      },
      include: {
        auditor: {
          select: {
            id: true,
            fullName: true,
          },
        },
        owner: {
          select: {
            id: true,
            fullName: true,
          },
        },
        auditRule: {
          include: {
            status: true,
          },
        },
        frameworkAttribute: {
          select: {
            id: true,
            name: true,
            value: true,
          },
        },
        attachments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    return auditDetails
  } catch (error) {
    sendError(error)
    throw new Error('Error while fetching audit details.')
  }
}

export const createOrUpdateAuditDetail = async (
  data: IAuditDetailsManipulator,
) => {
  try {
    const auditDetail = await prisma.auditDetails.upsert({
      where: {
        frameworkAttributeId_auditCycleId: {
          frameworkAttributeId: data.frameworkAttributeId,
          auditCycleId: data.auditCycleId,
        },
      },
      update: {
        auditBy: data.auditBy,
        ownedBy: data.ownedBy,
        auditRuleId: data.auditRuleId,
        comment: data.comment,
        recommendation: data.recommendation,
      },
      create: {
        frameworkAttributeId: data.frameworkAttributeId,
        auditCycleId: data.auditCycleId,
        auditBy: data.auditBy,
        ownedBy: data.ownedBy,
        auditRuleId: data.auditRuleId,
        comment: data.comment,
        recommendation: data.recommendation,
      },
      include: {
        auditor: {
          select: {
            id: true,
            fullName: true,
          },
        },
        owner: {
          select: {
            id: true,
            fullName: true,
          },
        },
        auditRule: {
          include: {
            status: true,
          },
        },
        attachments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    return auditDetail
  } catch (error) {
    sendError(error)
    throw new Error('Error while creating/updating audit detail.')
  }
}

export const saveMultipleAuditDetails = async (
  auditDetails: IAuditDetailsManipulator[],
) => {
  try {
    const results = await Promise.all(
      auditDetails.map((detail) => createOrUpdateAuditDetail(detail)),
    )

    return results
  } catch (error) {
    sendError(error)
    throw new Error('Error while saving audit details.')
  }
}

export const deleteAuditDetail = async (
  frameworkAttributeId: string,
  auditCycleId: number,
) => {
  try {
    const deletedAuditDetail = await prisma.auditDetails.delete({
      where: {
        frameworkAttributeId_auditCycleId: {
          frameworkAttributeId,
          auditCycleId,
        },
      },
    })

    return deletedAuditDetail
  } catch (error) {
    sendError(error)
    throw new Error('Error while deleting audit detail.')
  }
}

export const getAuditDetailWithAttachments = async (
  frameworkAttributeId: string,
  auditCycleId: number,
) => {
  try {
    const auditDetail = await prisma.auditDetails.findUnique({
      where: {
        frameworkAttributeId_auditCycleId: {
          frameworkAttributeId,
          auditCycleId,
        },
      },
      include: {
        attachments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        auditor: {
          select: {
            id: true,
            fullName: true,
          },
        },
        owner: {
          select: {
            id: true,
            fullName: true,
          },
        },
        auditRule: {
          include: {
            status: true,
          },
        },
      },
    })

    return auditDetail
  } catch (error) {
    sendError(error)
    throw new Error('Error while fetching audit detail with attachments.')
  }
}
