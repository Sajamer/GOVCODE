/* eslint-disable @typescript-eslint/no-explicit-any */
import { Priority } from '@prisma/client'

export interface ITasksManagementResponse {
  id: number
  name: string
  description: string | null
  priority: Priority
  note: string | null
  startDate: Date
  dueDate: Date
  actualEndDate: Date | null
  isArchived: boolean
  percentDone: number
  reason: string | null
  comment: string | null
  createdAt: Date
  updatedAt: Date
  statusId: number
  allocatorId: string
  kpiId: number | null
  lastAssigneeId: string | null
  auditCycleCaseId: number | null
  status: string
  assignees: {
    id: string
  }[]

  [key: string]: any
}
export interface ITaskStatus {
  id: number
  name: string
  color: string
  organizationId: number
}
