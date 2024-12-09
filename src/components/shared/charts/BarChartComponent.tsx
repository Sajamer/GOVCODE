'use client'

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import CustomCardHeader from '../cards/CustomCardHeader'

import { Card, CardContent } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

interface IBarChartComponentProps<T> {
  title: string
  description?: string
  year: string
  chartConfig: ChartConfig
  chartData: Array<T>
  callback: (option: IDropdown) => void
}

const BarChartComponent = <T,>({
  title,
  description,
  year,
  chartData,
  chartConfig,
  callback,
}: IBarChartComponentProps<T>) => {
  return (
    <Card>
      <CustomCardHeader
        title={title}
        description={description}
        year={year}
        callback={callback}
      />
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="target" fill="var(--color-target)" radius={4} />
            {/* <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} /> */}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default BarChartComponent
