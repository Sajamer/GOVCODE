'use client'

import BarChartComponent from '@/components/shared/charts/BarChartComponent'
import { Month, periodsByFrequency } from '@/constants/kpi-constants'
import { getKPIByIdAndYearFilter } from '@/lib/actions/kpiActions'
import {
  IChartData,
  IKpiWithTargetsAndActuals,
  IMultipleChartData,
} from '@/types/kpi'
import { FC, useEffect, useState } from 'react'

interface IKpiChartsComponentProps {
  data: IKpiWithTargetsAndActuals
}

const KpiChartsComponent: FC<IKpiChartsComponentProps> = ({ data }) => {
  const [chartData, setChartData] = useState<IChartData[]>([])
  const [multipleChartData, setMultipleChartData] = useState<
    IMultipleChartData[]
  >([])
  const [currentYear, setCurrentYear] = useState(
    data.KPIActual?.[0]?.year?.toString() ||
      new Date().getFullYear().toString(),
  )

  const transformSingleChartData = (
    data: IKpiWithTargetsAndActuals,
  ): IChartData[] => {
    const { frequency, KPIActual } = data

    if (!KPIActual?.length) return []

    switch (frequency) {
      case 'MONTHLY':
        return KPIActual.map((item) => ({
          month: item.period,
          target: item.targetValue,
        })).sort((a, b) => {
          const months = periodsByFrequency.monthly as unknown as Month
          return months.indexOf(a.month) - months.indexOf(b.month)
        })
      case 'QUARTERLY':
        return KPIActual.map((item) => ({
          quarter: item.period,
          target: item.targetValue,
        }))

      case 'SEMI_ANNUALLY':
        return KPIActual.map((item) => ({
          semiAnnual: item.period,
          target: item.targetValue,
        }))

      case 'ANNUALLY':
        return KPIActual.map((item) => ({
          year: item.period,
          target: item.targetValue,
        }))
      default:
        return []
    }
  }

  const transformMultipleChartData = (
    data: IKpiWithTargetsAndActuals,
  ): IMultipleChartData[] => {
    const { frequency, KPIActual, KPITarget } = data

    if (!KPIActual?.length) return []

    switch (frequency) {
      case 'MONTHLY':
        return KPIActual.map((actual) => {
          const target = KPITarget?.find(
            (t) => t.period === actual.period && t.year === actual.year,
          )
          return {
            month: actual.period,
            actual: actual.targetValue,
            target: target?.targetValue || 0,
          }
        }).sort((a, b) => {
          const months = periodsByFrequency.monthly as unknown as Month
          return months.indexOf(a.month) - months.indexOf(b.month)
        })
      case 'QUARTERLY':
        return KPIActual.map((actual) => {
          const target = KPITarget?.find(
            (t) => t.period === actual.period && t.year === actual.year,
          )
          return {
            quarter: actual.period,
            actual: actual.targetValue,
            target: target?.targetValue || 0,
          }
        })
      case 'SEMI_ANNUALLY':
        return KPIActual.map((actual) => {
          const target = KPITarget?.find(
            (t) => t.period === actual.period && t.year === actual.year,
          )
          return {
            semiAnnual: actual.period,
            actual: actual.targetValue,
            target: target?.targetValue || 0,
          }
        })
      case 'ANNUALLY':
        return KPIActual.map((actual) => {
          const target = KPITarget?.find(
            (t) => t.period === actual.period && t.year === actual.year,
          )
          return {
            year: actual.period,
            actual: actual.targetValue,
            target: target?.targetValue || 0,
          }
        })
      default:
        return []
    }
  }

  const fetchChartData = async (year: string) => {
    try {
      const newData = await getKPIByIdAndYearFilter(data.id, year)
      setChartData(transformSingleChartData(newData))
      setMultipleChartData(transformMultipleChartData(newData))
    } catch (error) {
      console.error('Error fetching updated KPI data:', error)
    }
  }

  const handleYearChange = (option: IDropdown) => {
    setCurrentYear(option.id)
    fetchChartData(option.id)
  }

  const chartConfig = {
    target: {
      label: 'Target',
      color: 'hsl(var(--primary))',
    },
  }

  const multipleChartConfig = {
    actual: {
      label: 'Actual',
      color: 'hsl(var(--primary))',
    },
    target: {
      label: 'Target',
      color: 'hsl(var(--secondary))',
    },
  }

  useEffect(() => {
    setChartData(transformSingleChartData(data))
    setMultipleChartData(transformMultipleChartData(data))
  }, [data])

  return (
    <div className="flex w-full flex-col gap-10">
      <div className="flex w-full items-start justify-start gap-5">
        <BarChartComponent
          title="Current Actuals"
          description={`Showing Actuals for year ${currentYear}`}
          year={currentYear}
          chartData={chartData}
          chartConfig={chartConfig}
          callback={handleYearChange}
        />
        <div>data to be added</div>
      </div>
      <div className="flex w-full items-start justify-start gap-5">
        <BarChartComponent
          title="Actuals vs Targets"
          description={`Showing differences between actuals and targets for year ${currentYear}`}
          year={currentYear}
          chartData={multipleChartData}
          chartConfig={multipleChartConfig}
          callback={handleYearChange}
          isMultipleData
        />
        <div>data to be added</div>
      </div>
    </div>
  )
}

export default KpiChartsComponent
