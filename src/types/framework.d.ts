export interface IFrameWorkAuditCycle {
  id: number
  name: string
  startDate: Date
  auditBy: string
  description: string | null
  user: {
    id: string
    fullName: string | null
  }
}

export interface IFrameworkAttribute {
  id: string
  name: string
  value: string | null
  frameworkId?: string
  parentId?: string | null
  children?: IFrameworkAttribute[]
  rowIndex?: number
  colIndex?: number
}

export interface IFrameworkStatus {
  id: number
  name: string
  auditRules: {
    id: number
    label: string
    color: string
  }[]
}

export interface IFramework {
  id: string
  name: string
  attributes: IFrameworkAttribute[]
  auditCycles?: IFrameWorkAuditCycle[]
  status: IFrameworkStatus
}
