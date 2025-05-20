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
  convertToArabicNumerals,
  switchUnit,
} from '@/lib/utils'
import { useGlobalStore } from '@/stores/global-store'
import { IKpiResponse, MonthlyData } from '@/types/kpi'
import { Calibration, KPIActual, userRole } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { FC, Fragment } from 'react'

interface IKpiAnalysisProps {
  data?: IKpiResponse[] // Array of KPI data
}

const KpiAnalysisComponent: FC<IKpiAnalysisProps> = () => {
  const months = periodsByFrequency.monthly
  const currentYear = new Date().getFullYear()
  const pathname = usePathname()
  const isArabic = pathname.includes('/ar')
  const t = useTranslations('general')

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

  const kpiData = data?.kpis
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
        target.Dec = value
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
    <div
      className="w-full max-w-full overflow-x-auto"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-300">
            <th />
            <th />
            <th />
            <th />
            <th />
            <th
              colSpan={12}
              className="border border-gray-300 p-2.5 dark:border-gray-800"
            >
              {t('year')}{' '}
              {isArabic ? convertToArabicNumerals(currentYear) : currentYear}
            </th>
          </tr>
          <tr className="bg-gray-100 dark:bg-gray-300">
            <th />
            <th />
            <th />
            <th />
            <th />
            {Object.keys(quarters).map((quarter) => (
              <th
                key={quarter}
                colSpan={3}
                className="border border-gray-300 p-2.5 dark:border-gray-800"
              >
                {t(`options.${quarter}`)}
              </th>
            ))}
          </tr>
          <tr className="bg-gray-100 dark:bg-gray-300">
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
                    className="border border-gray-300 p-2.5 dark:border-gray-800"
                    colSpan={1}
                  >
                    {t(`options.${month}`)}
                  </th>
                ))}
              </Fragment>
            ))}
          </tr>
          <tr className="bg-gray-100 dark:bg-gray-300">
            <th className="border border-gray-300 p-2.5 dark:border-gray-800">
              {t('Code')}
            </th>
            <th className="border border-gray-300 p-2.5 dark:border-gray-800">
              {t('kpi-name')}
            </th>
            <th className="border border-gray-300 p-2.5 dark:border-gray-800">
              {t('Frequency')}
            </th>
            <th className="border border-gray-300 p-2.5 dark:border-gray-800">
              {t('Unit')}
            </th>
            <th className="border border-gray-300 p-2.5 dark:border-gray-800">
              {t('Trend')}
            </th>
            {Object.keys(quarters).map((quarter) => (
              <Fragment key={quarter}>
                {quarters[quarter as keyof typeof quarters].map((month) => (
                  <Fragment key={month}>
                    <th className="relative h-12 w-20 border border-gray-300 p-2.5 dark:border-gray-800">
                      <div
                        className={cn(
                          'absolute inset-0 flex items-center justify-start',
                          isArabic ? 'pr-2' : ' pl-2',
                          'text-sm font-bold',
                        )}
                      >
                        <Tooltips
                          content={'Actual Current Year'}
                          variant="bold"
                          position="top"
                          asChild
                        >
                          <span>CY</span>
                        </Tooltips>
                      </div>
                      <div
                        className={cn(
                          'absolute bottom-0 text-xs font-semibold',
                          isArabic ? 'left-1' : 'right-1',
                        )}
                      >
                        <Tooltips
                          content={'Trend'}
                          variant="bold"
                          position="top"
                          asChild
                        >
                          <span>TRD</span>
                        </Tooltips>
                      </div>
                      <div
                        className={cn(
                          'absolute top-0 text-xs font-medium',
                          isArabic ? 'left-1' : 'right-1',
                        )}
                      >
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
          {kpiData?.map((kpi, index) => {
            const { current: currentYearData, previous: previousYearData } =
              mapFrequencyToMonths(kpi.actuals, currentYear)

            return (
              <tr
                key={index}
                className="hover:bg-gray-50 dark:hover:bg-gray-400"
              >
                <td className="border border-gray-300 p-2.5 dark:border-gray-800">
                  {kpi.code}
                </td>
                <td className="border border-gray-300 p-2.5 dark:border-gray-800">
                  {kpi.name}
                </td>{' '}
                <td className="border border-gray-300 p-2.5 capitalize dark:border-gray-800">
                  {t(`options.${kpi.frequency}`)}
                </td>
                <td className="border border-gray-300 p-2.5 text-center dark:border-gray-800">
                  {switchUnit(kpi.unit)}
                </td>
                <td className="border border-gray-300 p-2.5 text-center dark:border-gray-800">
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
                            'relative h-12 border border-gray-300 dark:border-gray-800 p-2.5',
                            !cy
                              ? 'bg-gray-200 border-dashed border-gray-300 dark:border-gray-800 dark:bg-gray-400'
                              : '',
                          )}
                        >
                          <div
                            className={cn(
                              'absolute inset-0 flex items-center justify-start',
                              isArabic ? 'pr-2' : ' pl-2',
                              'text-sm font-bold',
                            )}
                          >
                            {cy ?? ''}
                          </div>
                          <div
                            className={cn(
                              'absolute bottom-0 text-xs font-semibold',
                              isArabic ? 'left-1' : 'right-1',
                            )}
                          >
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
                          <div
                            className={cn(
                              'absolute top-0 text-xs font-medium',
                              isArabic ? 'left-1' : 'right-1',
                            )}
                          >
                            {!cy ? (py ?? '') : (py ?? '')}
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
