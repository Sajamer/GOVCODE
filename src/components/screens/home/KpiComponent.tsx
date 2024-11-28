'use client'

import GenericComponent from '@/components/shared/tables/GenericTable'
import { getAllKPI } from '@/lib/actions/kpiActions'
import { IKpiResponse } from '@/types/kpi'
import { useQuery } from '@tanstack/react-query'
import { FC } from 'react'

const KpiComponent: FC = () => {
  const { data = [] } = useQuery({
    queryKey: ['kpis'],
    queryFn: async () => {
      await getAllKPI()
    },
    staleTime: 5 * 60 * 1000, // 2 minutes
  })

  return (
    <GenericComponent<IKpiResponse>
      title={'Kpis'}
      description={'Manage all the kpi available on the platform.'}
      entityKey="id"
      sheetName={'kpis'}
      data={data ?? []}
      columns={[
        { key: 'code', isSortable: true, type: 'string' },
        { key: 'name', isSortable: false, type: 'string' },
        { key: 'calibration', isSortable: false, type: 'string' },
        { key: 'description', isSortable: false, type: 'string' },
        { key: 'frequency', isSortable: false, type: 'string' },
        { key: 'unit', isSortable: false, type: 'string' },
        { key: 'type', isSortable: false, type: 'string' },
        // { key: 'measurementDenominator', isSortable: false, type: 'string' },
        // { key: 'measurementNumerator', isSortable: false, type: 'string' },
        // { key: 'measurementNumber', isSortable: false, type: 'string' },
      ]}
    />
  )
}

export default KpiComponent
