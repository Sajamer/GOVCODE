'use server'

import prisma from '@/lib/db_connection'
import { Calibration, Frequency, KPIType, Units } from '@prisma/client'
import { sendError } from '../utils'

interface KPIData {
  name: string
  description: string
  owner: string
  measurementNumerator?: string
  measurementDenominator?: string
  measurementNumber?: string
  resources?: string
  unit: Units
  frequency: Frequency
  type: KPIType
  calibration: Calibration
  departmentId: number
}

export const getAllKPI = async (searchParams: Record<string, string>) => {
  try {
    const params = searchParams

    const department = 18 // this needs to be a property in user.
    const limit = +(params.limit ?? '10')
    const page = +(params.page ?? '1')

    // we need to use skip and take in prisma to get the data

    const skip = (page - 1) * limit

    const kpis = await prisma.kPI.findMany({
      where: {
        departmentId: department,
      },
      skip,
      take: limit,
    })
    return kpis
  } catch (error) {
    console.error('Error fetching KPIs:', error)
    sendError(error)
    throw new Error('Error fetching KPIs')
  }
}

export const createKPI = async (data: KPIData) => {
  try {
    const newKPI = await prisma.kPI.create({
      data: {
        name: data.name,
        description: data.description,
        owner: data.owner,
        measurementNumerator: data.measurementNumerator,
        measurementDenominator: data.measurementDenominator,
        measurementNumber: data.measurementNumber,
        resources: data.resources,
        unit: data.unit,
        frequency: data.frequency,
        type: data.type,
        calibration: data.calibration,
        departmentId: data.departmentId,
      },
    })
    return newKPI
  } catch (error) {
    console.error('Error creating KPI:', error)
    sendError(error)
    throw new Error('Error creating KPI')
  }
}

export const updateKPI = async (id: number, data: KPIData) => {
  try {
    const updatedKPI = await prisma.kPI.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        owner: data.owner,
        measurementNumerator: data.measurementNumerator,
        measurementDenominator: data.measurementDenominator,
        measurementNumber: data.measurementNumber,
        resources: data.resources,
        unit: data.unit,
        frequency: data.frequency,
        type: data.type,
        calibration: data.calibration,
        departmentId: data.departmentId,
      },
    })
    return updatedKPI
  } catch (error) {
    console.error('Error updating KPI:', error)
    sendError(error)
    throw new Error('Error updating KPI')
  }
}

export const deleteKPI = async (id: number) => {
  try {
    const deletedKPI = await prisma.kPI.delete({
      where: { id },
    })
    return deletedKPI
  } catch (error) {
    console.error('Error deleting KPI:', error)
    sendError(error)
    throw new Error('Error deleting KPI')
  }
}

export const getKPIById = async (id: number) => {
  try {
    const kpi = await prisma.kPI.findUnique({
      where: { id },
      include: {
        department: true,
        KPIObjective: true,
        KPICompliance: true,
        KPIProcess: true,
      },
    })
    if (!kpi) {
      throw new Error('KPI not found')
    }
    return kpi
  } catch (error) {
    console.error('Error fetching KPI by ID:', error)
    sendError(error)
    throw new Error('Error fetching KPI by ID')
  }
}
