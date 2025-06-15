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

export interface IAttachment {
  id: string
  name: string
  url: string
  size?: number | null
  type?: string | null
}

export interface IAuditDetails {
  id: string
  frameworkAttributeId: string
  auditCycleId: number
  auditBy: string
  ownedBy?: string | null
  auditRuleId: number
  comment?: string | null
  recommendation?: string | null
  auditor: {
    id: string
    fullName: string | null
  }
  owner?: {
    id: string
    fullName: string | null
  } | null
  auditRule: {
    id: number
    label: string
    color: string
    statusId: number
  }
  attachments?: IAttachment[]
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
  auditDetails?: IAuditDetails[]
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
