'use client'

import Tooltips from '@/components/shared/tooltips/Tooltips'
import { Switch } from '@/components/ui/switch'
import { quarters } from '@/constants/global-constants'
import { Month, periodsByFrequency } from '@/constants/kpi-constants'
import { getAllKPI } from '@/lib/actions/kpiActions'
import { CustomUser } from '@/lib/auth'
import { statusIndicatorSwitch, trendIndicatorSwitch } from '@/lib/functions'
import {
  calculateStatus,
  capitalizeFirstLetter,
  cn,
  convertToArabicNumerals,
  findMatchingRule,
  switchUnit,
} from '@/lib/utils'
import { useGlobalStore } from '@/stores/global-store'
import { IKpiResponse, MonthlyData } from '@/types/kpi'
import { KPIActual, KPITarget, userRole } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { FC, Fragment, useState } from 'react'

interface IKpiStatusProps {
  data?: IKpiResponse[]
}

const KpiStatusComponent: FC<IKpiStatusProps> = () => {
  const [showCustomStatus, setShowCustomStatus] = useState(false)

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
            ? 'Mar'
            : period === 'q2'
              ? 'Jun'
              : period === 'q3'
                ? 'Sep'
                : 'Dec'
        monthlyData[quarterMonth] = value
      } else if (period === 's1' || period === 's2') {
        const halfMonth = period === 's1' ? 'Jun' : 'Dec'
        monthlyData[halfMonth] = value
      } else if (period === 'yearly') {
        monthlyData.Dec = value
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
    <div
      className="w-full max-w-full overflow-x-auto"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <table className="relative min-w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-300">
            <th>
              <div
                className={cn(
                  'absolute top-5 flex items-center gap-3 px-4',
                  isArabic ? 'right-5' : 'left-5',
                )}
              >
                <span className="text-xl font-semibold underline">
                  {t('show-custom-status')}
                </span>
                <Switch
                  id="status-switch"
                  dir={isArabic ? 'rtl' : 'ltr'}
                  checked={showCustomStatus}
                  onCheckedChange={setShowCustomStatus}
                />
              </div>
            </th>
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
                          'absolute inset-0 flex items-center justify-start text-sm font-bold',
                          isArabic ? 'pr-2' : ' pl-2',
                        )}
                      >
                        <Tooltips
                          content={'Current Target'}
                          variant="bold"
                          position="top"
                          asChild
                        >
                          <span>CT</span>
                        </Tooltips>
                      </div>
                      <div
                        className={cn(
                          'absolute bottom-0 text-xs font-semibold',
                          isArabic ? 'left-1' : 'right-1',
                        )}
                      >
                        <Tooltips
                          content={'Status'}
                          variant="bold"
                          position="top"
                          asChild
                        >
                          <span>ST</span>
                        </Tooltips>
                      </div>
                      <div
                        className={cn(
                          'absolute top-0 text-xs font-medium',
                          isArabic ? 'left-1' : 'right-1',
                        )}
                      >
                        <Tooltips
                          content={'Current Actual'}
                          variant="bold"
                          position="top"
                          asChild
                        >
                          <span>CA</span>
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
            const currentYearTargets = mapFrequencyToMonths(
              kpi?.targets?.filter((t) => t.year === currentYear),
              true,
            )
            const currentYearActuals = mapFrequencyToMonths(
              kpi?.actuals?.filter((a) => a.year === currentYear),
            )

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
                </td>
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
                              'relative h-12 border border-gray-300 dark:border-gray-800 p-2.5 text-center',
                              target === undefined && actual !== undefined
                                ? ''
                                : target === undefined
                                  ? 'bg-gray-200 border-dashed border-gray-300 dark:border-gray-800 dark:bg-gray-400'
                                  : '',
                            )}
                          >
                            <div
                              className={cn(
                                'absolute inset-0 flex items-center justify-start text-sm font-bold',
                                isArabic ? 'pr-2' : ' pl-2',
                              )}
                            >
                              {actual !== undefined && target === undefined
                                ? ''
                                : (target ?? '')}
                            </div>
                            <div
                              className={cn(
                                'absolute top-1 text-xs font-semibold',
                                isArabic ? 'left-1' : 'right-1',
                              )}
                            >
                              {target !== undefined && actual === undefined
                                ? ''
                                : (actual ?? '')}
                            </div>
                            <div
                              className={cn(
                                'absolute bottom-1',
                                isArabic ? 'right-1' : 'left-1',
                              )}
                            >
                              {target !== undefined &&
                              actual !== undefined &&
                              showCustomStatus &&
                              kpi.statusType === 'custom' &&
                              kpi.status?.rules
                                ? (() => {
                                    const matchingRule = findMatchingRule(
                                      actual,
                                      target,
                                      kpi.status.rules,
                                    )
                                    return matchingRule ? (
                                      <span
                                        className="rounded px-1 py-0.5 text-[8px] text-white"
                                        style={{
                                          backgroundColor: matchingRule.color,
                                        }}
                                      >
                                        {matchingRule.label}
                                      </span>
                                    ) : null
                                  })()
                                : null}
                            </div>
                            <div
                              className={cn(
                                'absolute bottom-1 text-xs font-medium',
                                isArabic ? 'left-1' : 'right-1',
                              )}
                            >
                              {target !== undefined && actual !== undefined
                                ? statusIndicatorSwitch(status)
                                : ''}
                            </div>
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
