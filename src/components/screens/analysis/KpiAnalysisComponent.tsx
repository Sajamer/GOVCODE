import { quarters } from '@/constants/global-constants'
import { periodsByFrequency } from '@/constants/kpi-constants'
import { cn } from '@/lib/utils'
import { IKpiResponse } from '@/types/kpi'
import { Calibration, KPIActual, Units } from '@prisma/client'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { FC, Fragment } from 'react'

// Types for monthly data
type MonthlyData = Record<string, number | undefined> // Key is month name, value is number or undefined

interface IKpiAnalysisProps {
  data?: IKpiResponse[] // Array of KPI data
}

const KpiAnalysisComponent: FC<IKpiAnalysisProps> = ({ data }) => {
  const months = periodsByFrequency.monthly
  const currentYear = new Date().getFullYear()

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
        target[quarterMonth] = value
      } else if (period.startsWith('s')) {
        const halfMonth = period === 's1' ? 'June' : 'December'
        target[halfMonth] = value
      } else if (period === 'yearly') {
        target.December = value
      } else if (
        months.includes(
          period as
            | 'January'
            | 'February'
            | 'March'
            | 'April'
            | 'May'
            | 'June'
            | 'July'
            | 'August'
            | 'September'
            | 'October'
            | 'November'
            | 'December',
        )
      ) {
        target[
          (period.charAt(0).toUpperCase() +
            period.slice(1)) as keyof MonthlyData
        ] = value
      }
    })

    return monthlyData
  }

  const calculateTrend = (
    defaultTrend: Calibration,
    cy?: number,
    py?: number,
  ): boolean | undefined => {
    if (cy === undefined || py === undefined) return undefined

    const diff = cy - py
    diff.toFixed(2)
    if (diff > 0 && defaultTrend === Calibration.INCREASING) return true
    else if (diff < 0 && defaultTrend === Calibration.DECREASING) return true
    else return false
  }

  // Function to get the unit name based on the unit type
  const switchUnit = (unit: Units): string => {
    switch (unit) {
      case Units.DAYS:
        return 'Days'
      case Units.PERCENTAGE:
        return '%'
      case Units.NUMBER:
        return 'NBR'
      default:
        return '-'
    }
  }

  // Function to switch the calibration trend
  const trendIndicatorSwitch = (trend: Calibration) => {
    switch (trend) {
      case Calibration.INCREASING:
        return <ArrowUpRight className="text-primary" />
      case Calibration.DECREASING:
        return <ArrowDownLeft className="text-destructive" />
      default:
        return <></>
    }
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
                    <th className="border border-gray-300 p-2.5">CY</th>
                    <th className="border border-gray-300 p-2.5">PY</th>
                    <th className="border border-gray-300 p-2.5">TRD</th>
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
                        <Fragment key={month}>
                          <td
                            className={cn(
                              'border border-gray-300 p-2.5 text-center',
                              !cy ? 'bg-secondary border-gray-700' : '',
                            )}
                          >
                            {cy ?? ''}
                          </td>
                          <td
                            className={cn(
                              'border border-gray-300 p-2.5 text-center',
                              !cy && !py ? 'bg-secondary border-gray-700' : '',
                            )}
                          >
                            {!cy ? (py ?? '') : (py ?? 'N/A')}
                          </td>
                          <td
                            className={cn(
                              'border border-gray-300 p-2.5 text-center',
                              !cy && !py ? 'bg-secondary border-gray-700' : '',
                            )}
                          >
                            {!cy
                              ? ''
                              : !py
                                ? '-'
                                : trendIndicatorSwitch(
                                    trend
                                      ? Calibration.INCREASING
                                      : trend === false
                                        ? Calibration.DECREASING
                                        : 'NEUTRAL',
                                  )}
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

export default KpiAnalysisComponent
