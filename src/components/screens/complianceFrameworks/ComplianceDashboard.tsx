import CustomCardHeader from '@/components/shared/cards/CustomCardHeader'
import { Card, CardContent } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { getColumnRowCounts } from '@/lib/utils'
import {
  IAuditDetails,
  IFramework,
  IFrameworkAttribute,
} from '@/types/framework'
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

// Helper function to process audit details by owner
const getAuditDetailsByOwner = (
  framework: IFramework,
): { owner: string; count: number }[] => {
  // Get all audit details from all attributes and their children
  const getAllAuditDetails = (
    attributes: IFrameworkAttribute[],
  ): IAuditDetails[] => {
    let allAuditDetails: IAuditDetails[] = []

    for (const attribute of attributes) {
      if (attribute.auditDetails && attribute.auditDetails.length > 0) {
        allAuditDetails = [...allAuditDetails, ...attribute.auditDetails]
      }
      if (attribute.children && attribute.children.length > 0) {
        allAuditDetails = [
          ...allAuditDetails,
          ...getAllAuditDetails(attribute.children),
        ]
      }
    }

    return allAuditDetails
  }

  const allAuditDetails = getAllAuditDetails(framework.attributes)

  // Group by owner
  const ownerGroups: { [key: string]: number } = {}

  allAuditDetails.forEach((auditDetail) => {
    const ownerName = auditDetail.owner?.fullName || 'Unassigned'
    ownerGroups[ownerName] = (ownerGroups[ownerName] || 0) + 1
  })

  // Convert to chart data format
  return Object.entries(ownerGroups).map(([owner, count]) => ({
    owner,
    count,
  }))
}

// Helper function to process audit details by attachment status
const getAuditDetailsByAttachment = (
  framework: IFramework,
): { name: string; value: number; fill: string }[] => {
  // Get all audit details from all attributes and their children
  const getAllAuditDetails = (
    attributes: IFrameworkAttribute[],
  ): IAuditDetails[] => {
    let allAuditDetails: IAuditDetails[] = []

    for (const attribute of attributes) {
      if (attribute.auditDetails && attribute.auditDetails.length > 0) {
        allAuditDetails = [...allAuditDetails, ...attribute.auditDetails]
      }
      if (attribute.children && attribute.children.length > 0) {
        allAuditDetails = [
          ...allAuditDetails,
          ...getAllAuditDetails(attribute.children),
        ]
      }
    }

    return allAuditDetails
  }

  const allAuditDetails = getAllAuditDetails(framework.attributes)

  // Count audit details with and without attachments
  let withAttachments = 0
  let withoutAttachments = 0

  allAuditDetails.forEach((auditDetail) => {
    if (auditDetail.attachments && auditDetail.attachments.length > 0) {
      withAttachments++
    } else {
      withoutAttachments++
    }
  })

  return [
    {
      name: 'With Attachments',
      value: withAttachments,
      fill: 'hsl(var(--chart-1))',
    },
    {
      name: 'Without Attachments',
      value: withoutAttachments,
      fill: 'hsl(var(--chart-2))',
    },
  ]
}

// Helper function to process audit details by audit status (audit rules)
const getAuditDetailsByStatus = (
  framework: IFramework,
): { name: string; value: number; fill: string }[] => {
  // Get all audit details from all attributes and their children
  const getAllAuditDetails = (
    attributes: IFrameworkAttribute[],
  ): IAuditDetails[] => {
    let allAuditDetails: IAuditDetails[] = []

    for (const attribute of attributes) {
      if (attribute.auditDetails && attribute.auditDetails.length > 0) {
        allAuditDetails = [...allAuditDetails, ...attribute.auditDetails]
      }
      if (attribute.children && attribute.children.length > 0) {
        allAuditDetails = [
          ...allAuditDetails,
          ...getAllAuditDetails(attribute.children),
        ]
      }
    }

    return allAuditDetails
  }

  const allAuditDetails = getAllAuditDetails(framework.attributes)

  // Group by audit rule/status
  const statusGroups: { [key: string]: { count: number; color: string } } = {}

  allAuditDetails.forEach((auditDetail) => {
    const statusLabel = auditDetail.auditRule.label
    const statusColor = auditDetail.auditRule.color

    if (!statusGroups[statusLabel]) {
      statusGroups[statusLabel] = { count: 0, color: statusColor }
    }
    statusGroups[statusLabel].count++
  })

  // Convert to chart data format
  return Object.entries(statusGroups).map(([label, data]) => ({
    name: label,
    value: data.count,
    fill: data.color,
  }))
}

// Helper function to process audit details by owner and status for grouped bar chart
const getAuditDetailsByOwnerAndStatus = (
  framework: IFramework,
): {
  owner: string
  statusCounts: { [key: string]: number }
  total: number
}[] => {
  // Get all audit details from all attributes and their children
  const getAllAuditDetails = (
    attributes: IFrameworkAttribute[],
  ): IAuditDetails[] => {
    let allAuditDetails: IAuditDetails[] = []

    for (const attribute of attributes) {
      if (attribute.auditDetails && attribute.auditDetails.length > 0) {
        allAuditDetails = [...allAuditDetails, ...attribute.auditDetails]
      }
      if (attribute.children && attribute.children.length > 0) {
        allAuditDetails = [
          ...allAuditDetails,
          ...getAllAuditDetails(attribute.children),
        ]
      }
    }

    return allAuditDetails
  }

  const allAuditDetails = getAllAuditDetails(framework.attributes)

  // Group by owner and then by status
  const ownerStatusGroups: {
    [owner: string]: {
      statusCounts: { [status: string]: number }
      total: number
    }
  } = {}

  allAuditDetails.forEach((auditDetail) => {
    const ownerName = auditDetail.owner?.fullName || 'Unassigned'
    const statusLabel = auditDetail.auditRule.label

    if (!ownerStatusGroups[ownerName]) {
      ownerStatusGroups[ownerName] = { statusCounts: {}, total: 0 }
    }

    if (!ownerStatusGroups[ownerName].statusCounts[statusLabel]) {
      ownerStatusGroups[ownerName].statusCounts[statusLabel] = 0
    }

    ownerStatusGroups[ownerName].statusCounts[statusLabel]++
    ownerStatusGroups[ownerName].total++
  })

  // Convert to chart data format
  return Object.entries(ownerStatusGroups).map(([owner, data]) => ({
    owner,
    statusCounts: data.statusCounts,
    total: data.total,
  }))
}

// Helper function to get unique audit statuses for chart configuration
const getUniqueAuditStatuses = (
  framework: IFramework,
): { label: string; color: string }[] => {
  const getAllAuditDetails = (
    attributes: IFrameworkAttribute[],
  ): IAuditDetails[] => {
    let allAuditDetails: IAuditDetails[] = []

    for (const attribute of attributes) {
      if (attribute.auditDetails && attribute.auditDetails.length > 0) {
        allAuditDetails = [...allAuditDetails, ...attribute.auditDetails]
      }
      if (attribute.children && attribute.children.length > 0) {
        allAuditDetails = [
          ...allAuditDetails,
          ...getAllAuditDetails(attribute.children),
        ]
      }
    }

    return allAuditDetails
  }

  const allAuditDetails = getAllAuditDetails(framework.attributes)
  const uniqueStatuses: { [key: string]: string } = {}

  allAuditDetails.forEach((auditDetail) => {
    const statusLabel = auditDetail.auditRule.label
    const statusColor = auditDetail.auditRule.color
    uniqueStatuses[statusLabel] = statusColor
  })

  return Object.entries(uniqueStatuses).map(([label, color]) => ({
    label,
    color,
  }))
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
