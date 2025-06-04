'use server' // This directive is required for Next.js server actions

import prisma from '@/lib/db_connection'
import { sendError } from '@/lib/utils'
import { IAuditStatusManipulator } from '@/schema/audit-status.schema'

export async function getAllAuditStatuses() {
  try {
    const auditStatusData = await prisma.auditStatus.findMany({
      include: { auditRules: true },
    })

    if (!auditStatusData) {
      return []
    }

    return auditStatusData
  } catch (error) {
    sendError(error)
    throw new Error('Error while fetching audit statuses.')
  }
}

export async function createAuditStatus(data: IAuditStatusManipulator) {
  try {
    const newStatus = await prisma.auditStatus.create({
      data: {
        name: data.name,
        auditRules: {
          create: data.auditRules,
        },
      },
      include: { auditRules: true },
    })
    return newStatus
  } catch (error) {
    sendError(error)
    throw new Error('Error while creating audit status.')
  }
}

export async function getAuditStatusById(id: number) {
  return await prisma.auditStatus.findUnique({
    where: { id },
    include: { auditRules: true },
  })
}

export async function updateAuditStatusById(
  id: number,
  data: IAuditStatusManipulator,
) {
  try {
    // Update the status name if provided
    await prisma.auditStatus.update({
      where: { id },
      data: {
        name: data.name,
      },
    })

    // If rules are provided, replace the existing ones
    if (data.auditRules) {
      // Delete all existing rules for this status
      await prisma.auditRules.deleteMany({
        where: { statusId: id },
      })
      // Create new rules
      await prisma.auditRules.createMany({
        data: data.auditRules.map((rule) => ({
          ...rule,
          statusId: id,
        })),
      })
    }

    // Return the updated status including its rules
    return await prisma.auditStatus.findUnique({
      where: { id },
      include: { auditRules: true },
    })
  } catch (error) {
    sendError(error)
    throw new Error('Error while updating audit status.')
  }
}

export async function deleteAuditStatusById(id: number) {
  try {
    return await prisma.auditStatus.delete({
      where: { id },
    })
  } catch (error) {
    sendError(error)
    throw new Error('Error while deleting audit status.')
  }
}
