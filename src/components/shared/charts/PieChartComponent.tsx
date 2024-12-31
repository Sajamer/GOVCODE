'use client'

import { Pie, PieChart } from 'recharts'

import { Card, CardContent } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
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
  return (
    <Card className="flex flex-col">
      <CustomCardHeader title={title} description={description} />
      {chartData && chartData.length > 0 ? (
        <CardContent>
          <ChartContainer
            config={config}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie data={chartData} dataKey="visitors" nameKey="browser" />
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
