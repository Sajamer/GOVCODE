import { Priority, TaskStatus } from '@prisma/client'
import { z } from 'zod'

const { object, string, number, array, nativeEnum } = z

export const taskSchema = object({
  status: nativeEnum(TaskStatus).default(TaskStatus.TODO),
  priority: nativeEnum(Priority).default(Priority.LOW),
  kpiId: number(),
  dueDate: string()
    .refine((val) => !val || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(val), {
      message: 'Invalid date format',
    })
    .optional()
    .nullable(),
  comment: string().optional(),
  allocatorId: string(),
  assignees: array(string()),
})

export type ITaskManagementManipulator = z.infer<typeof taskSchema>
