import { Priority } from '@prisma/client'
import { boolean, z } from 'zod'

const { object, string, number, array, date, nativeEnum } = z

export const taskSchema = object({
  name: string(),
  description: string().optional(),
  priority: nativeEnum(Priority).default(Priority.LOW),
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
  assignees: array(string()),
})

export type ITaskManagementManipulator = z.infer<typeof taskSchema>
