'use server'

import prisma from '@/lib/db_connection'
import { sendError } from '../utils'

export const getDepartmentsByOrganizationId = async (id: number) => {
  try {
    const departments = await prisma.department.findMany({
      where: {
        organizationId: id,
      },
    })

    if (!departments) {
      return []
    }

    return departments
  } catch (error) {
    sendError(error)
    throw new Error('Error while fetching organization by ID.')
  }
}
