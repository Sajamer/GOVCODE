'use client'

import GenericComponent from '@/components/shared/tables/GenericTable'
import { getAllKPI } from '@/lib/actions/kpiActions'
import { IKpiResponse } from '@/types/kpi'
import { useQuery } from '@tanstack/react-query'
import { FC } from 'react'

const KpiComponent: FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['kpis'],
    queryFn: async () => {
      await getAllKPI()
    },
    staleTime: 5 * 60 * 1000, // 2 minutes
  })

  const kpiData = data || []

  return (
    <GenericComponent<IKpiResponse>
      title="kpis"
      description="kpiDescription"
      entityKey="id"
      sheetName={'kpis'}
      data={kpiData}
      isLoading={isLoading}
      columns={[
        { key: 'code', isSortable: true, type: 'string' },
        { key: 'name', isSortable: false, type: 'string' },
        { key: 'calibration', isSortable: false, type: 'translated' },
        { key: 'description', isSortable: false, type: 'string' },
        { key: 'frequency', isSortable: false, type: 'translated' },
        { key: 'unit', isSortable: false, type: 'translated' },
        { key: 'type', isSortable: false, type: 'translated' },
        // { key: 'measurementDenominator', isSortable: false, type: 'string' },
        // { key: 'measurementNumerator', isSortable: false, type: 'string' },
        // { key: 'measurementNumber', isSortable: false, type: 'string' },
      ]}
    />
  )
}

export default KpiComponent
