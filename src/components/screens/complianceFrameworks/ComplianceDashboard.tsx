import CustomCardHeader from '@/components/shared/cards/CustomCardHeader'
import { Card, CardContent } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  getAuditDetailsByAttachment,
  getAuditDetailsByOwner,
  getAuditDetailsByOwnerAndStatus,
  getAuditDetailsByStatus,
  getColumnRowCounts,
  getUniqueAuditStatuses,
} from '@/lib/utils'
import { IFramework } from '@/types/framework'
import { FC } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts'

interface IComplianceDashboardProps {
  framework: IFramework
}

const ComplianceDashboard: FC<IComplianceDashboardProps> = ({ framework }) => {
  const columnRowCounts = getColumnRowCounts(framework.attributes)
  const auditDetailsByOwner = getAuditDetailsByOwner(framework)
  const auditDetailsByAttachment = getAuditDetailsByAttachment(framework)
  const auditDetailsByStatus = getAuditDetailsByStatus(framework)
  const auditDetailsByOwnerAndStatus =
    getAuditDetailsByOwnerAndStatus(framework)
  const uniqueAuditStatuses = getUniqueAuditStatuses(framework)

  // Calculate global total of all evidences across all owners
  const globalTotalEvidences = auditDetailsByOwnerAndStatus.reduce(
    (total, ownerData) => total + ownerData.total,
    0,
  )

  // Chart configuration for the owner-status bar chart
  const ownerStatusChartConfig: ChartConfig = uniqueAuditStatuses.reduce(
    (config, status) => {
      config[status.label] = {
        label: status.label,
        color: status.color,
      }
      return config
    },
    {} as ChartConfig,
  )

  // Chart configuration for the bar chart
  const chartConfig: ChartConfig = {
    count: {
      label: 'Audit Details Count',
      color: 'var(--primary)',
    },
  }

  // Chart configuration for the pie chart
  const pieChartConfig: ChartConfig = {
    withAttachments: {
      label: 'With Attachments',
      color: 'hsl(var(--chart-1))',
    },
    withoutAttachments: {
      label: 'Without Attachments',
      color: 'hsl(var(--chart-2))',
    },
  }

  // Chart configuration for the status pie chart
  const statusChartConfig: ChartConfig = auditDetailsByStatus.reduce(
    (config, item) => {
      config[item.name] = {
        label: item.name,
        color: item.fill,
      }
      return config
    },
    {} as ChartConfig,
  )

  return (
    <div className="mt-5 flex flex-col items-start justify-start gap-5">
      <div className="flex w-full items-center justify-center gap-3 text-center">
        {columnRowCounts.map((column, index) => (
          <div
            key={index}
            className="flex-1 rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
          >
            <h3 className="font-medium text-muted-foreground">{column.name}</h3>
            <p className="text-2xl font-bold">{column.total}</p>
          </div>
        ))}
      </div>
      <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="w-full">
          <CustomCardHeader
            title="Audit Details by Owner"
            description="Distribution of audit details across different owners"
          />
          <CardContent className="w-full p-0">
            <ChartContainer
              config={chartConfig}
              className="aspect-square max-h-[320px] w-full 3xl:max-h-[500px]"
            >
              <BarChart accessibilityLayer data={auditDetailsByOwner}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="owner"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) =>
                    value.length > 10 ? `${value.slice(0, 10)}...` : value
                  }
                />
                <YAxis />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CustomCardHeader
            title="Audit Details by Attachment Status"
            description="Distribution of audit details based on attachment status"
          />
          <CardContent>
            <ChartContainer
              config={pieChartConfig}
              className="mx-auto aspect-square max-h-[350px] 3xl:max-h-[500px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent nameKey="name" hideLabel />}
                />
                <Pie
                  data={auditDetailsByAttachment}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  paddingAngle={5}
                />
                <Legend
                  verticalAlign="bottom"
                  height={50}
                  layout="horizontal"
                  align="center"
                  wrapperStyle={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: '20px',
                  }}
                  iconType="wye"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CustomCardHeader
            title="Audit Details by Status"
            description="Distribution of audit details based on audit rules/status"
          />
          <CardContent>
            <ChartContainer
              config={statusChartConfig}
              className="mx-auto aspect-square max-h-[350px] 3xl:max-h-[500px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent nameKey="name" hideLabel />}
                />
                <Pie
                  data={auditDetailsByStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  paddingAngle={5}
                />
                <Legend
                  verticalAlign="bottom"
                  height={50}
                  layout="horizontal"
                  align="center"
                  wrapperStyle={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: '20px',
                  }}
                  iconType="circle"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {auditDetailsByOwnerAndStatus.map((ownerData, index) => {
          // Transform owner's status data for individual bar chart
          // Include ALL unique audit statuses, even if count is 0 for this owner
          const ownerChartData = uniqueAuditStatuses.map((statusInfo) => ({
            status: statusInfo.label,
            count: ownerData.statusCounts[statusInfo.label] || 0,
            fill: statusInfo.color,
          }))

          return (
            <Card key={index} className="w-full">
              <CustomCardHeader
                title={`${ownerData.owner}`}
                description={`Total evidences: ${globalTotalEvidences}`}
              />
              <CardContent className="w-full p-0">
                <ChartContainer
                  config={ownerStatusChartConfig}
                  className="h-[250px] w-full"
                >
                  <BarChart accessibilityLayer data={ownerChartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="status"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) =>
                        value.length > 8 ? `${value.slice(0, 8)}...` : value
                      }
                    />
                    <YAxis />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                    />
                    <Bar
                      dataKey="count"
                      fill="hsl(var(--chart-1))"
                      radius={4}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default ComplianceDashboard
