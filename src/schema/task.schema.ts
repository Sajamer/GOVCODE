import { Priority, TaskType } from '@prisma/client'
import { boolean, z } from 'zod'

const { object, string, number, array, date, nativeEnum } = z

export const taskSchema = object({
  name: string(),
  description: string().optional(),
  priority: nativeEnum(Priority).default(Priority.LOW),
  type: nativeEnum(TaskType).default(TaskType.KPI_RELATED),
  note: string().optional(),
  startDate: date(),
  dueDate: date(),
  actualEndDate: date().nullable(),
  isArchived: boolean().default(false),
  percentDone: number().default(0),
  reason: string().optional(),
  comment: string().optional(),
  statusId: number(),
  allocatorId: string(),
  kpiId: number().nullable(),
  auditDetailId: string().optional(),
  assignees: array(string()),
})

export type ITaskManagementManipulator = z.infer<typeof taskSchema>
