'use client'

import BarChartComponent from '@/components/shared/charts/BarChartComponent'
import { IKpiWithTargetsAndActuals } from '@/types/kpi'
import { FC } from 'react'

interface IKpiChartsComponentProps {
  data: IKpiWithTargetsAndActuals
}

const KpiChartsComponent: FC<IKpiChartsComponentProps> = ({ data }) => {
  console.log('data: ', data)

  const chartData = [
    { month: 'January', target: 186 },
    { month: 'February', target: 305 },
    { month: 'March', target: 237 },
    { month: 'April', target: 73 },
    { month: 'May', target: 209 },
    { month: 'June', target: 214 },
    { month: 'July', target: 273 },
    { month: 'August', target: 303 },
    { month: 'September', target: 331 },
    { month: 'October', target: 362 },
    { month: 'November', target: 393 },
    { month: 'December', target: 425 },
  ]

  const chartConfig = {
    target: {
      label: 'Target',
      color: 'hsl(var(--chart-1))',
    },
  }

  return (
    <div className="grid w-full grid-cols-2 gap-10">
      <div className="flex w-full flex-col gap-5">
        <BarChartComponent
          title="Current Target"
          description="Showing Targets for the selected year"
          year={'2024'}
          chartData={chartData}
          chartConfig={chartConfig}
          callback={(option) => console.log('option: ', option)}
        />
      </div>
      <div>data to be added</div>
    </div>
  )
}

export default KpiChartsComponent
