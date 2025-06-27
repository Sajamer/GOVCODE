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

    const skip = (page - 1) * limit

    const rawOrganizations = await prisma.organization.findMany({
      skip,
      take: limit,
    })

    return (rawOrganizations as IOrganization[]) || []
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
        taskStatus: true,
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
    const { departments, ...organizationData } = dto

    const updatedOrganization = await prisma.organization.update({
      where: {
        id,
      },
      data: {
        ...organizationData,
        // If `departments` exists, update them as well
        departments: departments
          ? {
              upsert: departments.map((department) => ({
                where: { id: department.id || 0 }, // Use the department ID if it exists
                update: {
                  name: department.name,
                  description: department.description || null,
                },
                create: {
                  name: department.name,
                  description: department.description || null,
                },
              })),
            }
          : undefined,
        // If `taskStatus` exists, update them as well
        taskStatus: dto.taskStatus
          ? {
              upsert: dto.taskStatus.map((status) => ({
                where: { id: status.id || 0 }, // Use the status ID if it exists
                update: {
                  name: status.name,
                  color: status.color,
                },
                create: {
                  name: status.name,
                  color: status.color,
                },
              })),
            }
          : undefined,
      },
      include: {
        departments: true,
      },
    })

    return updatedOrganization
  } catch (error) {
    sendError(error)
    throw new Error('Error while updating organization and departments.')
  }
}

export const createOrganization = async (dto: IOrganizationManipulator) => {
  try {
    const { departments, taskStatus, ...organizationData } = dto

    const organization = await prisma.organization.create({
      data: {
        ...organizationData,
        departments: {
          create: departments || [],
        },
        taskStatus: {
          create: taskStatus || [],
        },
      },
      include: {
        departments: true,
        taskStatus: true,
      },
    })

    return organization
  } catch (error) {
    sendError(error)
    throw new Error('Error while creating organization.')
  }
}
