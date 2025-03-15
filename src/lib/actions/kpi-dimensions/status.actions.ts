'use server' // This directive is required for Next.js server actions

import prisma from '@/lib/db_connection'
import { sendError } from '@/lib/utils'
import { IStatusManipulator } from '@/schema/status.schema'

export async function getAllStatuses() {
  try {
    const statusData = await prisma.status.findMany({
      include: { rules: true },
    })

    if (!statusData) {
      return []
    }

    return statusData
  } catch (error) {
    sendError(error)
    throw new Error('Error while fetching statuses.')
  }
}

export async function createStatus(data: IStatusManipulator) {
  try {
    const newStatus = await prisma.status.create({
      data: {
        name: data.name,
        rules: {
          create: data.rules,
        },
      },
      include: { rules: true },
    })
    return newStatus
  } catch (error) {
    sendError(error)
    throw new Error('Error while creating status.')
  }
}

export async function getStatusById(id: number) {
  return await prisma.status.findUnique({
    where: { id },
    include: { rules: true },
  })
}

export async function updateStatusById(id: number, data: IStatusManipulator) {
  try {
    // Update the status name if provided
    await prisma.status.update({
      where: { id },
      data: {
        name: data.name,
      },
    })

    // If rules are provided, replace the existing ones
    if (data.rules) {
      // Delete all existing rules for this status
      await prisma.rule.deleteMany({
        where: { statusId: id },
      })
      // Create new rules
      await prisma.rule.createMany({
        data: data.rules.map((rule) => ({
          ...rule,
          statusId: id,
        })),
      })
    }

    // Return the updated status including its rules
    return await prisma.status.findUnique({
      where: { id },
      include: { rules: true },
    })
  } catch (error) {
    sendError(error)
    throw new Error('Error while updating status.')
  }
}

export async function deleteStatusById(id: number) {
  try {
    // Delete related rules first (if cascade delete isn’t configured)
    // await prisma.rule.deleteMany({
    //   where: { statusId: id },
    // })

    // Delete the status
    return await prisma.status.delete({
      where: { id },
    })
  } catch (error) {
    sendError(error)
    throw new Error('Error while deleting status.')
  }
}
