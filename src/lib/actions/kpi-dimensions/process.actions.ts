'use server' // This directive is required for Next.js server actions

import prisma from '@/lib/db_connection'
import { sendError } from '@/lib/utils'
import { IKpiDimensionManipulator } from '@/schema/kpi-dimensions/kpi-dimensions.schema'

export async function getAllProcesses() {
  try {
    const processData = await prisma.process.findMany()
    if (!processData) {
      return []
    }
    return processData
  } catch (error) {
    sendError(error)
    throw new Error('Error while fetching processes.')
  }
}

export async function createProcess(data: IKpiDimensionManipulator) {
  try {
    const newProcess = await prisma.process.create({
      data: {
        name: data.name,
      },
    })
    return newProcess
  } catch (error) {
    sendError(error)
    throw new Error('Error while creating process.')
  }
}

export async function getProcessById(id: number) {
  return await prisma.process.findUnique({
    where: { id },
  })
}

export async function updateProcessById(
  id: number,
  data: IKpiDimensionManipulator,
) {
  try {
    return await prisma.process.update({
      where: { id },
      data: {
        name: data.name,
      },
    })
  } catch (error) {
    sendError(error)
    throw new Error('Error while updating process.')
  }
}

export async function deleteProcessById(id: number) {
  try {
    await prisma.process.delete({
      where: { id },
    })
  } catch (error) {
    sendError(error)
    throw new Error('Error while deleting process.')
  }
}
