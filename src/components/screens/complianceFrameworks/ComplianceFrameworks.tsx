'use client'

import ComplianceFrameworkForm from '@/components/forms/ComplianceFrameworkForm'
import PageHeader from '@/components/shared/headers/PageHeader'
import NoResultFound from '@/components/shared/NoResultFound'
import SheetComponent from '@/components/shared/sheets/SheetComponent'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getAllFrameworks } from '@/lib/actions/framework.actions'
import { useGlobalStore } from '@/stores/global-store'
import { SheetNames, useSheetStore } from '@/stores/sheet-store'
import { useQuery } from '@tanstack/react-query'
import { BadgeCheck, Loader2, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { FC, useEffect } from 'react'

const ComplianceFrameworks: FC = () => {
  const pageStaticData = {
    title: 'compliance-frameworks',
    description: 'compliance-frameworks-description',
    sheetName: 'frameworks',
  }
  const t = useTranslations('general')
  const pathname = usePathname()
  const router = useRouter()

  const isArabic = pathname.includes('/ar')
  const { actions } = useSheetStore((store) => store)
  const { openSheet, setSearchTerm } = actions
  const { hasPermission } = useGlobalStore((store) => store)

  const { data, isLoading } = useQuery({
    queryKey: ['frameworks'],
    queryFn: async () => getAllFrameworks(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const frameworks = data?.frameworks || []
  const localizedTitle = t('compliance-frameworks')

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
          title={`${t('add-new')} ${localizedTitle}`}
          subtitle={`${t('define-new')} ${localizedTitle}`}
        >
          <ComplianceFrameworkForm />
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
            className="flex size-[2.375rem] items-center justify-center !gap-[0.38rem] px-3 lg:h-11 lg:w-fit"
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
        ) : frameworks.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {frameworks.map((framework) => (
              <Card
                key={framework.id}
                className="flex cursor-pointer items-center justify-center p-4 hover:bg-muted/50"
                onClick={() => router.push(`/frameworks/${framework.id}`)}
              >
                <span className="text-base font-medium">{framework.name}</span>
              </Card>
            ))}
          </div>
        ) : (
          <NoResultFound label={t('no-frameworks-yet')} />
        )}
      </div>
    </div>
  )
}

export default ComplianceFrameworks
