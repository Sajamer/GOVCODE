'use server'

import prisma from '@/lib/db_connection'
import { ITaskStatusBulkUpdate } from '@/schema/task-status.schema'
import { sendError } from '../utils'

export const getAllStatusByOrganizationId = async (organizationId: number) => {
  try {
    const statuses = await prisma.taskStatus.findMany({
      where: { organizationId },
    })

    return statuses
  } catch (error) {
    sendError(error)
    throw new Error('Error while fetching statuses.')
  }
}

export const createTaskStatus = async (
  name: string,
  color: string,
  organizationId: number,
) => {
  try {
    const newStatus = await prisma.taskStatus.create({
      data: {
        name,
        color,
        organizationId,
      },
    })

    return newStatus
  } catch (error) {
    sendError(error)
    throw new Error('Error while creating task status.')
  }
}

export const updateMultipleTaskStatuses = async (
  taskStatuses: ITaskStatusBulkUpdate,
  organizationId: number,
) => {
  try {
    // Get current statuses from database
    const currentStatuses = await prisma.taskStatus.findMany({
      where: { organizationId },
    })

    // Separate new statuses (no id or id = 0) from existing ones
    const newStatuses = taskStatuses.filter(
      (status) => !status.id || status.id === 0,
    )
    const existingStatuses = taskStatuses.filter(
      (status) => status.id && status.id !== 0,
    )

    // Find statuses to delete (exist in DB but not in the form submission)
    const submittedIds = existingStatuses.map((s) => s.id!).filter(Boolean)
    const statusesToDelete = currentStatuses.filter(
      (s) => !submittedIds.includes(s.id),
    )

    const operations = []

    // Delete removed statuses
    if (statusesToDelete.length > 0) {
      operations.push(
        ...statusesToDelete.map((status) =>
          prisma.taskStatus.delete({
            where: {
              id: status.id,
              organizationId,
            },
          }),
        ),
      )
    }

    // Create new statuses
    if (newStatuses.length > 0) {
      operations.push(
        ...newStatuses.map((status) =>
          prisma.taskStatus.create({
            data: {
              name: status.name,
              color: status.color,
              organizationId: status.organizationId,
            },
          }),
        ),
      )
    }

    // Update existing statuses
    if (existingStatuses.length > 0) {
      operations.push(
        ...existingStatuses.map((status) =>
          prisma.taskStatus.update({
            where: {
              id: status.id!,
              organizationId: status.organizationId,
            },
            data: {
              name: status.name,
              color: status.color,
            },
          }),
        ),
      )
    }

    // Execute all operations in a transaction
    await prisma.$transaction(operations)

    // Return updated list of all statuses for this organization
    const updatedStatuses = await prisma.taskStatus.findMany({
      where: { organizationId },
    })

    return updatedStatuses
  } catch (error) {
    sendError(error)
    throw new Error('Error while updating task statuses.')
  }
}

export const deleteTaskStatus = async (id: number, organizationId: number) => {
  try {
    const deletedStatus = await prisma.taskStatus.delete({
      where: {
        id,
        organizationId,
      },
    })

    return deletedStatus
  } catch (error) {
    sendError(error)
    throw new Error('Error while deleting task status.')
  }
}
