'use server'

import prisma from '@/lib/db_connection'
import { IAuditFrameworkManipulator } from '@/schema/audit-framework.schema'
import { sendError } from '../utils'

export const getAllAudits = async (searchParams?: Record<string, string>) => {
  try {
    const params = searchParams || {}

    const limit = +(params?.limit ?? '10')
    const page = +(params?.page ?? '1')

    const skip = (page - 1) * limit

    const auditFrameworks = await prisma.auditCycle.findMany({
      skip,
      take: limit,
      include: {
        auditDetails: true,
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
        framework: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!auditFrameworks) {
      return []
    }

    return auditFrameworks
  } catch (error) {
    sendError(error)
    throw new Error('Error while fetching audit frameworks.')
  }
}

export const getAllAuditsByFrameworkId = async (
  frameworkId: string,
  searchParams?: Record<string, string>,
) => {
  try {
    const params = searchParams || {}

    const limit = +(params?.limit ?? '10')
    const page = +(params?.page ?? '1')

    const skip = (page - 1) * limit

    const auditFrameworks = await prisma.auditCycle.findMany({
      where: {
        frameworkId,
      },
      skip,
      take: limit,
      include: {
        auditDetails: true,
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
        framework: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!auditFrameworks) {
      return []
    }

    return auditFrameworks
  } catch (error) {
    sendError(error)
    throw new Error('Error while fetching audit frameworks by ID.')
  }
}

export const createAudit = async (dto: IAuditFrameworkManipulator) => {
  try {
    // First, verify that the user exists
    const userExists = await prisma.user.findUnique({
      where: { id: dto.auditBy },
      select: { id: true },
    })

    if (!userExists) {
      throw new Error(`User with ID ${dto.auditBy} does not exist`)
    }

    // Also verify that the framework exists
    const frameworkExists = await prisma.framework.findUnique({
      where: { id: dto.frameworkId },
      select: { id: true },
    })

    if (!frameworkExists) {
      throw new Error(`Framework with ID ${dto.frameworkId} does not exist`)
    }

    // Get the first audit rule (default status)
    const defaultAuditRule = await prisma.auditRules.findFirst({
      orderBy: { id: 'asc' },
      select: { id: true },
    })

    if (!defaultAuditRule) {
      throw new Error('No audit rules found in the system')
    }

    // Get only the leaf framework attributes (last column) for this framework
    // These are attributes that don't have any children (no other attributes have them as parent)
    const frameworkAttributes = await prisma.frameworkAttribute.findMany({
      where: {
        frameworkId: dto.frameworkId,
        // Only get attributes that are not parents (leaf nodes)
        children: {
          none: {},
        },
      },
      select: { id: true },
    })

    // Use transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Create the audit cycle
      const newAudit = await tx.auditCycle.create({
        data: {
          name: dto.name,
          startDate: dto.startDate,
          auditBy: dto.auditBy,
          description: dto.description,
          frameworkId: dto.frameworkId,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      })

      // Create audit details for each leaf framework attribute (last column only)
      if (frameworkAttributes.length > 0) {
        const auditDetailsData = frameworkAttributes.map((attr) => ({
          frameworkAttributeId: attr.id,
          auditCycleId: newAudit.id,
          auditBy: dto.auditBy, // The auditor is initially set to the creator, but can be changed later
          ownedBy: dto.auditBy, // The creator becomes the owner
          auditRuleId: defaultAuditRule.id,
          comment: null,
          recommendation: null,
        }))

        await tx.auditDetails.createMany({
          data: auditDetailsData,
        })
      }

      return newAudit
    })

    return result
  } catch (error) {
    sendError(error)
    throw new Error('Error while creating audit.')
  }
}
