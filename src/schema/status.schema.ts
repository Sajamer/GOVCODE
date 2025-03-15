import { z } from 'zod'

const { object, string, array } = z

export const statusSchema = object({
  name: string(),
  rules: array(
    object({
      min: string(),
      max: string(),
      color: string(),
    }),
  ),
})

export type IStatusManipulator = z.infer<typeof statusSchema>
