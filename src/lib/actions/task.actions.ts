'use server'

import prisma from '@/lib/db_connection'
import { ITaskManagementManipulator } from '@/schema/task.schema'
import { sendError } from '../utils'

export const getAllTasks = async (
  searchParams?: Record<string, string>,
  userId?: string,
) => {
  try {
    if (!userId) throw new Error('User ID is required.')

    const params = searchParams || {}

    const limit = +(params?.limit ?? '10')
    const page = +(params?.page ?? '1')

    const skip = (page - 1) * limit

    const tasksData = await prisma.taskManagement.findMany({
      // where: {
      //   isArchived: false,
      //   assignees: {
      //     some: {
      //       id: userId, // Filter tasks assigned to the current user
      //     },
      //   },
      // },
      skip,
      take: limit,
      include: {
        assignees: {
          select: {
            id: true,
          },
        },
        status: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!tasksData) {
      return []
    }

    // Transform the results to have status as a string
    const tasks = tasksData.map((task) => ({
      ...task,
      status: task.status.name, // Convert status object to string
    }))

    return tasks
  } catch (error) {
    sendError(error)
    throw new Error('Error while fetching tasks.')
  }
}

export const createTask = async (dto: ITaskManagementManipulator) => {
  try {
    // Use transaction to ensure both task and history records are created
    const newTask = await prisma.$transaction(async (tx) => {
      // Create the task first
      const task = await tx.taskManagement.create({
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
          lastAssigneeId: dto.allocatorId,
          assignees: {
            connect: dto.assignees.map((id) => ({ id })),
          },
        },
      })

      // Create task history records for each assignee
      await Promise.all(
        dto.assignees.map((assigneeId) =>
          tx.taskHistory.create({
            data: {
              taskId: task.id,
              assignedById: dto.allocatorId,
              assignedToId: assigneeId,
            },
          }),
        ),
      )

      return task
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
    // Use transaction to handle both task update and history records
    const updatedTask = await prisma.$transaction(async (tx) => {
      // Get current task data to compare assignees
      const currentTask = await tx.taskManagement.findUnique({
        where: { id },
        include: {
          assignees: {
            select: { id: true },
          },
        },
      })

      if (!currentTask) {
        throw new Error('Task not found')
      }

      // Get current assignee IDs
      const currentAssigneeIds = currentTask.assignees.map((a) => a.id)

      // Find new assignees that weren't previously assigned
      const newAssignees = dto.assignees.filter(
        (assigneeId) => !currentAssigneeIds.includes(assigneeId),
      )

      // Update the task
      const task = await tx.taskManagement.update({
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
          lastAssigneeId: dto.assignees[dto.assignees.length - 1], // Update last assignee
          assignees: {
            set: dto.assignees.map((id) => ({ id })),
          },
        },
      })

      // Create history records for new assignees
      if (newAssignees.length > 0) {
        await Promise.all(
          newAssignees.map((assigneeId) =>
            tx.taskHistory.create({
              data: {
                taskId: id,
                assignedById: dto.allocatorId,
                assignedToId: assigneeId,
              },
            }),
          ),
        )
      }

      return task
    })

    return updatedTask
  } catch (error) {
    sendError(error)
    throw new Error('Error while updating task.')
  }
}

export const archiveTask = async (id: number) => {
  try {
    const archivedTask = await prisma.taskManagement.update({
      where: { id },
      data: {
        isArchived: true,
      },
    })

    return archivedTask
  } catch (error) {
    sendError(error)
    throw new Error('Error while archiving task.')
  }
}

export const restoreTask = async (id: number) => {
  try {
    const restoredTask = await prisma.taskManagement.update({
      where: { id },
      data: {
        isArchived: false,
      },
    })

    return restoredTask
  } catch (error) {
    sendError(error)
    throw new Error('Error while restoring task.')
  }
}

export const deleteTaskById = async (id: number) => {
  try {
    // Use transaction to ensure all related records are deleted
    const deletedTask = await prisma.$transaction(async (tx) => {
      // Delete task history records first
      await tx.taskHistory.deleteMany({
        where: { taskId: id },
      })

      // Delete the task (this will automatically handle the many-to-many relationships)
      const task = await tx.taskManagement.delete({
        where: { id },
      })

      return task
    })

    return deletedTask
  } catch (error) {
    sendError(error)
    throw new Error('Error while deleting task.')
  }
}
