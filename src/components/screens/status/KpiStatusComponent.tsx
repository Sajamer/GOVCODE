'use client'

import Tooltips from '@/components/shared/tooltips/Tooltips'
import { quarters } from '@/constants/global-constants'
import { Month, periodsByFrequency } from '@/constants/kpi-constants'
import { getAllKPI } from '@/lib/actions/kpiActions'
import { CustomUser } from '@/lib/auth'
import { statusIndicatorSwitch, trendIndicatorSwitch } from '@/lib/functions'
import {
  calculateStatus,
  capitalizeFirstLetter,
  cn,
  switchUnit,
} from '@/lib/utils'
import { useGlobalStore } from '@/stores/global-store'
import { IKpiResponse, MonthlyData } from '@/types/kpi'
import { KPIActual, KPITarget, userRole } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { FC, Fragment } from 'react'

interface IKpiStatusProps {
  data?: IKpiResponse[]
}

const KpiStatusComponent: FC<IKpiStatusProps> = () => {
  const months = periodsByFrequency.monthly
  const currentYear = new Date().getFullYear()

  const { departmentId, organizationId } = useGlobalStore((store) => store)

  const { data: session } = useSession()
  const userData = session?.user as CustomUser | undefined

  const { data } = useQuery({
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

  // Function to map KPI data to monthly data
  const mapFrequencyToMonths = (
    items: (KPIActual | KPITarget)[],
    isTarget: boolean = false,
  ): MonthlyData => {
    const monthlyData = {} as MonthlyData

    // Initialize all months with undefined
    months.forEach((month) => {
      monthlyData[month] = undefined
    })

    items.forEach((item) => {
      const value = isTarget
        ? (item as KPITarget).targetValue
        : (item as KPIActual).targetValue
      const period = item.period.toLowerCase()

      // Handle different period formats
      if (period.startsWith('q')) {
        const quarterMonth =
          period === 'q1'
            ? 'March'
            : period === 'q2'
              ? 'June'
              : period === 'q3'
                ? 'September'
                : 'December'
        monthlyData[quarterMonth] = value
      } else if (period === 's1' || period === 's2') {
        const halfMonth = period === 's1' ? 'June' : 'December'
        monthlyData[halfMonth] = value
      } else if (period === 'yearly') {
        monthlyData.December = value
      } else {
        const capitalizedPeriod = capitalizeFirstLetter(period) as Month

        if (months.includes(capitalizedPeriod)) {
          monthlyData[capitalizedPeriod] = value
        }
      }
    })

    return monthlyData
  }

  return (
    <div className="max-w-full overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th />
            <th />
            <th />
            <th />
            <th />
            <th colSpan={36} className="border border-gray-300 p-2.5">
              Year {currentYear}
            </th>
          </tr>
          <tr className="bg-gray-100">
            <th />
            <th />
            <th />
            <th />
            <th />
            {Object.keys(quarters).map((quarter) => (
              <th
                key={quarter}
                colSpan={9}
                className="border border-gray-300 p-2.5"
              >
                {quarter.toUpperCase()}
              </th>
            ))}
          </tr>
          <tr className="bg-gray-100">
            <th />
            <th />
            <th />
            <th />
            <th />
            {Object.keys(quarters).map((quarter, index) => (
              <Fragment key={index}>
                {quarters[quarter as keyof typeof quarters].map((month) => (
                  <th
                    key={month}
                    className="border border-gray-300 p-2.5"
                    colSpan={3}
                  >
                    {month}
                  </th>
                ))}
              </Fragment>
            ))}
          </tr>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2.5">Code</th>
            <th className="border border-gray-300 p-2.5">KPI Name</th>
            <th className="border border-gray-300 p-2.5">Frequency</th>
            <th className="border border-gray-300 p-2.5">Unit</th>
            <th className="border border-gray-300 p-2.5">Trend</th>
            {Object.keys(quarters).map((quarter) => (
              <Fragment key={quarter}>
                {quarters[quarter as keyof typeof quarters].map((month) => (
                  <Fragment key={month}>
                    <Tooltips
                      content={'Current Target'}
                      variant="bold"
                      position="top"
                      asChild
                    >
                      <th className="border border-gray-300 p-2.5">CT</th>
                    </Tooltips>
                    <Tooltips
                      content={'Current Actual'}
                      variant="bold"
                      position="top"
                      asChild
                    >
                      <th className="border border-gray-300 p-2.5">CA</th>
                    </Tooltips>
                    <Tooltips
                      content={'Status'}
                      variant="bold"
                      position="top"
                      asChild
                    >
                      <th className="border border-gray-300 p-2.5">ST</th>
                    </Tooltips>
                  </Fragment>
                ))}
              </Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {data?.map((kpi, index) => {
            const currentYearTargets = mapFrequencyToMonths(
              kpi.targets.filter((t) => t.year === currentYear),
              true,
            )
            const currentYearActuals = mapFrequencyToMonths(
              kpi.actuals.filter((a) => a.year === currentYear),
            )

            return (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-2.5">{kpi.code}</td>
                <td className="border border-gray-300 p-2.5">{kpi.name}</td>
                <td className="border border-gray-300 p-2.5 capitalize">
                  {kpi.frequency?.toLowerCase()}
                </td>
                <td className="border border-gray-300 p-2.5 text-center">
                  {switchUnit(kpi.unit)}
                </td>
                <td className="border border-gray-300 p-2.5 text-center">
                  <div className="flex items-center justify-center">
                    {trendIndicatorSwitch(kpi.calibration)}
                  </div>
                </td>
                {Object.keys(quarters).map((quarter) => (
                  <Fragment key={quarter}>
                    {quarters[quarter as keyof typeof quarters].map((month) => {
                      const target = currentYearTargets[month]
                      const actual = currentYearActuals[month]

                      const status = calculateStatus(
                        kpi.calibration,
                        target,
                        actual,
                      )

                      return (
                        <Fragment key={month}>
                          <td
                            className={cn(
                              'border border-gray-300 p-2.5 text-center',
                              target === undefined && actual !== undefined
                                ? ''
                                : target === undefined
                                  ? 'bg-secondary border-gray-700'
                                  : '',
                            )}
                          >
                            {actual !== undefined && target === undefined
                              ? 'N/A'
                              : (target ?? '')}
                          </td>
                          <td
                            className={cn(
                              'border border-gray-300 p-2.5 text-center',
                              !actual && target !== undefined
                                ? ''
                                : !actual
                                  ? 'bg-secondary border-gray-700'
                                  : '',
                            )}
                          >
                            {target !== undefined && actual === undefined
                              ? 'N/A'
                              : (actual ?? '')}
                          </td>
                          <td
                            className={cn(
                              'border border-gray-300 p-2.5 text-center',
                              target === undefined && actual === undefined
                                ? 'bg-secondary border-gray-700'
                                : '',
                            )}
                          >
                            {target !== undefined && actual !== undefined
                              ? statusIndicatorSwitch(status)
                              : ''}
                          </td>
                        </Fragment>
                      )
                    })}
                  </Fragment>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default KpiStatusComponent
