/* eslint-disable @typescript-eslint/no-empty-object-type */
import {
  Calibration,
  Frequency,
  KPI,
  KPIActual,
  KPITarget,
  KPIType,
  TaskManagement,
  Units,
} from '@prisma/client'

interface IKpiTarget extends KPITarget {}
interface IKpiActualTarget extends KPIActual {}
interface ITaskManagement extends TaskManagement {}

interface ITaskUser {
  id: string
  fullName: string | null
  photo: string | null
}

interface ITaskManagementResponse extends ITaskManagement {
  assignees: ITaskUser[]
  allocator: ITaskUser
}

export type MonthlyData = Record<string, number | undefined>
export type IChartData =
  | { month: string; target: number }
  | { quarter: string; target: number }
  | { semiAnnual: string; target: number }
  | { year: string; target: number }

export type IMultipleChartData =
  | { month: string; actual: number; target: number }
  | { quarter: string; actual: number; target: number }
  | { semiAnnual: string; actual: number; target: number }
  | { year: string; actual: number; target: number }

export interface IDatabaseStaticData {
  id: number
  name: string
}

interface Ids {
  id: number
}
export interface IKpiFormDropdownData {
  objectives: IDatabaseStaticData[]
  compliances: IDatabaseStaticData[]
  processes: IDatabaseStaticData[]
}

export interface IKpiManipulator {
  code: string
  departmentId: number
  statusId: number
  name: string
  description: string
  owner: string
  measurement_equation: boolean
  measurementNumerator?: string
  measurementDenominator?: string
  measurementNumber?: string
  resources?: string

  unit: Units
  frequency: Frequency
  type: KPIType
  calibration: Calibration

  objectives: number[]
  compliances: number[]
  processes: number[]
}

export interface IKpiResponse extends KPI {
  objectives: IDatabaseStaticData[]
  compliances: IDatabaseStaticData[]
  processes: IDatabaseStaticData[]
  targets: IKpiTarget[]
  actuals: IKpiActualTarget[]
  tasks: ITaskManagementResponse[]
  assignTo: string
  [key: string]: unknown
}

export interface IKpiTargetResponse
  extends Pick<KPI, 'id' | 'name' | 'code' | 'unit' | 'frequency'> {
  KPITarget: IKpiTarget[]
}

export interface IKpiActualTargetResponse
  extends Pick<KPI, 'id' | 'name' | 'code' | 'unit' | 'frequency'> {
  KPIActual: IKpiActualTarget[]
}

export interface IKpiWithTargetsAndActuals extends KPI {
  KPITarget: IKpiTarget[]
  KPIActual: IKpiActualTarget[]
}

export interface IKpiTargetManipulator {
  kpiId: number
  year: number
  period: string
  targetValue: number
}
