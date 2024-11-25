import { Calibration, Frequency, KPIType, Units } from '@prisma/client'

export interface IKpiManipulator {
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

  KPIObjective: number[]
  KPICompliance: number[]
  KPIProcess: number[]
}
