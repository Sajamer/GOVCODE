/* eslint-disable @typescript-eslint/no-empty-object-type */
import {
  Calibration,
  Frequency,
  KPI,
  KPIActual,
  KPITarget,
  KPIType,
  Units,
} from '@prisma/client'

interface IKpiTarget extends KPITarget {}
interface IKpiActualTarget extends KPIActual {}

export type MonthlyData = Record<string, number | undefined>
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
