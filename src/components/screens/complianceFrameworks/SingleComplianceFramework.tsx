'use client'

import AuditDialog from '@/components/shared/modals/AuditDialog'
import NoResultFound from '@/components/shared/NoResultFound'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getAllAudits } from '@/lib/actions/audit-framework.actions'
import { getFrameworkById } from '@/lib/actions/framework.actions'
import { cn } from '@/lib/utils'
import { IFrameWorkAuditCycle } from '@/types/framework'
import { useQuery } from '@tanstack/react-query'
import { House, Loader2, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname, useSearchParams } from 'next/navigation'
import { FC, useEffect, useState } from 'react'
import ComplianceDashboard from './ComplianceDashboard'
import ComplianceListView from './ComplianceListView'
import ComplianceMapView from './ComplianceMapView'

const SingleComplianceFramework: FC = () => {
  const t = useTranslations('general')
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const frameworkId = pathname.split('/').pop() || ''
  const isArabic = pathname.includes('/ar')

  // Get auditId from URL query parameters
  const auditIdFromQuery = searchParams.get('auditId')
  const selectedAuditCycleId = auditIdFromQuery
    ? Number(auditIdFromQuery)
    : null

  const [view, setView] = useState<'map' | 'list' | 'dashboard'>('map')
  const [selectedAudit, setSelectedAudit] =
    useState<IFrameWorkAuditCycle | null>(null)
  const [openAuditDialog, setOpenAuditDialog] = useState(false)

  const { data: frameworkData, isLoading } = useQuery({
    queryKey: ['single-framework', frameworkId],
    queryFn: async () => await getFrameworkById(frameworkId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const { data: allAuditsData } = useQuery({
    queryKey: ['all-audits'],
    queryFn: async () => getAllAudits(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Effect to set selected audit based on auditId parameter
  useEffect(() => {
    if (frameworkData && selectedAuditCycleId) {
      const auditCycle = frameworkData.auditCycles?.find(
        (cycle) => cycle.id === selectedAuditCycleId,
      )
      if (auditCycle) {
        setSelectedAudit(auditCycle)
      }
    }
  }, [frameworkData, selectedAuditCycleId])

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="flex w-full flex-col items-start gap-[1.875rem]"
    >
      <div className="flex w-full flex-col gap-[1.88rem]">
        {isLoading ? (
          <div className="flex min-h-[200px] w-full items-center justify-center">
            <Loader2 className="size-16 animate-spin" />
          </div>
        ) : frameworkData ? (
          <div className={cn('w-full', isArabic ? 'pr-2' : 'pl-2')}>
            <div
              key={frameworkData.id}
              className="mt-5 flex flex-col space-y-4"
            >
              <Card className="border-none bg-transparent p-0 shadow-none">
                <div className="flex items-center justify-start gap-5">
                  <Button
                    onClick={() => {
                      setSelectedAudit(null)
                      setView('map')
                    }}
                    dir="auto"
                    className={cn(
                      !selectedAudit && 'bg-[#266a55]/60 hover:bg-[#266a55]/60',
                    )}
                  >
                    <House className="size-5" />
                    {frameworkData.name}
                  </Button>
                  {view === 'map' && (
                    <>
                      <Button
                        type="button"
                        onClick={() => setOpenAuditDialog(true)}
                      >
                        <span>{t('initiate-audit-cycle')}</span>
                        <Plus className="size-4" />
                      </Button>{' '}
                      {frameworkData.auditCycles &&
                        frameworkData.auditCycles.length > 0 &&
                        frameworkData.auditCycles.map((cycle) => (
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
                    </>
                  )}
                  {view === 'dashboard' ? (
                    <Button onClick={() => setView('map')}>
                      {t('back-to-audit-cycle')}
                    </Button>
                  ) : (
                    <Button onClick={() => setView('dashboard')}>
                      {t('dashboard')}
                    </Button>
                  )}
                </div>
              </Card>

              <div className="mt-6">
                {view === 'map' ? (
                  <ComplianceMapView
                    framework={frameworkData}
                    auditData={selectedAudit}
                  />
                ) : view === 'list' ? (
                  <ComplianceListView framework={frameworkData} />
                ) : (
                  <ComplianceDashboard framework={frameworkData} />
                )}
              </div>
            </div>
          </div>
        ) : (
          <NoResultFound label={t('no-frameworks-yet')} />
        )}
      </div>

      <AuditDialog
        open={openAuditDialog}
        frameworkId={frameworkData?.id || ''}
        frameworkName={frameworkData?.name || ''}
        onClose={() => setOpenAuditDialog(false)}
        auditLength={allAuditsData?.length || 0}
      />
    </div>
  )
}

export default SingleComplianceFramework
