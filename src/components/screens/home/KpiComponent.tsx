'use client'

import GenericComponent from '@/components/shared/tables/GenericTable'
import { KPI } from '@prisma/client'
import { FC } from 'react'

interface IKpiComponentProps {
  data: KPI[]
}

const KpiComponent: FC<IKpiComponentProps> = ({ data }) => {
  return (
    <GenericComponent<KPI>
      title={'Kpis'}
      description={'Manage all the kpi available on the platform.'}
      entityKey="id"
      sheetName={'kpis'}
      data={data}
      columns={[
        { key: 'code', isSortable: true, type: 'string' },
        { key: 'name', isSortable: false, type: 'string' },
        { key: 'calibration', isSortable: false, type: 'string' },
        { key: 'description', isSortable: false, type: 'string' },
        { key: 'frequency', isSortable: false, type: 'string' },
        { key: 'unit', isSortable: true, type: 'string' },
        { key: 'type', isSortable: false, type: 'string' },
      ]}
    />
  )
}

export default KpiComponent
