'use client'

import { cn } from '@/lib/utils'
import {
  IFramework,
  IFrameworkAttribute,
  IFrameWorkAuditCycle,
} from '@/types/framework'
import { usePathname, useRouter } from 'next/navigation'
import { FC } from 'react'

interface IComplianceMapViewProps {
  frameworks: IFramework[]
  auditData?: IFrameWorkAuditCycle | null
}

const ComplianceMapView: FC<IComplianceMapViewProps> = ({
  frameworks,
  auditData,
}) => {
  const router = useRouter()
  const pathname = usePathname()

  const handleAttributeClick = (frameworkId: string, attributeId: string) => {
    const currentPath = pathname.split('/').slice(0, -1).join('/')
    router.push(`${currentPath}/frameworks/${frameworkId}/${attributeId}`)
  }

  console.log('auditData:', auditData)

  return (
    <div>
      {frameworks.map((framework) => (
        <div
          key={framework.id}
          className="flex flex-col space-y-4 border-none bg-transparent p-0 shadow-none"
        >
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
                const allFirstColumnAttributes = attributesByColumn[0] || []
                const uniqueParentValues = new Set<string>()
                const firstColumnAttributes = allFirstColumnAttributes.filter(
                  (attr) => {
                    if (!uniqueParentValues.has(attr.value || '')) {
                      uniqueParentValues.add(attr.value || '')
                      return true
                    }
                    return false
                  },
                )

                // Create a mapping from parent value to parent ID for child matching
                const parentValueToId = new Map<string, string>()
                allFirstColumnAttributes.forEach((attr) => {
                  parentValueToId.set(attr.value || '', attr.id)
                }) // Get all second column attributes (children) - deduplicate by value globally
                const allSecondColumnAttributes = attributesByColumn[1] || []
                const uniqueSecondColumnValues = new Set<string>()
                const secondColumnAttributes = allSecondColumnAttributes.filter(
                  (attr) => {
                    if (!uniqueSecondColumnValues.has(attr.value || '')) {
                      uniqueSecondColumnValues.add(attr.value || '')
                      return true
                    }
                    return false
                  },
                ) // Group second column attributes by parentId (no need for additional uniqueness check)
                const childrenByParent: Record<string, IFrameworkAttribute[]> =
                  {}

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

                const firstColumnName = firstColumnAttributes[0]?.name || ''
                const secondColumnName = secondColumnAttributes[0]?.name || ''

                return (
                  <div className="flex items-end gap-2">
                    <div
                      className={cn(
                        'flex flex-col items-start justify-between h-full',
                        !auditData && 'justify-end',
                      )}
                    >
                      {auditData && (
                        <div className="flex flex-col gap-1">
                          <span>
                            <b>Audit:</b>{' '}
                            {auditData?.name.split('-').slice(0, 2).join('-')}
                          </span>
                          <span>
                            <b>Initiated By:</b> {auditData?.user?.fullName}
                          </span>
                          <span>
                            <b>Initiated date:</b> <br />
                            {auditData?.startDate
                              ? new Date(
                                  auditData.startDate,
                                ).toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : ''}
                          </span>
                        </div>
                      )}
                      <div className="flex max-w-48 flex-col items-start justify-end text-center text-white">
                        <div className="w-full border-b-2 bg-primary p-1.5 text-sm">
                          {firstColumnName}
                        </div>
                        <div className="w-full bg-[#266a55]/60 p-2 text-sm text-white">
                          {secondColumnName}
                        </div>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4">
                      {firstColumnAttributes
                        .sort((a, b) => (a.rowIndex || 0) - (b.rowIndex || 0))
                        .map((parent) => (
                          <div key={parent.id} className="border bg-white">
                            <div className="mb-3 border-b-2 bg-primary p-1 text-center text-white">
                              {parent.value}
                            </div>
                            <div className="flex flex-wrap gap-1 p-1">
                              {(childrenByParent[parent.id] || []).map(
                                (child) => (
                                  <div
                                    key={child.id}
                                    onClick={() =>
                                      handleAttributeClick(
                                        framework.id,
                                        child.id,
                                      )
                                    }
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
                                    onClick={() =>
                                      handleAttributeClick(
                                        framework.id,
                                        child.id,
                                      )
                                    }
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
        </div>
      ))}
    </div>
  )
}

export default ComplianceMapView
