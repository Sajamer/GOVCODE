'use server'

import prisma from '@/lib/db_connection'
import { IKpiManipulator, IKpiTargetManipulator } from '@/types/kpi'
import { userRole } from '@prisma/client'
import { sendError } from '../utils'

export const getAllKPI = async (
  role: userRole,
  organizationId?: number,
  departmentId?: number,
  // page: number = 1,
  // limit: number = 10,
) => {
  try {
    let whereCondition = {}

    switch (role) {
      case 'superAdmin':
        if (organizationId) {
          whereCondition = {
            department: {
              organizationId,
            },
          }
        }
        break

      case 'moderator':
      case 'userOrganization':
        if (!organizationId) {
          throw new Error(
            'Organization ID required for moderator or userOrganization',
          )
        }
        whereCondition = {
          department: {
            organizationId,
          },
        }
        break

      case 'contributor':
      case 'userDepartment':
        if (!departmentId) {
          throw new Error(
            'Department ID required for contributor or userDepartment',
          )
        }
        whereCondition = {
          departmentId,
        }
        break

      default:
        throw new Error('Invalid role')
    }

    // Get total count with the same conditions
    const totalCount = await prisma.kPI.count({
      where: whereCondition,
    })

    const rawKpis = await prisma.kPI.findMany({
      where: whereCondition,
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
        tasks: {
          include: {
            allocator: {
              select: {
                id: true,
                fullName: true,
                photo: true,
              },
            },
            assignees: {
              select: {
                id: true,
                fullName: true,
                photo: true,
              },
            },
          },
        },
        status: {
          select: {
            id: true,
            name: true,
            rules: true,
          },
        },
        department: {
          select: {
            name: true,
          },
        },
      },
      // skip: (page - 1) * limit,
      // take: limit,
    })

    if (!rawKpis || rawKpis.length === 0) {
      return { kpis: [], totalCount: 0 }
    }

    // Transform the data
    const kpis = rawKpis.map(
      ({
        KPICompliance,
        KPIObjective,
        KPIProcess,
        KPIActual,
        KPITarget,
        tasks,
        department,
        ...rest
      }) => ({
        ...rest,
        compliances: KPICompliance.map(({ compliance }) => compliance),
        objectives: KPIObjective.map(({ objective }) => objective),
        processes: KPIProcess.map(({ process }) => process),
        targets: KPITarget,
        actuals: KPIActual,
        tasks,
        assignTo: tasks
          .flatMap((task) =>
            task.assignees.map((assignee) => assignee.fullName),
          )
          .join(', '),
        compliance: KPICompliance.map(({ compliance }) => compliance.name).join(
          ', ',
        ),
        objective: KPIObjective.map(({ objective }) => objective.name).join(
          ', ',
        ),
        process: KPIProcess.map(({ process }) => process.name).join(', '),
        department: department.name,
        statusName: rest.status?.name,
      }),
    )

    return { kpis, totalCount }
  } catch (error) {
    console.error('Error fetching KPIs:', error)
    throw error
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
        statusId: data.statusId,
        statusType: data.statusType,
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
        statusId: data.statusId,
        statusType: data.statusType,
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

export const getKPIByIdIncludingKPIActual = async (id: number) => {
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

export const getKPIById = async (id: number) => {
  try {
    const kpi = await prisma.kPI.findUnique({
      where: { id },
      include: {
        KPITarget: true,
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

export const getKPIByIdAndYearFilter = async (id: number, year?: string) => {
  try {
    const targetYear = year ? parseInt(year) : new Date().getFullYear()

    const kpi = await prisma.kPI.findUnique({
      where: { id },
      include: {
        KPITarget: {
          where: {
            year: targetYear,
          },
        },
        KPIActual: {
          where: {
            year: targetYear,
          },
        },
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

export const getTotalKPICount = async (
  role: userRole,
  organizationId?: number,
  departmentId?: number,
) => {
  try {
    let whereCondition = {}

    switch (role) {
      case 'superAdmin':
        if (organizationId) {
          whereCondition = {
            department: {
              organizationId,
            },
          }
        }
        break

      case 'moderator':
      case 'userOrganization':
        if (!organizationId) {
          throw new Error(
            'Organization ID required for moderator or userOrganization',
          )
        }
        whereCondition = {
          department: {
            organizationId,
          },
        }
        break

      case 'contributor':
      case 'userDepartment':
        if (!departmentId) {
          throw new Error(
            'Department ID required for contributor or userDepartment',
          )
        }
        whereCondition = {
          departmentId,
        }
        break

      default:
        throw new Error('Invalid role')
    }

    const count = await prisma.kPI.count({
      where: whereCondition,
    })

    return count
  } catch (error) {
    console.error('Error counting KPIs:', error)
    throw error
  }
}
