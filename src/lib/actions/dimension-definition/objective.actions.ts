'use server' // This directive is required for Next.js server actions

import prisma from '@/lib/db_connection'
import { sendError } from '@/lib/utils'
import { IKpiDimensionManipulator } from '@/schema/dimension-definition/kpi-dimensions.schema'

export async function getAllObjectives() {
  try {
    const ObjectiveData = await prisma.objective.findMany()
    if (!ObjectiveData) {
      return []
    }
    return ObjectiveData
  } catch (error) {
    sendError(error)
    throw new Error('Error while fetching objectives.')
  }
}

export async function createObjective(data: IKpiDimensionManipulator) {
  try {
    const newObjective = await prisma.objective.create({
      data: {
        name: data.name,
      },
    })
    return newObjective
  } catch (error) {
    sendError(error)
    throw new Error('Error while creating objective.')
  }
}

export async function getObjectiveById(id: number) {
  return await prisma.objective.findUnique({
    where: { id },
  })
}

export async function updateObjectiveById(
  id: number,
  data: IKpiDimensionManipulator,
) {
  try {
    return await prisma.objective.update({
      where: { id },
      data: {
        name: data.name,
      },
    })
  } catch (error) {
    sendError(error)
    throw new Error('Error while updating objective.')
  }
}

export async function deleteObjectiveById(id: number) {
  try {
    await prisma.objective.delete({
      where: { id },
    })
  } catch (error) {
    sendError(error)
    throw new Error('Error while deleting objective.')
  }
}
