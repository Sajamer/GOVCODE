import {
  ChartTypes,
  Frequency,
  KPIActual,
  KPITarget,
  Units,
} from '@prisma/client'

interface IDashboardKPI {
  id: number
  dashboardId: number
  kpiId: number
}

export interface IDashboardResponse {
  id: number
  name: string
  chartType: ChartTypes
  dashboardKPIs: IDashboardKPI[]
}

export interface IDashboardKPIs {
  id: number
  code: string
  name: string
  description: string
  unit: Units
  frequency: Frequency
  isArchived: boolean
  targets: KPITarget[]
  actuals: KPIActual[]
}
interface IDashboardKPIWithKPIs extends IDashboardKPI {
  kpi: IDashboardKPIs
}

export interface ISingleDashboardResponse extends IDashboardResponse {
  dashboardKPIs: IDashboardKPIWithKPIs[]
}

export interface IScreenshotManipulation {
  userId: string
  image: string
  hash: string
  dashboardId: number
}
