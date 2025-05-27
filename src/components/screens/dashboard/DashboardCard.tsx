'use client'

import ConfirmationDialog from '@/components/shared/modals/ConfirmationDialog'
import Tooltips from '@/components/shared/tooltips/Tooltips'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { deleteDashboard } from '@/lib/actions/dashboard.actions'
import { useGlobalStore } from '@/stores/global-store'
import { useSheetStore } from '@/stores/sheet-store'
import { IDashboardResponse } from '@/types/dashboard'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit2, Eye, Trash } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import { FC, useState } from 'react'

interface IDashboardCardProps {
  data?: IDashboardResponse
}

const DashboardCard: FC<IDashboardCardProps> = ({ data }) => {
  const queryClient = useQueryClient()
  const t = useTranslations('general')
  const { hasPermission } = useGlobalStore((store) => store)

  const title = data?.name

  const { openSheet } = useSheetStore((store) => store.actions)

  const [openConfirmation, setOpenConfirmation] = useState(false)

  const getChartImage = (chartType?: string) => {
    switch (chartType) {
      case 'bar':
        return '/assets/images/bar.jpg'
      case 'line':
        return '/assets/images/line.jpg'
      case 'pie':
        return '/assets/images/pie.jpg'
      case 'radar':
        return '/assets/images/radar.jpg'
      case 'area':
        return '/assets/images/area.jpg'
      case 'barStacked':
        return '/assets/images/stacked-bar.jpg'
      default:
        return '/assets/images/bar.jpg'
    }
  }

  const { mutate, isPending } = useMutation({
    mutationFn: async () => await deleteDashboard(data?.id ?? 0),
    onSuccess: (deletedData) => {
      queryClient.setQueryData(
        ['dashboards'],
        (oldData: IDashboardResponse[] | undefined) => {
          if (!oldData) return []
          return oldData.filter((item) => item.id !== deletedData.id)
        },
      )
      queryClient.invalidateQueries({ queryKey: ['dashboards'] })
      setOpenConfirmation(false)
      toast({
        variant: 'success',
        title: 'Deleted Successfully',
        description: `${title} successfully deleted`,
      })
    },
    onError: (error) => {
      setOpenConfirmation(false)
      toast({
        variant: 'destructive',
        title: 'Deletion failed',
        description:
          error instanceof Error ? error.message : 'An error occurred.',
      })
    },
  })

  return (
    <>
      <Card className="w-full cursor-pointer">
        <CardHeader>
          <CardTitle>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg capitalize">{data?.name}</h3>
              <div className="flex items-center justify-end gap-2">
                <Tooltips
                  content={t('view')}
                  variant="bold"
                  position="top"
                  asChild
                >
                  <Link
                    href={`/dashboard/${data?.id}`}
                    className="text-gray-700"
                  >
                    <Eye size={20} />
                  </Link>
                </Tooltips>
                {hasPermission && (
                  <>
                    <Tooltips
                      content={t('edit')}
                      variant="bold"
                      position="top"
                      asChild
                    >
                      <button
                        onClick={() =>
                          openSheet({
                            sheetToOpen: 'dashboard',
                            rowId: String(data?.id) ?? '',
                            isEdit: true,
                          })
                        }
                        className="text-gray-700"
                      >
                        <Edit2 size={16} />
                      </button>
                    </Tooltips>
                    <Tooltips
                      content={t('delete')}
                      variant="bold"
                      position="top"
                      asChild
                    >
                      <button
                        onClick={() => setOpenConfirmation(true)}
                        className="text-red-600"
                      >
                        <Trash size={16} />
                      </button>
                    </Tooltips>
                  </>
                )}
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="w-full">
          <div className="relative h-60 w-full overflow-hidden rounded-lg">
            <Image
              src={getChartImage(data?.chartType)}
              alt={`${data?.chartType} chart`}
              fill
              className="bg-cover"
            />
          </div>
        </CardContent>
      </Card>
      <ConfirmationDialog
        title={t('confirm-deletion')}
        subTitle={t('deleteConfirmation', { title })}
        type="destructive"
        open={openConfirmation}
        onClose={() => setOpenConfirmation(false)}
        isLoading={isPending}
        callback={() => mutate()}
      />
    </>
  )
}

export default DashboardCard
