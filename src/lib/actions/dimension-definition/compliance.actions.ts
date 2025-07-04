'use server' // This directive is required for Next.js server actions

import prisma from '@/lib/db_connection'
import { sendError } from '@/lib/utils'
import { IKpiDimensionManipulator } from '@/schema/dimension-definition/kpi-dimensions.schema'

export async function getAllCompliances() {
  try {
    const complianceData = await prisma.compliance.findMany()
    if (!complianceData) {
      return []
    }
    return complianceData
  } catch (error) {
    sendError(error)
    throw new Error('Error while fetching compliances.')
  }
}

export async function createCompliance(data: IKpiDimensionManipulator) {
  try {
    const newCompliance = await prisma.compliance.create({
      data: {
        name: data.name,
      },
    })
    return newCompliance
  } catch (error) {
    sendError(error)
    throw new Error('Error while creating compliance.')
  }
}

export async function getComplianceById(id: number) {
  return await prisma.compliance.findUnique({
    where: { id },
  })
}

export async function updateComplianceById(
  id: number,
  data: IKpiDimensionManipulator,
) {
  try {
    return await prisma.compliance.update({
      where: { id },
      data: {
        name: data.name,
      },
    })
  } catch (error) {
    sendError(error)
    throw new Error('Error while updating compliance.')
  }
}

export async function deleteComplianceById(id: number) {
  try {
    await prisma.compliance.delete({
      where: { id },
    })
  } catch (error) {
    sendError(error)
    throw new Error('Error while deleting compliance.')
  }
}
