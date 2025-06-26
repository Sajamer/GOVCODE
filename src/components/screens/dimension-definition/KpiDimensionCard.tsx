'use client'

import KpiDimensionTable from '@/components/shared/tables/kpiDimensions/KpiDimensionTable'
import { useTab } from '@/hooks/useTab'
import { getAllCompliances } from '@/lib/actions/dimension-definition/compliance.actions'
import { getAllObjectives } from '@/lib/actions/dimension-definition/objective.actions'
import { getAllProcesses } from '@/lib/actions/dimension-definition/process.actions'
import { useQuery } from '@tanstack/react-query'
import { LayoutList } from 'lucide-react'
import { FC } from 'react'

const KpiDimensionCard: FC = () => {
  const tab = useTab()

  const { data, isLoading } = useQuery({
    queryKey: ['kpi-dimensions', tab],
    queryFn: async () => {
      switch (tab) {
        case 'processes':
          return await getAllProcesses()
        case 'compliances':
          return await getAllCompliances()
        case 'objectives':
          return await getAllObjectives()
        default:
          return []
      }
    },
    staleTime: 5 * 60 * 1000,
  })

  const kpiDimensionData = data || []
  const title = tab && tab?.charAt(0).toUpperCase() + tab?.slice(1)

  return (
    <KpiDimensionTable<IKpiDimensionResponse>
      title={title?.toLowerCase() || 'Kpi Dimensions'}
      description={title?.toLowerCase() + `Description`}
      entityKey="id"
      sheetName={'kpi-dimensions'}
      data={kpiDimensionData}
      isLoading={isLoading}
      icon={<LayoutList className="text-white" />}
      columns={[{ key: 'name', isSortable: false, type: 'string' }]}
    />
  )
}

export default KpiDimensionCard
