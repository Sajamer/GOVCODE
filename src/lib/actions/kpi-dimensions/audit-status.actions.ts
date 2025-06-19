'use server' // This directive is required for Next.js server actions

import prisma from '@/lib/db_connection'
import { sendError } from '@/lib/utils'
import { IAuditStatusManipulator } from '@/schema/kpi-dimensions/audit-status.schema'

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
    // Validate that the audit status exists
    const existingStatus = await prisma.auditStatus.findUnique({
      where: { id },
    })

    if (!existingStatus) {
      throw new Error(`Audit status with id ${id} not found`)
    }

    // Validate the data
    if (!data.name || data.name.trim() === '') {
      throw new Error('Status name is required')
    }
    if (!data.auditRules || data.auditRules.length === 0) {
      throw new Error('At least one audit rule is required')
    } // Use a transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Update the status name
      const updatedStatus = await tx.auditStatus.update({
        where: { id },
        data: {
          name: data.name.trim(),
        },
      })

      // Get existing audit rules for this status
      const existingRules = await tx.auditRules.findMany({
        where: { statusId: id },
      })

      // Check if any existing rules are referenced by audit details
      const rulesInUse = await tx.auditDetails.findMany({
        where: {
          auditRuleId: {
            in: existingRules.map((rule) => rule.id),
          },
        },
        select: { auditRuleId: true },
      })

      const usedRuleIds = new Set(
        rulesInUse.map((detail) => detail.auditRuleId),
      )

      // Delete only rules that are not referenced by audit details
      const rulesToDelete = existingRules.filter(
        (rule) => !usedRuleIds.has(rule.id),
      )

      if (rulesToDelete.length > 0) {
        await tx.auditRules.deleteMany({
          where: {
            id: {
              in: rulesToDelete.map((rule) => rule.id),
            },
          },
        })
      } // For rules that are in use, we'll update them instead of deleting
      const newRules = []

      // Handle updating existing rules and creating new ones
      for (let i = 0; i < data.auditRules.length; i++) {
        const ruleData = data.auditRules[i]
        const existingRule = existingRules[i] // Try to reuse existing rule at same index

        if (existingRule && usedRuleIds.has(existingRule.id)) {
          // Update existing rule that's in use
          const updatedRule = await tx.auditRules.update({
            where: { id: existingRule.id },
            data: {
              label: ruleData.label.trim(),
              color: ruleData.color,
            },
          })
          newRules.push(updatedRule)
        } else {
          // Create new rule
          const newRule = await tx.auditRules.create({
            data: {
              label: ruleData.label.trim(),
              color: ruleData.color,
              statusId: id,
            },
          })
          newRules.push(newRule)
        }
      }

      // Return the updated status with the new rules
      return {
        ...updatedStatus,
        auditRules: newRules,
      }
    })

    if (!result) {
      throw new Error('Failed to update audit status - no data returned')
    }

    return result
  } catch (error) {
    sendError(error)
    throw new Error(
      `Error while updating audit status: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
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
