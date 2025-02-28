'use server'

import prisma from '@/lib/db_connection'
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
