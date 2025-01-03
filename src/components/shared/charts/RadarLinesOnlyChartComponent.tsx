'use client'

import {
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
} from 'recharts'
import CustomCardHeader from '../cards/CustomCardHeader'

import { Card, CardContent } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { IChartData } from '@/types/kpi'
import NoResultFound from '../NoResultFound'

interface IRadarLinesOnlyChartComponentProps<T> {
  title: string
  description?: string
  year: string
  chartConfig: ChartConfig
  chartData: Array<T>
  isMultipleData?: boolean
}

const RadarLinesOnlyChartComponent = <T,>({
  title,
  description,
  year,
  chartData,
  chartConfig,
}: IRadarLinesOnlyChartComponentProps<T>) => {
  return (
    <Card className="w-full max-w-2xl">
      <CustomCardHeader title={title} description={description} />
      {chartData && chartData.length > 0 ? (
        <CardContent>
          <ChartContainer config={chartConfig}>
            <RadarChart data={chartData}>
              <CartesianGrid vertical={false} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <PolarAngleAxis
                dataKey={(item: IChartData) => {
                  if ('month' in item) return item.month
                  if ('quarter' in item) return item.quarter
                  if ('semiAnnual' in item) return item.semiAnnual
                  if ('year' in item) return item.year
                  return ''
                }}
              />
              <PolarGrid />
              {Object.entries(chartConfig || {}).map(([key, config]) => {
                return (
                  <Radar
                    key={key}
                    dataKey={key}
                    fill={config.color}
                    fillOpacity={0}
                    stroke={config.color}
                    strokeWidth={2}
                  />
                )
              })}
            </RadarChart>
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

export default RadarLinesOnlyChartComponent
