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
    const baseUrl = `${currentPath}/frameworks/${frameworkId}/${attributeId}`
    const urlWithQuery = auditData
      ? `${baseUrl}?auditId=${auditData.id}`
      : baseUrl
    router.push(urlWithQuery)
  } // Function to get the audit rule for a specific child
  const getChildAuditRule = (childId: string, framework: IFramework) => {
    if (!auditData) return null

    const attribute = framework.attributes.find((attr) => attr.id === childId)
    if (!attribute?.auditDetails) return null

    const auditDetail = attribute.auditDetails.find(
      (detail) => detail.auditCycleId === auditData.id,
    )

    if (!auditDetail?.auditRuleId) return null

    // Find the rule in framework status
    return (
      framework?.status?.auditRules?.find(
        (rule) => rule.id === auditDetail.auditRuleId,
      ) || null
    )
  }

  // Function to calculate heatmap data for a single child
  const getChildHeatmapData = (childId: string, framework: IFramework) => {
    if (!auditData || !framework?.status?.auditRules) return {}

    const heatmapData: Record<number, number> = {}

    // Initialize all rules with 0 count
    framework.status.auditRules.forEach((rule) => {
      heatmapData[rule.id] = 0
    })

    // Get the audit rule for this specific child
    const auditRule = getChildAuditRule(childId, framework)
    if (auditRule) {
      heatmapData[auditRule.id] = 1
    }

    return heatmapData
  }

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
                  <div className="flex flex-col gap-4">
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
                      <div className="flex flex-wrap items-center justify-start gap-x-2 gap-y-5">
                        {firstColumnAttributes
                          .sort((a, b) => (a.rowIndex || 0) - (b.rowIndex || 0))
                          .map((parent) => {
                            return (
                              <div key={parent.id} className="border bg-white">
                                <div className="mb-3 border-b-2 bg-primary px-4 py-2 text-center text-white">
                                  {parent.value}
                                </div>
                                <div className="flex flex-wrap gap-1 p-1">
                                  {(childrenByParent[parent.id] || []).map(
                                    (child) => {
                                      const childHeatmapData =
                                        getChildHeatmapData(child.id, framework)
                                      return (
                                        <div
                                          key={child.id}
                                          className="flex flex-col"
                                        >
                                          <div
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
                                          {/* Individual heatmap for this child */}
                                          {auditData &&
                                            framework?.status?.auditRules && (
                                              <div className="mt-1 flex gap-1">
                                                {framework.status.auditRules.map(
                                                  (rule) => {
                                                    const count =
                                                      childHeatmapData[
                                                        rule.id
                                                      ] || 0
                                                    return (
                                                      <div
                                                        key={rule.id}
                                                        className="flex h-6 flex-1 items-center justify-center rounded text-xs font-bold text-white"
                                                        style={{
                                                          backgroundColor:
                                                            rule.color ||
                                                            '#ccc',
                                                        }}
                                                        title={`${rule.label}: ${count > 0 ? 'Applied' : 'Not Applied'}`}
                                                      >
                                                        {count}
                                                      </div>
                                                    )
                                                  },
                                                )}
                                              </div>
                                            )}
                                        </div>
                                      )
                                    },
                                  )}{' '}
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
                                    .map((child) => {
                                      const childHeatmapData =
                                        getChildHeatmapData(child.id, framework)
                                      return (
                                        <div
                                          key={`fallback-${child.id}`}
                                          className="flex flex-col"
                                        >
                                          <div
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
                                          {/* Individual heatmap for this child */}
                                          {auditData &&
                                            framework?.status?.auditRules && (
                                              <div className="mt-1 flex gap-1">
                                                {framework.status.auditRules.map(
                                                  (rule) => {
                                                    const count =
                                                      childHeatmapData[
                                                        rule.id
                                                      ] || 0
                                                    return (
                                                      <div
                                                        key={rule.id}
                                                        className="flex h-6 flex-1 items-center justify-center rounded text-xs font-bold text-white"
                                                        style={{
                                                          backgroundColor:
                                                            rule.color ||
                                                            '#ccc',
                                                        }}
                                                        title={`${rule.label}: ${count > 0 ? 'Applied' : 'Not Applied'}`}
                                                      >
                                                        {count}
                                                      </div>
                                                    )
                                                  },
                                                )}
                                              </div>
                                            )}
                                        </div>
                                      )
                                    })}
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    </div>
                    <div className="flex items-center justify-start gap-1">
                      {auditData &&
                        framework?.status?.auditRules?.map((rule) => (
                          <div
                            key={rule.id}
                            className="flex h-8 w-fit min-w-40 items-center justify-center rounded-sm"
                            style={{
                              backgroundColor: rule.color || '#ccc',
                            }}
                          >
                            <span className="p-2 text-sm font-semibold text-white">
                              {rule.label}
                            </span>
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
