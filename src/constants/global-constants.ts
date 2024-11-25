import { Calibration, Frequency, KPIType, Units } from '@prisma/client'

export const kpiTypeOptions = [
  {
    id: KPIType.CUMULATIVE,
    label: 'Cumulative',
    value: KPIType.CUMULATIVE,
  },
  {
    id: KPIType.STAGING,
    label: 'Staging',
    value: KPIType.STAGING,
  },
]

export const unitOptions = [
  {
    id: Units.PERCENTAGE,
    label: 'Percentage',
    value: Units.PERCENTAGE,
  },
  {
    id: Units.NUMBER,
    label: 'Number',
    value: Units.NUMBER,
  },
  {
    id: Units.TIME,
    label: 'Time',
    value: Units.TIME,
  },
  {
    id: Units.DAYS,
    label: 'Days',
    value: Units.DAYS,
  },
]

export const frequencyOptions = [
  {
    id: Frequency.MONTHLY,
    label: 'Monthly',
    value: Frequency.MONTHLY,
  },
  {
    id: Frequency.QUARTERLY,
    label: 'Quarterly',
    value: Frequency.QUARTERLY,
  },
  {
    id: Frequency.SEMI_ANNUALLY,
    label: 'Semi Annually',
    value: Frequency.SEMI_ANNUALLY,
  },
  {
    id: Frequency.ANNUALLY,
    label: 'Annually',
    value: Frequency.ANNUALLY,
  },
]

export const calibrationOptions = [
  {
    id: Calibration.INCREASING,
    label: 'Increasing',
    value: Calibration.INCREASING,
  },
  {
    id: Calibration.DECREASING,
    label: 'Decreasing',
    value: Calibration.DECREASING,
  },
  {
    id: Calibration.NEUTRAL,
    label: 'Neutral',
    value: Calibration.NEUTRAL,
  },
]
