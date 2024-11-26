import { Calibration, Frequency, KPIType, Units } from '@prisma/client'

export interface IMultiSelectValues {
  id: number
  name: string
}

interface Ids {
  id: number
}
export interface IKpiFormDropdownData {
  objectives: IMultiSelectValues[]
  compliances: IMultiSelectValues[]
  processes: IMultiSelectValues[]
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
