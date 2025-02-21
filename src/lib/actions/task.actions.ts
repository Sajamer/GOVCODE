'use server'

import prisma from '@/lib/db_connection'
import { ITaskManagementManipulator } from '@/schema/task.schema'
import { sendError } from '../utils'

export const getAllTasks = async (searchParams?: Record<string, string>) => {
  try {
    const params = searchParams || {}

    const limit = +(params?.limit ?? '10')
    const page = +(params?.page ?? '1')

    const skip = (page - 1) * limit

    const tasks = await prisma.taskManagement.findMany({
      skip,
      take: limit,
      include: {
        assignees: {
          select: {
            id: true,
          },
        },
      },
    })

    if (!tasks) {
      return []
    }

    return tasks
  } catch (error) {
    sendError(error)
    throw new Error('Error while fetching tasks.')
  }
}

export const createTask = async (dto: ITaskManagementManipulator) => {
  try {
    const newTask = await prisma.taskManagement.create({
      data: {
        name: dto.name,
        description: dto.description,
        priority: dto.priority,
        note: dto.note,
        startDate: new Date(dto.startDate),
        dueDate: new Date(dto.dueDate),
        actualEndDate: dto.actualEndDate ? new Date(dto.actualEndDate) : null,
        isArchived: dto.isArchived,
        percentDone: dto.percentDone,
        reason: dto.reason,
        comment: dto.comment,
        statusId: dto.statusId,
        allocatorId: dto.allocatorId,
        kpiId: dto.kpiId,
        auditCycleCaseId: dto.auditCycleCaseId,
        assignees: {
          connect: dto.assignees.map((id) => ({ id })),
        },
      },
    })
    return newTask
  } catch (error) {
    sendError(error)
    throw new Error('Error while creating task.')
  }
}

export const updateTaskById = async (
  id: number,
  dto: ITaskManagementManipulator,
) => {
  try {
    const updatedTask = await prisma.taskManagement.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        priority: dto.priority,
        note: dto.note,
        startDate: new Date(dto.startDate),
        dueDate: new Date(dto.dueDate),
        actualEndDate: dto.actualEndDate ? new Date(dto.actualEndDate) : null,
        isArchived: dto.isArchived,
        percentDone: dto.percentDone,
        reason: dto.reason,
        comment: dto.comment,
        statusId: dto.statusId,
        allocatorId: dto.allocatorId,
        kpiId: dto.kpiId,
        auditCycleCaseId: dto.auditCycleCaseId,
        assignees: {
          set: dto.assignees.map((id) => ({ id })),
        },
      },
    })

    return updatedTask
  } catch (error) {
    sendError(error)
    throw new Error('Error while updating task.')
  }
}
