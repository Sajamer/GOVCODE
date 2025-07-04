'use client'

import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  IFramework,
  IFrameworkAttribute,
  IFrameWorkAuditCycle,
} from '@/types/framework'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { FC } from 'react'

interface IComplianceMapViewProps {
  framework: IFramework
  auditData?: IFrameWorkAuditCycle | null
}

const ComplianceMapView: FC<IComplianceMapViewProps> = ({
  framework,
  auditData,
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('general')
  const isArabic = usePathname().includes('/ar')

  const handleAttributeClick = (frameworkId: string, attributeId: string) => {
    const currentPath = pathname.split('/').slice(0, -1).join('/')
    const baseUrl = `${currentPath}/${frameworkId}/${attributeId}`
    const urlWithQuery = auditData
      ? `${baseUrl}?auditId=${auditData.id}`
      : baseUrl
    router.push(urlWithQuery)
  }

  // Function to calculate heatmap data by attribute value (aggregating all attributes with same value)
  const getHeatmapDataByValue = (
    attributeValue: string,
    framework: IFramework,
  ) => {
    if (!auditData || !framework?.status?.auditRules) return {}

    const heatmapData: Record<number, number> = {}

    // Initialize all rules with 0 count
    framework.status.auditRules.forEach((rule) => {
      heatmapData[rule.id] = 0
    })

    // Helper function to get all descendants of an attribute
    const getAllDescendants = (parentId: string): IFrameworkAttribute[] => {
      const children = framework.attributes.filter(
        (attr) => attr.parentId === parentId,
      )

      const allDescendants: IFrameworkAttribute[] = []
      for (const child of children) {
        allDescendants.push(child)
        // Recursively get descendants of this child
        allDescendants.push(...getAllDescendants(child.id))
      }

      return allDescendants
    }

    // Get all columns to find the last one
    const columnIndices = [
      ...new Set(framework.attributes.map((attr) => attr.colIndex || 0)),
    ].sort((a, b) => a - b)
    const lastColumnIndex = columnIndices[columnIndices.length - 1] || 0

    // Find all attributes with the same value (these are second column attributes)
    const attributesWithSameValue = framework.attributes.filter(
      (attr) => attr.value === attributeValue,
    )

    // For each attribute with the same value, find its deepest descendants (last column attributes)
    attributesWithSameValue.forEach((attribute) => {
      const descendants = getAllDescendants(attribute.id)

      // Get the deepest level descendants (those that have no children) OR those in the last column
      const lastColumnDescendants = descendants.filter((desc) => {
        const hasNoChildren = !framework.attributes.some(
          (attr) => attr.parentId === desc.id,
        )
        const isInLastColumn = desc.colIndex === lastColumnIndex
        return hasNoChildren || isInLastColumn
      })

      // If no descendants found, use the attribute itself
      const targetAttributes =
        lastColumnDescendants.length > 0 ? lastColumnDescendants : [attribute]

      // Count audit rules for each target attribute
      targetAttributes.forEach((targetAttr) => {
        if (!targetAttr?.auditDetails) return

        const auditDetail = targetAttr.auditDetails.find(
          (detail) => detail.auditCycleId === auditData.id,
        )

        if (auditDetail?.auditRuleId) {
          const auditRule = framework?.status?.auditRules?.find(
            (rule) => rule.id === auditDetail.auditRuleId,
          )

          if (auditRule) {
            heatmapData[auditRule.id] = (heatmapData[auditRule.id] || 0) + 1
          }
        }
      })
    })

    return heatmapData
  }

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="flex flex-col space-y-4 border-none bg-transparent p-0 shadow-none"
    >
      {framework.attributes.length > 0 && (
        <div className="grid w-full grid-cols-1 gap-4">
          {(() => {
            // Get root attributes (those without parents AND from first column only)
            const rootAttributes = framework.attributes.filter(
              (attr) =>
                !attr.parentId &&
                (attr.colIndex === 0 || attr.colIndex === undefined),
            )

            // Create a map of children by parent ID for efficient lookup
            // Only include children from the second column (colIndex 1)
            const childrenByParentId = new Map<string, IFrameworkAttribute[]>()

            framework.attributes.forEach((attr) => {
              if (attr.parentId && attr.colIndex === 1) {
                if (!childrenByParentId.has(attr.parentId)) {
                  childrenByParentId.set(attr.parentId, [])
                }
                childrenByParentId.get(attr.parentId)!.push(attr)
              }
            })

            // Sort children by row index for consistent display
            childrenByParentId.forEach((children) => {
              children.sort((a, b) => (a.rowIndex || 0) - (b.rowIndex || 0))
            })

            const firstColumnName = rootAttributes[0]?.name || ''
            const secondColumnName =
              childrenByParentId.values().next().value?.[0]?.name || ''

            return (
              <div className="flex flex-col gap-4">
                <div className="flex items-center">
                  {auditData && (
                    <div className="flex gap-3">
                      <span>
                        <b>{t('audit')}:</b>{' '}
                        {auditData?.name.split('-').slice(0, 2).join('-')}
                      </span>
                      <span>
                        <b>{t('initiate-by')}:</b> {auditData?.user?.fullName}
                      </span>
                      <span>
                        <b>{t('initiated-date')}:</b>{' '}
                        {auditData?.startDate
                          ? new Date(auditData.startDate).toLocaleDateString(
                              'en-GB',
                              {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              },
                            )
                          : ''}
                      </span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {rootAttributes
                    .sort((a, b) => (a.rowIndex || 0) - (b.rowIndex || 0))
                    .map((parent) => {
                      const children = childrenByParentId.get(parent.id) || []

                      return (
                        <div
                          key={parent.id}
                          className="min-w-[280px] border bg-white"
                        >
                          <div className="mb-3 border-b-2 bg-primary px-4 py-2 text-center text-white">
                            {parent.value}
                          </div>
                          <div className="flex flex-wrap gap-1 p-2 text-center">
                            {children.map((child) => {
                              const childHeatmapData = getHeatmapDataByValue(
                                child.value || '',
                                framework,
                              )
                              return (
                                <div key={child.id} className="flex flex-col">
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
                                              childHeatmapData[rule.id] || 0
                                            return (
                                              <div
                                                key={rule.id}
                                                className="flex h-6 flex-1 items-center justify-center rounded text-xs font-bold text-white"
                                                style={{
                                                  backgroundColor:
                                                    rule.color || '#ccc',
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
                <div className="mt-4 flex w-full items-center justify-start gap-5">
                  <div className="flex items-center justify-center text-center text-white">
                    <div
                      className={cn(
                        'bg-primary py-2 px-5',
                        isArabic ? 'border-l-2' : 'border-r-2',
                      )}
                    >
                      {firstColumnName}
                    </div>
                    <div className="bg-[#266a55]/60 px-5 py-2">
                      {secondColumnName}
                    </div>
                  </div>
                  {auditData && (
                    <Separator
                      orientation="vertical"
                      className="bg-neutral-400"
                    />
                  )}
                  {auditData && (
                    <div className="flex items-center justify-start gap-1">
                      <span className="font-semibold">
                        {t('audit-status')}:{' '}
                      </span>
                      {framework?.status?.auditRules?.map((rule) => (
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
                  )}
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}

export default ComplianceMapView
