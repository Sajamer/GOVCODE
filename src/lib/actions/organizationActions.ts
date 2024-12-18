'use server'

import prisma from '@/lib/db_connection'
import { sendError } from '../utils'

export const getAllOrganizations = async (
  searchParams?: Record<string, string>,
) => {
  try {
    const params = searchParams || {}

    const limit = +(params?.limit ?? '10')
    const page = +(params?.page ?? '1')

    // we need to use skip and take in prisma to get the data

    const skip = (page - 1) * limit

    const rawOrganizations = await prisma.organization.findMany({
      skip,
      take: limit,
    })

    if (!rawOrganizations) {
      return []
    }

    return rawOrganizations
  } catch (error) {
    sendError(error)
    throw new Error('Error while fetching organizations.')
  }
}

export const getOrganizationById = async (id: number) => {
  try {
    const organization = await prisma.organization.findUnique({
      where: {
        id,
      },
      include: {
        departments: true,
      },
    })

    if (!organization) {
      throw new Error('Organization not found.')
    }

    return organization
  } catch (error) {
    sendError(error)
    throw new Error('Error while fetching organization by ID.')
  }
}

export const updateOrganizationById = async (
  id: number,
  dto: IOrganizationManipulator,
) => {
  try {
    const organization = await prisma.organization.update({
      where: {
        id,
      },
      data: {
        ...dto,
      },
    })

    return organization
  } catch (error) {
    sendError(error)
    throw new Error('Error while updating organization.')
  }
}
