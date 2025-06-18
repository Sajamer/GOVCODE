'use client'

import ComplianceFrameworkForm from '@/components/forms/ComplianceFrameworkForm'
import PageHeader from '@/components/shared/headers/PageHeader'
import AuditDialog from '@/components/shared/modals/AuditDialog'
import NoResultFound from '@/components/shared/NoResultFound'
import SheetComponent from '@/components/shared/sheets/SheetComponent'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getAllAudits } from '@/lib/actions/audit-framework.actions'
import { getAllFrameworks } from '@/lib/actions/framework.actions'
import { cn } from '@/lib/utils'
import { useGlobalStore } from '@/stores/global-store'
import { SheetNames, useSheetStore } from '@/stores/sheet-store'
import { IFrameWorkAuditCycle } from '@/types/framework'
import { useQuery } from '@tanstack/react-query'
import { BadgeCheck, House, Loader2, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { FC, useEffect, useState } from 'react'
import ComplianceListView from './ComplianceListView'
import ComplianceMapView from './ComplianceMapView'

const ComplianceFrameworks: FC = () => {
  const pageStaticData = {
    title: 'compliance-frameworks',
    description: 'compliance-frameworks-description',
    sheetName: 'frameworks',
  }
  const t = useTranslations('general')
  const pathname = usePathname()
  const isArabic = pathname.includes('/ar')
  const { actions } = useSheetStore((store) => store)
  const { openSheet, setSearchTerm } = actions
  const { hasPermission } = useGlobalStore((store) => store)

  const [view, setView] = useState('map')
  const [selectedAudit, setSelectedAudit] =
    useState<IFrameWorkAuditCycle | null>(null)
  const [openAuditDialog, setOpenAuditDialog] = useState({
    open: false,
    frameworkId: '',
    frameworkName: '',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['frameworks'],
    queryFn: async () => getAllFrameworks(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const { data: allAuditsData } = useQuery({
    queryKey: ['all-audits'],
    queryFn: async () => getAllAudits(),
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
          <div className={cn('w-full', isArabic ? 'pr-2' : 'pl-2')}>
            {frameworks.map((framework) => (
              <div key={framework.id} className="mt-5 flex flex-col space-y-4">
                <Card className="border-none bg-transparent p-0 shadow-none">
                  <div className="flex items-center justify-start gap-5">
                    <Button
                      onClick={() => setSelectedAudit(null)}
                      className={cn(
                        !selectedAudit &&
                          'bg-[#266a55]/60 hover:bg-[#266a55]/60',
                      )}
                    >
                      <House className="size-5" />
                      {framework.name}
                    </Button>
                    <Button
                      type="button"
                      onClick={() =>
                        setOpenAuditDialog({
                          open: true,
                          frameworkId: framework.id,
                          frameworkName: framework.name,
                        })
                      }
                    >
                      <span>{t('initiate-audit-cycle')}</span>
                      <Plus className="size-4" />
                    </Button>{' '}
                    {framework.auditCycles &&
                      framework.auditCycles.length > 0 &&
                      framework.auditCycles.map((cycle) => (
                        <Button
                          key={cycle.id}
                          onClick={() => setSelectedAudit(cycle)}
                          className={cn(
                            selectedAudit?.id === cycle?.id &&
                              'bg-[#266a55]/60 hover:bg-[#266a55]/60',
                          )}
                        >
                          {t('audit')}:{' '}
                          {cycle.name.split('-').slice(0, 2).join('-')}
                        </Button>
                      ))}
                    <Button
                      onClick={() => {
                        setView((prev) => (prev === 'map' ? 'list' : 'map'))
                      }}
                    >
                      {view === 'map' ? t('list-view') : t('map-view')}
                    </Button>
                  </div>
                </Card>

                <div className="mt-6">
                  {view === 'map' ? (
                    <ComplianceMapView
                      frameworks={[framework]}
                      auditData={selectedAudit}
                    />
                  ) : (
                    <ComplianceListView frameworks={[framework]} />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <NoResultFound label={t('no-frameworks-yet')} />
        )}
      </div>

      <AuditDialog
        open={openAuditDialog.open}
        frameworkId={openAuditDialog.frameworkId}
        frameworkName={openAuditDialog.frameworkName}
        onClose={() =>
          setOpenAuditDialog({
            open: false,
            frameworkId: '',
            frameworkName: '',
          })
        }
        auditLength={allAuditsData?.length || 0}
      />
    </div>
  )
}

export default ComplianceFrameworks
