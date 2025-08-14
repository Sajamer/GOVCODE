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
  const colors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
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

  const getNameKey = (item: IChartData) => {
    if ('month' in item) return item.month
    if ('quarter' in item) return item.quarter
    if ('semiAnnual' in item) return item.semiAnnual
    if ('year' in item) return item.year
    return ''
  }

  return (
    <Card className="flex w-full flex-col dark:bg-white dark:text-black">
      <CustomCardHeader title={title} description={description} />
      {updatedChartData && updatedChartData.length > 0 ? (
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={config}
            className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={updatedChartData}
                dataKey="actual"
                nameKey={getNameKey}
                label
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
