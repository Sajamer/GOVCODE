'use client'

import AuditStatusTable from '@/components/shared/tables/kpiDimensions/AuditStatusTable'
import { getAllAuditStatuses } from '@/lib/actions/kpi-dimensions/audit-status.actions'
import { useQuery } from '@tanstack/react-query'
import { LayoutList } from 'lucide-react'
import { FC } from 'react'

const AuditStatusCard: FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['audit-status'],
    queryFn: async () => await getAllAuditStatuses(),
    staleTime: 5 * 60 * 1000,
  })

  const auditStatusData = data || []

  return (
    <AuditStatusTable<IAuditStatusResponse>
      title="audit-status"
      description="auditStatusDescription"
      entityKey="id"
      sheetName={'audit-status'}
      data={auditStatusData}
      isLoading={isLoading}
      icon={<LayoutList className="text-white" />}
      columns={[{ key: 'name', isSortable: false, type: 'string' }]}
    />
  )
}
export default AuditStatusCard
