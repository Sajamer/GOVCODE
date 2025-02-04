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
        status: dto.status,
        priority: dto.priority,
        kpiId: dto.kpiId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        comment: dto.comment,
        allocatorId: dto.allocatorId,
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
