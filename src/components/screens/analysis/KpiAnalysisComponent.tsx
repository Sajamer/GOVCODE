'use client'

import Tooltips from '@/components/shared/tooltips/Tooltips'
import { quarters } from '@/constants/global-constants'
import { Month, periodsByFrequency } from '@/constants/kpi-constants'
import { getAllKPI } from '@/lib/actions/kpiActions'
import { CustomUser } from '@/lib/auth'
import { trendIndicatorSwitch } from '@/lib/functions'
import {
  calculateTrend,
  capitalizeFirstLetter,
  cn,
  switchUnit,
} from '@/lib/utils'
import { useGlobalStore } from '@/stores/global-store'
import { IKpiResponse, MonthlyData } from '@/types/kpi'
import { Calibration, KPIActual, userRole } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { FC, Fragment } from 'react'

interface IKpiAnalysisProps {
  data?: IKpiResponse[] // Array of KPI data
}

const KpiAnalysisComponent: FC<IKpiAnalysisProps> = () => {
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
    actuals: KPIActual[],
    year: number,
  ): { current: MonthlyData; previous: MonthlyData } => {
    const monthlyData = {
      current: {} as MonthlyData,
      previous: {} as MonthlyData,
    }

    // Initialize all months with undefined
    months.forEach((month) => {
      monthlyData.current[month] = undefined
      monthlyData.previous[month] = undefined
    })

    actuals.forEach((actual) => {
      const value = actual.targetValue
      const period = actual.period.toLowerCase()

      const dataYear = actual.year
      const target =
        dataYear === year ? monthlyData.current : monthlyData.previous

      if (period.startsWith('q')) {
        const quarterMonth =
          period === 'q1'
            ? 'Mar'
            : period === 'q2'
              ? 'Jun'
              : period === 'q3'
                ? 'Sep'
                : 'Dec'
        target[quarterMonth] = value
      } else if (period === 's1' || period === 's2') {
        const halfMonth = period === 's1' ? 'Jun' : 'Dec'
        target[halfMonth] = value
      } else if (period === 'yearly') {
        target.December = value
      } else {
        const capitalizedPeriod = capitalizeFirstLetter(period) as Month

        if (months.includes(capitalizedPeriod)) {
          target[capitalizedPeriod] = value
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
            <th colSpan={12} className="border border-gray-300 p-2.5">
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
                colSpan={3}
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
                    colSpan={1}
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
                    <th className="relative h-12 w-20 border border-gray-300 p-2.5">
                      <div className="absolute left-0 top-0 text-sm font-bold">
                        <Tooltips
                          content={'Actual Current Year'}
                          variant="bold"
                          position="top"
                          asChild
                        >
                          <span>CY</span>
                        </Tooltips>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                        <Tooltips
                          content={'Trend'}
                          variant="bold"
                          position="top"
                          asChild
                        >
                          <span>TRD</span>
                        </Tooltips>
                      </div>
                      <div className="absolute bottom-0 right-0 text-xs font-medium">
                        <Tooltips
                          content={'Actual Previous Year'}
                          variant="bold"
                          position="top"
                          asChild
                        >
                          <span>PY</span>
                        </Tooltips>
                      </div>
                    </th>
                  </Fragment>
                ))}
              </Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {data?.map((kpi, index) => {
            const { current: currentYearData, previous: previousYearData } =
              mapFrequencyToMonths(kpi.actuals, currentYear)

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
                      const cy = currentYearData[month]
                      const py = previousYearData[month]
                      const trend = calculateTrend(kpi.calibration, cy, py)

                      return (
                        <td
                          key={month}
                          className={cn(
                            'relative h-12 border border-gray-300 p-2.5 text-center',
                            !cy
                              ? 'bg-gray-200 border-dashed border-gray-300'
                              : '',
                          )}
                        >
                          <div className="absolute left-0 top-0 text-sm font-bold">
                            {cy ?? ''}
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                            {!cy
                              ? ''
                              : !py
                                ? ''
                                : trendIndicatorSwitch(
                                    trend
                                      ? Calibration.INCREASING
                                      : trend === false
                                        ? Calibration.DECREASING
                                        : 'NEUTRAL',
                                  )}
                          </div>
                          <div className="absolute bottom-0 right-0 text-xs font-medium">
                            {!cy ? (py ?? '') : (py ?? '')}
                            {/* {!cy ? (py ?? '') : (py ?? 'N/A')} */}
                          </div>
                        </td>
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

export default KpiAnalysisComponent
