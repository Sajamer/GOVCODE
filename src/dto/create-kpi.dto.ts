export interface CreateKpiDTO {
  name: string
  description: string
  owner: string
  measurementNumerator: string
  measurementDenominator: string
  measurementNumber?: number
  resources: string
  unit: 'PERCENTAGE' | 'NUMBER'
  frequency: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  type: 'CUMULATIVE' | 'DISCRETE'
  calibration: 'INCREASING' | 'DECREASING'
  departmentId: number
  KPICompliance: {
    create?: { complianceId: number }[]
    connect?: { id: number }[]
  }
  KPIObjective: {
    create?: { objectiveId: number }[]
    connect?: { id: number }[]
  }
  KPIProcess: {
    create?: { processId: number }[]
    connect?: { id: number }[]
  }
}
