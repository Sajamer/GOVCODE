'use client'

import GenericComponent from '@/components/shared/tables/GenericTable'
import { getAllKPI } from '@/lib/actions/kpiActions'
import { CustomUser } from '@/lib/auth'
import { useGlobalStore } from '@/stores/global-store'
import { IKpiResponse } from '@/types/kpi'
import { userRole } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { FC } from 'react'

const KpiComponent: FC = () => {
  const { departmentId, organizationId } = useGlobalStore((store) => store)

  const { data: session } = useSession()
  const userData = session?.user as CustomUser | undefined

  const { data, isLoading } = useQuery({
    queryKey: ['kpis', userData?.role, organizationId, departmentId],
    queryFn: async () => {
      if (!userData?.role) throw new Error('User role not found')
      return await getAllKPI(
        userData.role as userRole,
        organizationId,
        departmentId,
      )
    },
    staleTime: 5 * 60 * 1000, // 2 minutes
  })

  const kpiData = data?.kpis || []

  return (
    <>
      <GenericComponent<IKpiResponse>
        title="kpis"
        description="kpiDescription"
        entityKey="id"
        sheetName={'kpis'}
        data={kpiData}
        total={data?.totalCount || 0}
        isLoading={isLoading}
        showImportExcel
        defaultVisibleColumns={['code', 'name', 'calibration', 'frequency']}
        columns={[
          { key: 'code', isSortable: true, type: 'string' },
          { key: 'name', isSortable: false, type: 'string' },
          { key: 'calibration', isSortable: false, type: 'string' },
          { key: 'description', isSortable: false, type: 'string' },
          { key: 'frequency', isSortable: false, type: 'string' },
          { key: 'assignTo', isSortable: false, type: 'string' },
          { key: 'owner', isSortable: false, type: 'string' },
          { key: 'department', isSortable: false, type: 'string' },
          { key: 'compliance', isSortable: false, type: 'string' },
          { key: 'process', isSortable: false, type: 'string' },
          { key: 'objective', isSortable: false, type: 'string' },
          { key: 'measurementNumerator', isSortable: false, type: 'string' },
          { key: 'measurementDenominator', isSortable: false, type: 'string' },
          { key: 'measurementNumber', isSortable: false, type: 'string' },
          { key: 'resources', isSortable: false, type: 'string' },
          { key: 'unit', isSortable: false, type: 'string' },
          { key: 'type', isSortable: false, type: 'string' },
          { key: 'statusType', isSortable: false, type: 'string' },
          { key: 'statusName', isSortable: false, type: 'string' },
        ]}
      />
    </>
  )
}

export default KpiComponent
