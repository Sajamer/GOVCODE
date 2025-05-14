'use client'

import FrameworkForm from '@/components/forms/FrameworkForm'
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
import { usePathname } from 'next/navigation'
import { FC, useEffect } from 'react'

const Frameworks: FC = () => {
  const pageStaticData = {
    title: 'Frameworks',
    description: 'framework-description',
    sheetName: 'frameworks',
  }

  const t = useTranslations('general')
  const pathname = usePathname()
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
  const localizedTitle = t('frameworks')

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
          <FrameworkForm />
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
        ) : frameworks.length > 0 ? (
          <div className="grid gap-4">
            {frameworks.map((framework) => (
              <Card key={framework.id} className="flex flex-col space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{framework.name}</h3>
                </div>
                {framework.attributes.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      {t('attributes')}:
                    </h4>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {Object.entries(
                        framework.attributes.reduce<Record<string, string[]>>(
                          (acc, attr) => {
                            if (!acc[attr.name]) {
                              acc[attr.name] = []
                            }
                            if (attr.value) {
                              acc[attr.name].push(attr.value)
                            }
                            return acc
                          },
                          {},
                        ),
                      ).map(([name, values]: [string, string[]]) => (
                        <div
                          key={name}
                          className="rounded-lg border bg-card p-4"
                        >
                          <div className="font-medium text-card-foreground">
                            {name}
                          </div>
                          <div className="mt-2 space-y-1">
                            {values.map((value, index) => (
                              <div
                                key={`${name}-${index}`}
                                className="text-sm text-muted-foreground"
                              >
                                {value}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

export default Frameworks
