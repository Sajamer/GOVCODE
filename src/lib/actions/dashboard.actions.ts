'use server'

import prisma from '@/lib/db_connection'
import { IDashboardManipulator } from '@/schema/dashboard.schema'
import { IScreenshotManipulation } from '@/types/dashboard'
import { sendError } from '../utils'

export const getAllDashboards = async (
  searchParams?: Record<string, string>,
) => {
  try {
    const params = searchParams || {}

    const limit = +(params?.limit ?? '10')
    const page = +(params?.page ?? '1')

    const skip = (page - 1) * limit

    const dashboards = await prisma.dashboard.findMany({
      skip,
      take: limit,
      include: {
        dashboardKPIs: true,
      },
    })

    if (!dashboards) {
      return []
    }

    return dashboards
  } catch (error) {
    sendError(error)
    throw new Error('Error while fetching dashboards.')
  }
}

export const createDashboard = async (dto: IDashboardManipulator) => {
  try {
    const newDashboard = await prisma.dashboard.create({
      data: {
        name: dto.name,
        chartType: dto.chartType,
        dashboardKPIs: {
          create: dto.dashboardKPIs.map((id) => ({
            kpi: {
              connect: { id },
            },
          })),
        },
      },
      include: {
        dashboardKPIs: true,
      },
    })

    return newDashboard
  } catch (error) {
    sendError(error)
    throw new Error('Error while creating dashboard.')
  }
}

export const updateDashboardById = async (
  id: number,
  dto: IDashboardManipulator,
) => {
  try {
    const updateDashboard = await prisma.dashboard.update({
      where: { id },
      data: {
        name: dto.name,
        chartType: dto.chartType,
        dashboardKPIs: {
          deleteMany: {},
          create: dto.dashboardKPIs.map((id) => ({
            kpi: {
              connect: { id },
            },
          })),
        },
      },
      include: {
        dashboardKPIs: true,
      },
    })

    return updateDashboard
  } catch (error) {
    sendError(error)
    throw new Error('Error while updating dashboard.')
  }
}

export const deleteDashboard = async (id: number) => {
  try {
    const deletedDashboard = await prisma.dashboard.delete({
      where: { id },
    })

    return deletedDashboard
  } catch (error) {
    sendError(error)
    throw new Error('Error while deleting dashboard.')
  }
}

export const getDashboardById = async (id: number, selectedYear?: string) => {
  try {
    const yearFilter = selectedYear ? parseInt(selectedYear) : undefined

    const rawDashboard = await prisma.dashboard.findUnique({
      where: { id },
      include: {
        dashboardKPIs: {
          include: {
            kpi: {
              include: {
                KPITarget: {
                  where: yearFilter ? { year: yearFilter } : {},
                },
                KPIActual: {
                  where: yearFilter ? { year: yearFilter } : {},
                },
              },
            },
          },
        },
      },
    })

    if (!rawDashboard) {
      throw new Error('Dashboard not found')
    }

    const dashboard = {
      id: rawDashboard.id,
      name: rawDashboard.name,
      chartType: rawDashboard.chartType,
      dashboardKPIs: rawDashboard.dashboardKPIs.map((row) => ({
        id: row.id,
        dashboardId: row.dashboardId,
        kpiId: row.kpiId,
        kpi: {
          id: row.kpi.id,
          name: row.kpi.name,
          code: row.kpi.code,
          description: row.kpi.description,
          isArchived: row.kpi.isArchived,
          unit: row.kpi.unit,
          frequency: row.kpi.frequency,
          targets: row.kpi.KPITarget,
          actuals: row.kpi.KPIActual,
        },
      })),
    }
    return dashboard
  } catch (error) {
    sendError(error)
    throw new Error('Error while fetching dashboard.')
  }
}

export const createScreenshot = async (dto: IScreenshotManipulation) => {
  try {
    const newScreenshot = await prisma.screenshot.create({
      data: {
        image: dto.image,
        hash: dto.hash,
        user: {
          connect: { id: dto.userId },
        },
        dashboard: {
          connect: { id: dto.dashboardId },
        },
      },
    })

    return newScreenshot
  } catch (error) {
    sendError(error)
    throw new Error('Error while creating screenshot.')
  }
}

export const checkScreenshotIfExists = async (hash: string) => {
  try {
    const screenshot = await prisma.screenshot.findUnique({
      where: { hash },
    })

    return screenshot
  } catch (error) {
    sendError(error)
    throw new Error('Error while checking screenshot.')
  }
}
