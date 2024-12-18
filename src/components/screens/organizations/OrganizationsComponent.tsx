'use client'

import PageHeader from '@/components/shared/headers/PageHeader'
import NoResultFound from '@/components/shared/NoResultFound'
import SheetComponent from '@/components/shared/sheets/SheetComponent'
import { Button } from '@/components/ui/button'
import { SheetNames, useSheetStore } from '@/stores/sheet-store'
import { Building2, Loader2, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { FC, useEffect, useMemo } from 'react'
import OrganizationCard from './OrganizationCard'

interface IOrganizationsComponentProps {
  data: IOrganization[]
}

const OrganizationsComponent: FC<IOrganizationsComponentProps> = ({ data }) => {
  const t = useTranslations('general')
  const pathname = usePathname()
  const isArabic = pathname.includes('/ar')

  const staticPageData = {
    title: 'organizations',
    subTitle: t('organization'),
    description: 'organization-description',
    isLoading: false,
  }

  const { actions, sheetToOpen, isEdit } = useSheetStore((store) => store)
  const { openSheet, setSearchTerm } = actions

  const entityData = useMemo(() => data ?? [], [data])

  useEffect(() => {
    setSearchTerm('')
  }, [setSearchTerm])

  return (
    <>
      <div
        dir={isArabic ? 'rtl' : 'ltr'}
        className="flex w-full flex-col items-start gap-[1.875rem]"
      >
        <PageHeader
          title={staticPageData.title}
          description={staticPageData.description}
          iconWrapper="bg-primary"
          icon={<Building2 className="text-primary-foreground" />}
        >
          <SheetComponent
            sheetName={'organization'}
            title={
              isEdit
                ? `${t('edit')} ${staticPageData.subTitle}`
                : `${t('add-new')} ${staticPageData.subTitle}`
            }
            subtitle={
              isEdit
                ? `${t('edit')} ${staticPageData.subTitle} ${t('here')}`
                : `${t('define-new')} ${staticPageData.subTitle}`
            }
          >
            {sheetToOpen === 'kpis' ? (
              // <KPIForm data={singleEntityData as unknown as IKpiResponse} />
              <>form</>
            ) : null}
          </SheetComponent>
          <Button
            variant="default"
            onClick={() =>
              openSheet({
                sheetToOpen: 'organization' as SheetNames,
                isEdit: false,
              })
            }
            className="flex size-[2.375rem] items-center justify-center !gap-[0.38rem] px-3 lg:h-11 lg:w-fit 2xl:w-[13.75rem]"
          >
            <Plus size="24" className="text-primary-foreground" />
            <span className="hidden text-sm font-medium lg:flex">
              {t('add-new') + ' ' + staticPageData.subTitle}
            </span>
          </Button>
        </PageHeader>
        <div className="flex w-full flex-col gap-[1.88rem]">
          {staticPageData.isLoading ? (
            <div className="flex min-h-[200px] w-full items-center justify-center">
              <Loader2 className="size-16 animate-spin" />
            </div>
          ) : entityData.length > 0 ? (
            <div className="w-full">
              {entityData.map((entity) => (
                <OrganizationCard key={entity.id} data={entity} />
              ))}
            </div>
          ) : (
            <NoResultFound label={`No ${staticPageData.title} yet.`} />
          )}
        </div>
      </div>
    </>
  )
}

export default OrganizationsComponent
