'use client'

import IndicatorForm from '@/components/forms/IndicatorForm'
import PageHeader from '@/components/shared/headers/PageHeader'
import NoResultFound from '@/components/shared/NoResultFound'
import SheetComponent from '@/components/shared/sheets/SheetComponent'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getAllIndicators } from '@/lib/actions/indicator.actions'
import { useGlobalStore } from '@/stores/global-store'
import { SheetNames, useSheetStore } from '@/stores/sheet-store'
import { IMongoIndicator } from '@/types/indicator'
import { useQuery } from '@tanstack/react-query'
import { BadgeCheck, Loader2, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { FC, useEffect, useMemo } from 'react'

const Indicators: FC = () => {
  const pageStaticData = {
    title: 'frameworks',
    description: 'framework-description',
    sheetName: 'indicators',
  }

  const t = useTranslations('general')
  const pathname = usePathname()
  const isArabic = pathname.includes('/ar')
  const router = useRouter()

  const { actions, isEdit, rowId } = useSheetStore((store) => store)
  const { openSheet, setSearchTerm } = actions
  const { hasPermission } = useGlobalStore((store) => store)

  const { data, isLoading } = useQuery({
    queryKey: ['indicators'],
    queryFn: async () => await getAllIndicators(),
    staleTime: 5 * 60 * 1000, // 2 minutes
  })

  const entityData = useMemo(() => data ?? [], [data])

  const singleEntityData = isEdit
    ? (entityData.find((r) => r._id === rowId) as IMongoIndicator | undefined)
    : undefined

  const localizedTitle = t('framework')

  useEffect(() => {
    setSearchTerm('')
  }, [setSearchTerm])

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="flex w-full flex-col items-start gap-[1.875rem]"
    >
      <PageHeader
        title={pageStaticData.title}
        description={pageStaticData.description}
        iconWrapper="bg-primary"
        icon={<BadgeCheck className="text-primary-foreground" />}
      >
        <SheetComponent
          sheetName={pageStaticData.sheetName as SheetNames}
          title={
            isEdit
              ? `${t('edit')} ${localizedTitle}`
              : `${t('add-new')} ${localizedTitle}`
          }
          subtitle={
            isEdit
              ? `${t('edit')} ${localizedTitle} ${t('here')}`
              : `${t('define-new')} ${localizedTitle}`
          }
          className="w-full !max-w-[80vw]"
        >
          <IndicatorForm
            data={singleEntityData as unknown as IMongoIndicator}
          />
        </SheetComponent>
        {hasPermission && (
          <Button
            variant="default"
            onClick={() =>
              openSheet({
                sheetToOpen: pageStaticData.sheetName as SheetNames,
                isEdit: false,
              })
            }
            className="flex size-[2.375rem] items-center justify-center !gap-[0.38rem] px-3 lg:h-11 lg:w-fit 2xl:w-[13.75rem]"
          >
            <Plus size="24" className="text-primary-foreground" />
            <span className="hidden text-sm font-medium lg:flex">
              {t('add-new') + ' ' + localizedTitle}
            </span>
          </Button>
        )}
      </PageHeader>

      <div className="flex w-full flex-col gap-[1.88rem]">
        {isLoading ? (
          <div className="flex min-h-[200px] w-full items-center justify-center">
            <Loader2 className="size-16 animate-spin" />
          </div>
        ) : entityData && entityData.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {entityData.map((indicator) => (
              <Card
                key={indicator._id}
                className="flex cursor-pointer items-center justify-center p-4 hover:bg-muted/50"
                onClick={() => router.push(`/indicators/${indicator._id}`)}
              >
                <span className="text-base font-medium">{indicator.name}</span>
              </Card>
            ))}
          </div>
        ) : (
          <NoResultFound label={`No ${pageStaticData?.title} yet.`} />
        )}
      </div>
    </div>
  )
}

export default Indicators
