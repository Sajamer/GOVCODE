'use server'

import prisma from '@/lib/db_connection'
import { IKpiManipulator, IKpiTargetManipulator } from '@/types/kpi'
import { sendError } from '../utils'

export const getAllKPI = async (searchParams?: Record<string, string>) => {
  try {
    const params = searchParams || {}

    const limit = +(params?.limit ?? '10')
    const page = +(params?.page ?? '1')

    // we need to use skip and take in prisma to get the data

    const skip = (page - 1) * limit

    const rawKpis = await prisma.kPI.findMany({
      skip,
      take: limit,
      include: {
        KPITarget: true,
        KPIActual: true,
        KPICompliance: {
          select: {
            compliance: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        KPIObjective: {
          select: {
            objective: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        KPIProcess: {
          select: {
            process: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    if (!rawKpis) {
      return []
    }

    // Transform the data
    const kpis = rawKpis.map(
      ({
        KPICompliance,
        KPIObjective,
        KPIProcess,
        KPIActual,
        KPITarget,
        ...rest
      }) => ({
        ...rest,
        compliances: KPICompliance.map(({ compliance }) => compliance),
        objectives: KPIObjective.map(({ objective }) => objective),
        processes: KPIProcess.map(({ process }) => process),
        targets: KPITarget,
        actualTargets: KPIActual,
      }),
    )

    return kpis ?? []
  } catch (error) {
    console.error('Error fetching KPIs:', error)
    sendError(error)
    throw new Error('Error fetching KPIs')
  }
}

export const createKPI = async (data: IKpiManipulator) => {
  try {
    const newKPI = await prisma.kPI.create({
      data: {
        name: data.name,
        code: data.code,
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
        KPICompliance: {
          create: data.compliances.map((id) => ({
            compliance: {
              connect: { id },
            },
          })),
        },
        KPIObjective: {
          create: data.objectives.map((id) => ({
            objective: {
              connect: { id },
            },
          })),
        },
        KPIProcess: {
          create: data.processes.map((id) => ({
            process: {
              connect: { id },
            },
          })),
        },
      },
    })
    return newKPI
  } catch (error) {
    sendError(error)
    console.error('Error creating KPI:', error)
    throw new Error('Error creating KPI')
  }
}

export const updateKPI = async (id: number, data: IKpiManipulator) => {
  try {
    const updatedKPI = await prisma.kPI.update({
      where: { id },
      data: {
        name: data.name,
        code: data.code,
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
        KPICompliance: {
          deleteMany: {},
          create: data.compliances.map((id) => ({
            compliance: {
              connect: { id },
            },
          })),
        },
        KPIObjective: {
          deleteMany: {},
          create: data.objectives.map((id) => ({
            objective: {
              connect: { id },
            },
          })),
        },
        KPIProcess: {
          deleteMany: {},
          create: data.processes.map((id) => ({
            process: {
              connect: { id },
            },
          })),
        },
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

export const getKPIByIdIncludingKPITarget = async (id: number) => {
  try {
    const kpi = await prisma.kPI.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        code: true,
        unit: true,
        frequency: true,
        KPITarget: true,
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

export const saveKPITargets = async (targets: IKpiTargetManipulator[]) => {
  try {
    for (const target of targets) {
      await prisma.kPITarget.upsert({
        where: {
          // Ensure the combination of `kpiId`, `year`, and `period` is unique
          kpiId_year_period: {
            kpiId: target.kpiId,
            year: target.year,
            period: target.period,
          },
        },
        update: {
          // Update the target value if the record exists
          targetValue: target.targetValue,
        },
        create: {
          // Create a new record if it doesn't exist
          kpiId: target.kpiId,
          year: target.year,
          period: target.period,
          targetValue: target.targetValue,
        },
      })
    }
  } catch (error) {
    console.error('Error saving KPI targets:', error)
    throw new Error('Failed to save KPI targets')
  }
}

export const getKPIByIdIncludingKPIActualTargets = async (id: number) => {
  try {
    const kpi = await prisma.kPI.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        code: true,
        unit: true,
        frequency: true,
        KPIActual: true,
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

export const saveKPIActualTarget = async (
  actualTargets: IKpiTargetManipulator[],
) => {
  try {
    for (const actual of actualTargets) {
      await prisma.kPIActual.upsert({
        where: {
          // Ensure the combination of `kpiId`, `year`, and `period` is unique
          kpiId_year_period: {
            kpiId: actual.kpiId,
            year: actual.year,
            period: actual.period,
          },
        },
        update: {
          // Update the actual value if the record exists
          targetValue: actual.targetValue,
        },
        create: {
          // Create a new record if it doesn't exist
          kpiId: actual.kpiId,
          year: actual.year,
          period: actual.period,
          targetValue: actual.targetValue,
        },
      })
    }
  } catch (error) {
    console.error('Error saving KPI actual targets:', error)
    throw new Error('Failed to save KPI actual targets')
  }
}
