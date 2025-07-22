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
import { uploadFilesGenerally } from '@/lib/local-upload'
import { convertToArabicNumerals } from '@/lib/utils'
import {
  IDashboardKPIs,
  IDashboardKPIWithKPIs,
  ISingleDashboardResponse,
} from '@/types/dashboard'
import { IMultipleChartData } from '@/types/kpi'
import { ChartTypes, Frequency } from '@prisma/client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createHash } from 'crypto'
import html2canvas from 'html2canvas-pro'
import * as domtoimage from 'dom-to-image-more'
import { Loader2, Scan } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { FC, useRef, useState } from 'react'

interface ISingleDashboardComponentProps {
  dashboardId: number
}

const SingleDashboardComponent: FC<ISingleDashboardComponentProps> = ({
  dashboardId,
}) => {
  const t = useTranslations('general')
  const isArabic = usePathname().includes('/ar')
  const queryClient = useQueryClient()

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

  // Check if there's any data to display for screenshot
  const hasVisibleData =
    data?.dashboardKPIs?.some((kpiItem) => {
      const singleChartData = transformKPIData(
        kpiItem.kpi,
        selectedYear,
        selectedFrequency,
      )
      return singleChartData.length > 0
    }) && data?.dashboardKPIs?.length > 0

  const multipleChartConfig = {
    actual: {
      label: 'Actual',
      color: 'var(--primary)',
    },
    target: {
      label: 'Target',
      color: 'var(--secondary)',
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

      let imageBlob: Blob

      try {
        // First try with dom-to-image-more for better Arabic text handling
        const dataUrl = await domtoimage.toPng(componentRef.current, {
          quality: 1.0,
          bgColor: '#ffffff',
          style: {
            fontFeatureSettings: '"liga" 1, "kern" 1',
            textRendering: 'optimizeLegibility',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            ...(isArabic && {
              direction: 'rtl',
              unicodeBidi: 'bidi-override',
            }),
          },
          filter: (node) => {
            // Skip elements that might cause rendering issues
            if (node instanceof Element) {
              return !node.classList?.contains('no-screenshot')
            }
            return true
          },
        })

        // Convert data URL to blob
        const response = await fetch(dataUrl)
        imageBlob = await response.blob()
      } catch (domError) {
        console.warn(
          'dom-to-image failed, falling back to html2canvas:',
          domError,
        )

        // Fallback to html2canvas with enhanced options
        const canvas = await html2canvas(componentRef.current, {
          allowTaint: true,
          useCORS: true,
          scale: 2, // Higher resolution for better text quality
          logging: false,
          foreignObjectRendering: true, // Better support for complex layouts
          ignoreElements: (element) => {
            // Skip elements that might cause rendering issues
            return element.classList?.contains('no-screenshot') || false
          },
          onclone: (clonedDoc) => {
            // Apply additional styles to the cloned document for better Arabic rendering
            const style = clonedDoc.createElement('style')
            style.textContent = `
              * {
                font-feature-settings: "liga" 1, "kern" 1;
                text-rendering: optimizeLegibility;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
              }
              [dir="rtl"] {
                direction: rtl !important;
                text-align: right !important;
              }
              [dir="rtl"] * {
                direction: rtl !important;
                unicode-bidi: bidi-override !important;
              }
            `
            clonedDoc.head.appendChild(style)

            // Ensure all Arabic text elements have proper direction
            const rtlElements = clonedDoc.querySelectorAll(
              '[dir="rtl"], [dir="rtl"] *',
            )
            rtlElements.forEach((el) => {
              if (el instanceof HTMLElement) {
                el.style.direction = 'rtl'
                el.style.textAlign = 'right'
                el.style.unicodeBidi = 'bidi-override'
              }
            })
          },
        })

        imageBlob = await new Promise<Blob>(
          (resolve) =>
            canvas.toBlob((blob) => resolve(blob!), 'image/png', 1.0), // Maximum quality
        )
      }

      const file = new File([imageBlob], `${dashboardId}-screenshot.png`, {
        type: 'image/png',
      })

      // Upload the file using local storage
      const uploadResponse = await uploadFilesGenerally('imageUploader', {
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
        // Invalidate and refetch the dashboard data to show the new screenshot
        await queryClient.invalidateQueries({
          queryKey: ['dashboard', dashboardId],
        })

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

  const dashboardDescription = t('dashboard-text')

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
            description={`${dashboardDescription} ${isArabic ? convertToArabicNumerals(parseInt(selectedYear)) : selectedYear}`}
            year={selectedYear}
            chartData={singleChartData}
            chartConfig={multipleChartConfig}
          />
        )
      case 'pie':
        return (
          <PieChartComponent
            title={kpiItem.kpi.name}
            description={`${dashboardDescription} ${isArabic ? convertToArabicNumerals(parseInt(selectedYear)) : selectedYear}`}
            year={selectedYear}
            chartData={singleChartData}
            config={multipleChartConfig}
          />
        )
      case 'line':
        return (
          <LineChartComponent
            title={kpiItem.kpi.name}
            description={`${dashboardDescription} ${isArabic ? convertToArabicNumerals(parseInt(selectedYear)) : selectedYear}`}
            year={selectedYear}
            chartData={singleChartData}
            chartConfig={multipleChartConfig}
          />
        )
      case 'area':
        return (
          <AreaChartComponent
            title={kpiItem.kpi.name}
            description={`${dashboardDescription} ${isArabic ? convertToArabicNumerals(parseInt(selectedYear)) : selectedYear}`}
            year={selectedYear}
            chartData={singleChartData}
            chartConfig={multipleChartConfig}
          />
        )
      case 'barStacked':
        return (
          <StackedBarChartComponent
            title={kpiItem.kpi.name}
            description={`${dashboardDescription} ${isArabic ? convertToArabicNumerals(parseInt(selectedYear)) : selectedYear}`}
            year={selectedYear}
            chartData={singleChartData}
            chartConfig={multipleChartConfig}
          />
        )
      default:
        return (
          <BarChartComponent
            title={kpiItem.kpi.name}
            description={`${dashboardDescription} ${isArabic ? convertToArabicNumerals(parseInt(selectedYear)) : selectedYear}`}
            year={selectedYear}
            chartData={singleChartData}
            chartConfig={multipleChartConfig}
          />
        )
    }
  }

  return (
    <div className="flex w-full flex-col gap-10" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="flex w-full items-center justify-end gap-5">
        <BasicDropdown
          placeholder={t('filter-by-frequency')}
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
        style={{
          fontFeatureSettings: '"liga" 1, "kern" 1',
          textRendering: 'optimizeLegibility',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          ...(isArabic && {
            direction: 'rtl',
            unicodeBidi: 'bidi-override',
          }),
        }}
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
        {hasVisibleData && (
          <Tooltips
            content={t('take-screenshot')}
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
        )}
        {screenShots && screenShots?.length > 0 && (
          <Button size="lg" onClick={() => setIsModalOpen(true)}>
            {t('show-screenshots')}
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
