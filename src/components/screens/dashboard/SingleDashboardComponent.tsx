'use client'

import AreaChartComponent from '@/components/shared/charts/AreaChartComponent'
import BarChartComponent from '@/components/shared/charts/BarChartComponent'
import LineChartComponent from '@/components/shared/charts/LineChartComponent'
import PieChartComponent from '@/components/shared/charts/PieChartComponent'
import RadarLinesOnlyChartComponent from '@/components/shared/charts/RadarLinesOnlyChartComponent'
import StackedBarChartComponent from '@/components/shared/charts/StackedBarChartComponent'
import BasicDropdown from '@/components/shared/dropdowns/BasicDropdown'
import ImageModal from '@/components/shared/modals/ImageModal'
import Tooltips from '@/components/shared/tooltips/Tooltips'
import { Button } from '@/components/ui/button'
import { getFrequencyOptions } from '@/constants/global-constants'
import { Month, periodsByFrequency } from '@/constants/kpi-constants'
import { toast } from '@/hooks/use-toast'
import {
  checkScreenshotIfExists,
  createScreenshot,
  getDashboardById,
} from '@/lib/actions/dashboard.actions'
import { CustomUser } from '@/lib/auth'
import { uploadFiles } from '@/lib/uploadthing'
import {
  IDashboardKPIs,
  IDashboardKPIWithKPIs,
  ISingleDashboardResponse,
} from '@/types/dashboard'
import { IMultipleChartData } from '@/types/kpi'
import { ChartTypes, Frequency } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import { createHash } from 'crypto'
import html2canvas from 'html2canvas-pro'
import { Loader2, Scan } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { FC, useRef, useState } from 'react'

interface ISingleDashboardComponentProps {
  dashboardId: number
}

const SingleDashboardComponent: FC<ISingleDashboardComponentProps> = ({
  dashboardId,
}) => {
  const t = useTranslations('general')
  const currentYear = new Date().getFullYear()
  const { data: session } = useSession()
  const userData = session?.user as CustomUser | undefined

  const componentRef = useRef<HTMLDivElement>(null)

  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString(),
  )
  const [selectedFrequency, setSelectedFrequency] = useState<
    Frequency | undefined
  >(undefined)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data } = useQuery<ISingleDashboardResponse>({
    queryKey: ['dashboard', dashboardId, selectedYear],
    queryFn: async () => await getDashboardById(dashboardId, selectedYear),
    staleTime: 1000 * 60 * 5,
    enabled: !!dashboardId,
  })

  const frequencyOptions = getFrequencyOptions(t)
  const yearOptions = Array.from({ length: 7 }, (_, i) => {
    const year = currentYear - 2 + i
    return { id: String(year), label: String(year), value: String(year) }
  })

  const localizedYearOptions = yearOptions.map((option) => ({
    ...option,
    label: t(`year-options.${option.label}`),
  }))

  const screenShots = data?.screenshots || []

  const handleYearChange = (option: IDropdown) => {
    setSelectedYear(option.id)
  }

  const transformKPIData = (
    kpi: IDashboardKPIs,
    year: string,
    selectedFrequency?: Frequency,
  ): IMultipleChartData[] => {
    if (selectedFrequency && kpi.frequency !== selectedFrequency) {
      return []
    }
    const KPIActual = kpi.actuals?.filter((a) => a.year === parseInt(year))
    const KPITarget = kpi.targets?.filter((t) => t.year === parseInt(year))
    if (!KPIActual?.length) return []

    switch (kpi.frequency) {
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

  const takeScreenshot = async () => {
    if (!componentRef.current) return
    setIsLoading(true)

    try {
      const hash = createHash('sha256')
        .update(JSON.stringify(data))
        .digest('hex')

      const existingScreenshot = await checkScreenshotIfExists(hash)
      if (existingScreenshot) {
        toast({
          variant: 'warning',
          title: 'Screenshot already exists',
          description: 'Screenshot already exists for this dashboard',
        })
        return
      }

      const canvas = await html2canvas(componentRef.current)
      const imageBlob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((blob) => resolve(blob!), 'image/png'),
      )

      const file = new File([imageBlob], `${dashboardId}-screenshot.png`, {
        type: 'image/png',
      })

      // Upload the file using Uploadthing
      const uploadResponse = await uploadFiles('imageUploader', {
        files: [file],
        input: {
          image: `Screenshot of dashboard ${dashboardId}`,
        },
      })

      if (!uploadResponse || !uploadResponse[0]?.url) {
        throw new Error('Failed to upload screenshot')
      }

      const imageUrl = uploadResponse[0].url

      const screenshot = await createScreenshot({
        userId: userData?.id ?? '',
        image: imageUrl,
        hash,
        dashboardId,
      })

      if (screenshot) {
        toast({
          variant: 'success',
          title: 'Screenshot taken',
          description: 'Screenshot successfully taken',
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Screenshot failed',
        description: `Failed to take screenshot: ${error}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const chartToShow = (
    chartType: ChartTypes,
    kpiItem: IDashboardKPIWithKPIs,
    singleChartData: IMultipleChartData[],
  ) => {
    switch (chartType) {
      case 'radar':
        return (
          <RadarLinesOnlyChartComponent
            title={kpiItem.kpi.name}
            description={`Showing differences between actuals and targets for year ${selectedYear}`}
            year={selectedYear}
            chartData={singleChartData}
            chartConfig={multipleChartConfig}
          />
        )
      case 'pie':
        return (
          <PieChartComponent
            title={kpiItem.kpi.name}
            description={`Showing differences between actuals and targets for year ${selectedYear}`}
            year={selectedYear}
            chartData={singleChartData}
            config={multipleChartConfig}
          />
        )
      case 'line':
        return (
          <LineChartComponent
            title={kpiItem.kpi.name}
            description={`Showing differences between actuals and targets for year ${selectedYear}`}
            year={selectedYear}
            chartData={singleChartData}
            chartConfig={multipleChartConfig}
          />
        )
      case 'area':
        return (
          <AreaChartComponent
            title={kpiItem.kpi.name}
            description={`Showing differences between actuals and targets for year ${selectedYear}`}
            year={selectedYear}
            chartData={singleChartData}
            chartConfig={multipleChartConfig}
          />
        )
      case 'barStacked':
        return (
          <StackedBarChartComponent
            title={kpiItem.kpi.name}
            description={`Showing differences between actuals and targets for year ${selectedYear}`}
            year={selectedYear}
            chartData={singleChartData}
            chartConfig={multipleChartConfig}
          />
        )
      default:
        return (
          <BarChartComponent
            title={kpiItem.kpi.name}
            description={`Showing differences between actuals and targets for year ${selectedYear}`}
            year={selectedYear}
            chartData={singleChartData}
            chartConfig={multipleChartConfig}
          />
        )
    }
  }

  return (
    <div className="flex w-full flex-col gap-10">
      <div className="flex w-full items-center justify-end gap-5">
        <BasicDropdown
          placeholder={'Filter by Frequency'}
          data={frequencyOptions ?? []}
          triggerStyle="h-11"
          defaultValue={frequencyOptions?.find(
            (option) => option.value === selectedFrequency,
          )}
          wrapperStyle="w-48"
          containerStyle="max-w-48 w-full"
          callback={(option) => setSelectedFrequency(option.value as Frequency)}
        />
        <BasicDropdown
          data={localizedYearOptions ?? []}
          triggerStyle="h-11 justify-end"
          wrapperStyle="w-40"
          containerStyle="max-w-40 w-full"
          defaultValue={localizedYearOptions?.find(
            (option) => option.id === selectedYear,
          )}
          callback={handleYearChange}
        />
      </div>
      <div
        ref={componentRef}
        className="grid w-full grid-cols-1 gap-5 md:grid-cols-3"
      >
        {data?.dashboardKPIs?.map((kpiItem, idx) => {
          const singleChartData = transformKPIData(
            kpiItem.kpi,
            selectedYear,
            selectedFrequency,
          )
          if (!singleChartData.length) {
            return null
          }

          return (
            <div
              key={idx}
              className="flex w-full items-start justify-start gap-5"
            >
              {chartToShow(data.chartType, kpiItem, singleChartData)}
            </div>
          )
        })}
      </div>
      <div className="flex w-full items-center justify-end gap-5">
        <Tooltips
          content={'Take screenshot'}
          variant="bold"
          position="left"
          asChild
        >
          <Button
            variant={'icon'}
            size={'icon_sm'}
            className="bg-primary p-0"
            disabled={isLoading}
            onClick={() => takeScreenshot()}
          >
            {isLoading ? (
              <Loader2 className="size-5 animate-spin text-white" />
            ) : (
              <Scan size={20} className="text-white" />
            )}
          </Button>
        </Tooltips>
        {screenShots && screenShots?.length > 0 && (
          <Button size="lg" onClick={() => setIsModalOpen(true)}>
            Show Screenshots
          </Button>
        )}
      </div>

      {isModalOpen && (
        <ImageModal
          screenshots={screenShots}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  )
}

export default SingleDashboardComponent
