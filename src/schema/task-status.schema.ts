import { z } from 'zod'

const { array, string, number } = z

const singleTaskStatusSchema = z.object({
  name: string({ required_error: 'This field is required.' })
    .min(3, {
      message: 'Be at least 3 characters long',
    })
    .max(128, { message: 'must be at most 128 characters' })
    .trim(),
  color: string({ required_error: 'This field is required.' }),
})

// Schema for bulk updates
const singleTaskStatusUpdateSchema = z.object({
  id: number().optional(), // Optional for new statuses
  name: string({ required_error: 'This field is required.' })
    .min(3, {
      message: 'Be at least 3 characters long',
    })
    .max(128, { message: 'must be at most 128 characters' })
    .trim(),
  color: string({ required_error: 'This field is required.' }),
  organizationId: number({ required_error: 'Organization ID is required.' }),
})

export const taskStatusSchema = array(singleTaskStatusSchema, {
  required_error: 'This field is required.',
}).min(1, {
  message: 'At least one field is required',
})

export const taskStatusBulkUpdateSchema = array(singleTaskStatusUpdateSchema, {
  required_error: 'This field is required.',
}).min(1, {
  message: 'At least one task status is required',
})

export type ITaskStatusManipulator = z.infer<typeof taskStatusSchema>
export type ITaskStatusBulkUpdate = z.infer<typeof taskStatusBulkUpdateSchema>
