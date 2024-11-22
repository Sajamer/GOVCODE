import { Calibration, Frequency, KPIType, Units } from '@prisma/client'

export interface IKpiManipulator {
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

  KPIObjectIds: string[]
}
