'use client'

import ComplianceFrameworkForm from '@/components/forms/ComplianceFrameworkForm'
import PageHeader from '@/components/shared/headers/PageHeader'
import NoResultFound from '@/components/shared/NoResultFound'
import SheetComponent from '@/components/shared/sheets/SheetComponent'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getAllFrameworks } from '@/lib/actions/framework.actions'
import { cn } from '@/lib/utils'
import { useGlobalStore } from '@/stores/global-store'
import { SheetNames, useSheetStore } from '@/stores/sheet-store'
import { IFrameworkAttribute } from '@/types/framework'
import { useQuery } from '@tanstack/react-query'
import { BadgeCheck, Loader2, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { FC, useEffect } from 'react'

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
          <div className={cn('w-full', isArabic ? 'pr-2' : 'pl-2')}>
            {frameworks.map((framework) => (
              <Card
                key={framework.id}
                className="flex flex-col space-y-4 border-none bg-transparent p-0 shadow-none"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{framework.name}</h3>
                </div>

                {framework.attributes.length > 0 && (
                  <div className="grid w-full grid-cols-1 gap-4">
                    {(() => {
                      // Group attributes by column index - no deduplication needed
                      const attributesByColumn: Record<
                        number,
                        IFrameworkAttribute[]
                      > = {}

                      framework.attributes.forEach((attr) => {
                        const colIndex = attr.colIndex || 0
                        if (!attributesByColumn[colIndex]) {
                          attributesByColumn[colIndex] = []
                        }
                        attributesByColumn[colIndex].push(attr)
                      }) // Get first column attributes (parents) - deduplicate by value and keep unique parents
                      const allFirstColumnAttributes =
                        attributesByColumn[0] || []
                      const uniqueParentValues = new Set<string>()
                      const firstColumnAttributes =
                        allFirstColumnAttributes.filter((attr) => {
                          if (!uniqueParentValues.has(attr.value || '')) {
                            uniqueParentValues.add(attr.value || '')
                            return true
                          }
                          return false
                        })

                      // Create a mapping from parent value to parent ID for child matching
                      const parentValueToId = new Map<string, string>()
                      allFirstColumnAttributes.forEach((attr) => {
                        parentValueToId.set(attr.value || '', attr.id)
                      }) // Get all second column attributes (children) - deduplicate by value globally
                      const allSecondColumnAttributes =
                        attributesByColumn[1] || []
                      const uniqueSecondColumnValues = new Set<string>()
                      const secondColumnAttributes =
                        allSecondColumnAttributes.filter((attr) => {
                          if (!uniqueSecondColumnValues.has(attr.value || '')) {
                            uniqueSecondColumnValues.add(attr.value || '')
                            return true
                          }
                          return false
                        }) // Group second column attributes by parentId (no need for additional uniqueness check)
                      const childrenByParent: Record<
                        string,
                        IFrameworkAttribute[]
                      > = {}

                      secondColumnAttributes.forEach((attr) => {
                        if (attr.parentId) {
                          if (!childrenByParent[attr.parentId]) {
                            childrenByParent[attr.parentId] = []
                          }
                          childrenByParent[attr.parentId].push(attr)
                        }
                      }) // Also try to match by parent value if parentId doesn't work
                      const childrenByParentValue: Record<
                        string,
                        IFrameworkAttribute[]
                      > = {}
                      firstColumnAttributes.forEach((parent) => {
                        const parentId = parent.id
                        childrenByParentValue[parent.value || ''] =
                          childrenByParent[parentId] || []
                      })

                      const firstColumnName =
                        firstColumnAttributes[0]?.name || ''
                      const secondColumnName =
                        secondColumnAttributes[0]?.name || ''

                      return (
                        <div className="flex items-end gap-2">
                          <div className="flex max-w-48 flex-col items-start justify-end text-center text-white">
                            <div className="w-full border-b-2 bg-primary p-1.5 text-sm">
                              {firstColumnName}
                            </div>
                            <div className="w-full bg-[#266a55]/60 p-2 text-sm text-white">
                              {secondColumnName}
                            </div>
                          </div>
                          <div className="grid md:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4">
                            {firstColumnAttributes
                              .sort(
                                (a, b) => (a.rowIndex || 0) - (b.rowIndex || 0),
                              )
                              .map((parent) => (
                                <div
                                  key={parent.id}
                                  className="border bg-white"
                                >
                                  <div className="mb-3 border-b-2 bg-primary p-1 text-center text-white">
                                    {parent.value}
                                  </div>
                                  <div className="flex flex-wrap gap-1 p-1">
                                    {(childrenByParent[parent.id] || []).map(
                                      (child) => (
                                        <div
                                          key={child.id}
                                          onClick={() => {}}
                                          className="cursor-pointer rounded bg-[#266a55]/60 p-2 text-sm text-white hover:underline hover:underline-offset-1"
                                        >
                                          {child.value}
                                        </div>
                                      ),
                                    )}
                                    {/* Fallback: Also check if any children reference this parent by value */}
                                    {secondColumnAttributes
                                      .filter((attr) => {
                                        // Find parent in all first column attributes that matches current parent value
                                        const matchingParent =
                                          allFirstColumnAttributes.find(
                                            (p) =>
                                              p.value === parent.value &&
                                              p.id === attr.parentId,
                                          )
                                        return (
                                          matchingParent &&
                                          !childrenByParent[parent.id]?.some(
                                            (c) => c.id === attr.id,
                                          )
                                        )
                                      })
                                      .map((child) => (
                                        <div
                                          key={`fallback-${child.id}`}
                                          onClick={() => {}}
                                          className="cursor-pointer rounded bg-[#266a55]/60 p-2 text-sm text-white hover:underline hover:underline-offset-1"
                                        >
                                          {child.value}
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}
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
