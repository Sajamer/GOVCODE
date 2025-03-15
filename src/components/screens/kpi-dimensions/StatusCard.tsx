'use client'

import StatusTable from '@/components/shared/tables/kpiDimensions/StatusTable'
import { getAllStatuses } from '@/lib/actions/kpi-dimensions/status.actions'
import { useQuery } from '@tanstack/react-query'
import { LayoutList } from 'lucide-react'
import { FC } from 'react'

const StatusCard: FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['kpi-status'],
    queryFn: async () => await getAllStatuses(),
    staleTime: 5 * 60 * 1000,
  })

  const statusData = data || []

  return (
    <StatusTable<IStatusResponse>
      title="Status"
      description="statusDescription"
      entityKey="id"
      sheetName={'kpi-status'}
      data={statusData}
      isLoading={isLoading}
      icon={<LayoutList className="text-white" />}
      columns={[{ key: 'name', isSortable: false, type: 'string' }]}
    />
  )
}

export default StatusCard
