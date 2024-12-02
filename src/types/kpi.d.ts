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
  [key: string]: unknown
}

interface IKpiTarget extends KPITarget {}
interface IKpiActualTarget extends KPIActual {}
export interface IKpiTargetResponse
  extends Pick<KPI, 'id' | 'name' | 'code' | 'unit' | 'frequency'> {
  KPITarget: IKpiTarget[]
}

export interface IKpiTargetManipulator {
  kpiId: number
  year: number
  period: string
  targetValue: number
}

export interface IKpiActualTargetResponse
  extends Pick<KPI, 'id' | 'name' | 'code' | 'unit' | 'frequency'> {
  KPIActual: IKpiActualTarget[]
}
