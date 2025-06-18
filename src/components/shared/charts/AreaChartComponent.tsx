'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { IChartData } from '@/types/kpi'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import CustomCardHeader from '../cards/CustomCardHeader'
import NoResultFound from '../NoResultFound'

interface IAreaChartComponentProps<T> {
  title: string
  description?: string
  year: string
  chartConfig: ChartConfig
  chartData: Array<T>
}

const AreaChartComponent = <T,>({
  title,
  description,
  year,
  chartData,
  chartConfig,
}: IAreaChartComponentProps<T>) => {
  return (
    <Card className="w-full max-w-2xl dark:bg-white dark:text-black">
      <CustomCardHeader title={title} description={description} />
      {chartData && chartData.length > 0 ? (
        <CardContent>
          <ChartContainer config={chartConfig}>
            <AreaChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey={(item: IChartData) => {
                  if ('month' in item) return item.month
                  if ('quarter' in item) return item.quarter
                  if ('semiAnnual' in item) return item.semiAnnual
                  if ('year' in item) return item.year
                  return ''
                }}
                tickLine={false}
                tickMargin={8}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              {Object.entries(chartConfig || {}).map(([key, config]) => {
                return (
                  <Area
                    key={key}
                    dataKey={key}
                    type="natural"
                    fill={config.color}
                    fillOpacity={0.4}
                    stroke={config.color}
                    stackId="a"
                  />
                )
              })}
            </AreaChart>
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

export default AreaChartComponent
