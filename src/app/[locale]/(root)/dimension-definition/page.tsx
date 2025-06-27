'use client'

import AuditStatusCard from '@/components/screens/dimension-definition/AuditStatusCard'
import KpiDimensionCard from '@/components/screens/dimension-definition/KpiDimensionCard'
import StatusCard from '@/components/screens/dimension-definition/StatusCard'
import TaskStatusCard from '@/components/screens/dimension-definition/TaskStatusCard'
import { useTab } from '@/hooks/useTab'
import { FC } from 'react'

const KPIDimensions: FC = () => {
  const tab = useTab()

  switch (tab) {
    case 'status description':
      return <StatusCard />
    case 'audit status':
      return <AuditStatusCard />
    case 'task status':
      return <TaskStatusCard />
    default:
      return <KpiDimensionCard />
  }
}

export default KPIDimensions
