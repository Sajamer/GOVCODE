'use client'

import { Pie, PieChart } from 'recharts'

import { Card, CardContent } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { IChartData } from '@/types/kpi'
import CustomCardHeader from '../cards/CustomCardHeader'
import NoResultFound from '../NoResultFound'

interface IPieChartComponentProps<T> {
  title: string
  config: ChartConfig
  year: string
  description?: string
  chartData: Array<T>
}

const PieChartComponent = <T,>({
  config,
  title,
  year,
  description,
  chartData,
}: IPieChartComponentProps<T>) => {
  console.log(chartData)

  const colors = [
    '#ef4444',
    '#f97316',
    '#a3e635',
    '#0369a1',
    '#059669',
    '#33FFF3',
    '#8b5cf6',
    '#FF5733',
    '#e11d48',
    '#94a3b8',
    '#facc15',
    '#581845',
  ]

  const updatedChartData = chartData?.map((item, index) => ({
    ...item,
    fill: colors[index % colors.length], // Cycle through colors if more than 12 items
  }))

  return (
    <Card className="flex w-full flex-col">
      <CustomCardHeader title={title} description={description} />
      {updatedChartData && updatedChartData.length > 0 ? (
        <CardContent>
          <ChartContainer
            config={config}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Pie
                data={updatedChartData}
                dataKey="actual"
                outerRadius={60}
                nameKey={(item: IChartData) => {
                  if ('month' in item) return item.month
                  if ('quarter' in item) return item.quarter
                  if ('semiAnnual' in item) return item.semiAnnual
                  if ('year' in item) return item.year
                  return ''
                }}
              />
              <Pie
                data={updatedChartData}
                dataKey="target"
                innerRadius={70}
                outerRadius={90}
                nameKey={(item: IChartData) => {
                  if ('month' in item) return item.month
                  if ('quarter' in item) return item.quarter
                  if ('semiAnnual' in item) return item.semiAnnual
                  if ('year' in item) return item.year
                  return ''
                }}
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      ) : (
        <NoResultFound
          label={`No results found for the year ${year}`}
          wrapperStyle="min-h-[300px]"
        />
      )}
    </Card>
  )
}

export default PieChartComponent
