'use client'

import ExportButton from '@/components/shared/buttons/ExportButton'
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

  const kpiData = data || []

  return (
    <>
      <GenericComponent<IKpiResponse>
        title="kpis"
        description="kpiDescription"
        entityKey="id"
        sheetName={'kpis'}
        data={kpiData}
        isLoading={isLoading}
        showImportExcel
        columns={[
          { key: 'code', isSortable: true, type: 'string' },
          { key: 'name', isSortable: false, type: 'string' },
          { key: 'calibration', isSortable: false, type: 'translated' },
          { key: 'description', isSortable: false, type: 'string' },
          { key: 'frequency', isSortable: false, type: 'translated' },
          { key: 'assignTo', isSortable: false, type: 'string' },
        ]}
      />

      {kpiData && kpiData?.length > 0 && (
        <div className="mt-10 flex w-full justify-end gap-4">
          <ExportButton
            data={kpiData}
            name={'kpis'}
            headers={{
              code: 'KPI Code',
              name: 'KPI',
              description: 'Description',
              owner: 'Owner',
              measurementNumerator: 'Numerator',
              measurementDenominator: 'Denominator',
              measurementNumber: 'Measurement Number',
              resources: 'Resources',
              unit: 'Unit',
              frequency: 'Frequency',
              type: 'Type',
              calibration: 'Calibration',
            }}
          />
        </div>
      )}
    </>
  )
}

export default KpiComponent
