import {
  Calibration,
  ChartTypes,
  Frequency,
  KPIType,
  Priority,
  TaskStatus,
  Units,
  userRole,
} from '@prisma/client'
import { periodsByFrequency } from './kpi-constants'

type TranslationFunction = (
  key: string,
  values?: Record<string, string | number>,
) => string

export const getUserRoles = (t: TranslationFunction) => [
  {
    id: userRole.superAdmin,
    label: t('options.superAdmin'),
    value: userRole.superAdmin,
  },
  {
    id: userRole.moderator,
    label: t('options.moderator'),
    value: userRole.moderator,
  },
  {
    id: userRole.contributor,
    label: t('options.contributor'),
    value: userRole.contributor,
  },
  {
    id: userRole.userDepartment,
    label: t('options.userDepartment'),
    value: userRole.userDepartment,
  },
  {
    id: userRole.userOrganization,
    label: t('options.userOrganization'),
    value: userRole.userOrganization,
  },
]

export const getKpiTypeOptions = (t: TranslationFunction) => [
  {
    id: KPIType.CUMULATIVE,
    label: t('options.Cumulative'),
    value: KPIType.CUMULATIVE,
  },
  {
    id: KPIType.STAGING,
    label: t('options.Staging'),
    value: KPIType.STAGING,
  },
]

export const getUnitOptions = (t: TranslationFunction) => [
  {
    id: Units.PERCENTAGE,
    label: t('options.Percentage'),
    value: Units.PERCENTAGE,
  },
  {
    id: Units.NUMBER,
    label: t('options.Number'),
    value: Units.NUMBER,
  },
  {
    id: Units.TIME,
    label: t('options.Time'),
    value: Units.TIME,
  },
  {
    id: Units.DAYS,
    label: t('options.Days'),
    value: Units.DAYS,
  },
]

export const getFrequencyOptions = (t: TranslationFunction) => [
  {
    id: Frequency.MONTHLY,
    label: t('options.Monthly'),
    value: Frequency.MONTHLY,
  },
  {
    id: Frequency.QUARTERLY,
    label: t('options.Quarterly'),
    value: Frequency.QUARTERLY,
  },
  {
    id: Frequency.SEMI_ANNUALLY,
    label: t('options.Semi Annually'),
    value: Frequency.SEMI_ANNUALLY,
  },
  {
    id: Frequency.ANNUALLY,
    label: t('options.Annually'),
    value: Frequency.ANNUALLY,
  },
]

export const getCalibrationOptions = (t: TranslationFunction) => [
  {
    id: Calibration.INCREASING,
    label: t('options.Increasing'),
    value: Calibration.INCREASING,
  },
  {
    id: Calibration.DECREASING,
    label: t('options.Decreasing'),
    value: Calibration.DECREASING,
  },
  // Uncomment if needed
  // {
  //   id: Calibration.NEUTRAL,
  //   label: t('options.Neutral'),
  //   value: Calibration.NEUTRAL,
  // },
]

export const getPriorityOptions = (t: TranslationFunction) => [
  {
    id: Priority.LOW,
    label: t('options.low'),
    value: Priority.LOW,
  },
  {
    id: Priority.MEDIUM,
    label: t('options.medium'),
    value: Priority.MEDIUM,
  },
  {
    id: Priority.HIGH,
    label: t('options.high'),
    value: Priority.HIGH,
  },
]

export const getTaskStatusOptions = (t: TranslationFunction) => [
  {
    id: TaskStatus.TODO,
    label: t('options.todo'),
    value: TaskStatus.TODO,
  },
  {
    id: TaskStatus.IN_PROGRESS,
    label: t('options.inProgress'),
    value: TaskStatus.IN_PROGRESS,
  },
  {
    id: TaskStatus.DONE,
    label: t('options.done'),
    value: TaskStatus.DONE,
  },
]

export const getChartTypeOptions = (t: TranslationFunction) => [
  {
    id: ChartTypes.line,
    label: t('options.line'),
    value: ChartTypes.line,
  },
  {
    id: ChartTypes.bar,
    label: t('options.bar'),
    value: ChartTypes.bar,
  },
  {
    id: ChartTypes.pie,
    label: t('options.pie'),
    value: ChartTypes.pie,
  },
  {
    id: ChartTypes.radar,
    label: t('options.radar'),
    value: ChartTypes.radar,
  },
  {
    id: ChartTypes.area,
    label: t('options.area'),
    value: ChartTypes.area,
  },
  {
    id: ChartTypes.barStacked,
    label: t('options.barStacked'),
    value: ChartTypes.barStacked,
  },
]

export const frequencyMapping: Record<
  Frequency,
  keyof typeof periodsByFrequency
> = {
  [Frequency.MONTHLY]: 'monthly',
  [Frequency.QUARTERLY]: 'quarterly',
  [Frequency.SEMI_ANNUALLY]: 'semiannual',
  [Frequency.ANNUALLY]: 'yearly',
}

export const quarters = {
  q1: ['Jan', 'Feb', 'Mar'],
  q2: ['Apr', 'May', 'Jun'],
  q3: ['Jul', 'Aug', 'Sep'],
  q4: ['Oct', 'Nov', 'Dec'],
}
