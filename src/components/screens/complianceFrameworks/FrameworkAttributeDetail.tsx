'use client'

import NoResultFound from '@/components/shared/NoResultFound'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
import {
  IAuditDetailsManipulator,
  saveMultipleAuditDetails,
} from '@/lib/actions/audit-details.actions'
import { getAllFrameworks } from '@/lib/actions/framework.actions'
import { getAllOrganizationUsers } from '@/lib/actions/userActions'
import { CustomUser } from '@/lib/auth'
import { useGlobalStore } from '@/stores/global-store'
import { IFrameworkAttribute } from '@/types/framework'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { House, Loader2, Paperclip, Save } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { FC, useState } from 'react'

interface FrameworkAttributeDetailProps {
  frameworkId: string
  attributeId: string
}

const FrameworkAttributeDetail: FC<FrameworkAttributeDetailProps> = ({
  frameworkId,
  attributeId,
}) => {
  const t = useTranslations('general')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isArabic = pathname.includes('/ar')
  const { data: session } = useSession()
  const userData = session?.user as CustomUser | undefined
  const queryClient = useQueryClient()
  const { organizationId } = useGlobalStore((store) => store)

  // Get auditId from URL query parameters
  const auditIdFromQuery = searchParams.get('auditId')
  const selectedAuditCycleId = auditIdFromQuery
    ? Number(auditIdFromQuery)
    : null

  // State for audit details
  const [auditDetailsData, setAuditDetailsData] = useState<
    Record<string, IAuditDetailsManipulator>
  >({})

  const { data, isLoading } = useQuery({
    queryKey: ['frameworks'],
    queryFn: async () => getAllFrameworks(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const { data: organizationUsers } = useQuery({
    queryKey: ['organization-users', organizationId],
    queryFn: async () =>
      getAllOrganizationUsers({
        organizationId: organizationId?.toString() || '0',
      }),
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000,
  })

  const frameworks = data?.frameworks || []
  const currentFramework = frameworks.find((f) => f.id === frameworkId)

  // Save audit details mutation
  const { mutate: saveAuditDetails, isPending: isSaving } = useMutation({
    mutationFn: async () => {
      const auditDetailsArray = Object.values(auditDetailsData).filter(
        (detail) =>
          detail.frameworkAttributeId &&
          detail.auditCycleId &&
          detail.auditBy &&
          detail.auditRuleId,
      )

      if (auditDetailsArray.length === 0) {
        throw new Error('No valid audit details to save')
      }

      return await saveMultipleAuditDetails(auditDetailsArray)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['frameworks'] })
      toast({
        variant: 'success',
        title: t('success'),
        description: 'Audit details saved successfully',
      })
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: t('error'),
        description:
          error instanceof Error
            ? error.message
            : 'Failed to save audit details',
      })
    },
  })

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] w-full items-center justify-center">
        <Loader2 className="size-16 animate-spin" />
      </div>
    )
  }

  if (!currentFramework) {
    return <NoResultFound label={t('framework-not-found')} />
  }

  // Group attributes by column index
  const attributesByColumn: Record<number, IFrameworkAttribute[]> = {}
  currentFramework.attributes.forEach((attr) => {
    const colIndex = attr.colIndex || 0
    if (!attributesByColumn[colIndex]) {
      attributesByColumn[colIndex] = []
    }
    attributesByColumn[colIndex].push(attr)
  })

  // Find the selected attribute and its children
  const selectedAttribute = currentFramework.attributes.find(
    (attr) => attr.id === attributeId,
  )
  const parentSelectedAttribute = currentFramework.attributes.find(
    (attr) => attr.id === selectedAttribute?.parentId,
  )

  const auditData = currentFramework?.auditCycles?.find(
    (cycle) => cycle.id === selectedAuditCycleId,
  )

  if (!selectedAttribute) {
    return <NoResultFound label={t('attribute-not-found')} />
  }

  // Get all attributes that have the selected attribute as parent (direct children)
  const directChildren = currentFramework.attributes.filter(
    (attr) => attr.value === selectedAttribute.value,
  )

  const getRelatedAttributesFromColumn = (columnIndex: number) => {
    const relatedAttributes: IFrameworkAttribute[] = []

    // Find the index of selected attribute
    const selectedIndex = currentFramework.attributes.findIndex(
      (attr) => attr.id === selectedAttribute.id,
    )

    if (selectedIndex !== -1) {
      // Get all records after selectedAttribute
      for (
        let i = selectedIndex + 1;
        i < currentFramework.attributes.length;
        i++
      ) {
        const attr = currentFramework.attributes[i]

        // If we hit a colIndex 0 or 1, we're in a new main section
        if (attr.colIndex <= 1) {
          continue
        }

        // Add all records that match the target column
        if (attr.colIndex === columnIndex) {
          relatedAttributes.push(attr)
        }
      }
    }

    return relatedAttributes
  }

  // Get remaining columns (include column 2 and up)
  const remainingColumns = Object.keys(attributesByColumn)
    .map(Number)
    .filter((colIndex) => colIndex >= 2) // Changed to include column 2
    .sort((a, b) => a - b)

  // Function to update audit detail
  const updateAuditDetail = (
    attributeId: string,
    field: keyof IAuditDetailsManipulator,
    value: string | number,
  ) => {
    const key = `${attributeId}-${selectedAuditCycleId}`

    // Ensure the audit detail exists first
    if (!auditDetailsData[key] && selectedAuditCycleId) {
      const attribute = currentFramework.attributes.find(
        (attr) => attr.id === attributeId,
      )

      const existingAuditDetail = attribute?.auditDetails?.find(
        (detail) => detail.auditCycleId === selectedAuditCycleId,
      )

      const newAuditDetail: IAuditDetailsManipulator = {
        frameworkAttributeId: attributeId,
        auditCycleId: selectedAuditCycleId,
        auditBy: userData?.id || '', // Always set to current user when creating new audit detail
        ownedBy: existingAuditDetail?.ownedBy || '', // Use existing owner or empty
        auditRuleId: existingAuditDetail?.auditRuleId || 1,
        comment: existingAuditDetail?.comment || '',
        recommendation: existingAuditDetail?.recommendation || '',
        attachmentUrl: existingAuditDetail?.attachmentUrl || '',
        attachmentName: existingAuditDetail?.attachmentName || '',
      }

      setAuditDetailsData((prev) => ({
        ...prev,
        [key]: newAuditDetail,
      }))
    }
    setAuditDetailsData((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        frameworkAttributeId: attributeId,
        auditCycleId: selectedAuditCycleId || 0,
        auditBy: userData?.id || '', // Always update auditor to current user when any change is made
        ownedBy: prev[key]?.ownedBy || '', // Only update owner when explicitly changed
        auditRuleId: prev[key]?.auditRuleId || 1,
        [field]: value,
      },
    }))
  }
  // Function to get audit detail value from existing data or current state
  const getAuditDetailValue = (
    attributeId: string,
    field: keyof IAuditDetailsManipulator,
  ) => {
    const attribute = currentFramework.attributes.find(
      (attr) => attr.id === attributeId,
    )
    const existingAuditDetail = attribute?.auditDetails?.find(
      (detail) => detail.auditCycleId === selectedAuditCycleId,
    )

    const key = `${attributeId}-${selectedAuditCycleId}`
    const currentData = auditDetailsData[key]

    if (currentData) {
      return currentData[field]
    }

    if (existingAuditDetail) {
      switch (field) {
        case 'auditBy':
          return existingAuditDetail.auditBy
        case 'ownedBy':
          return existingAuditDetail.ownedBy
        case 'auditRuleId':
          return existingAuditDetail.auditRuleId
        case 'comment':
          return existingAuditDetail.comment
        case 'recommendation':
          return existingAuditDetail.recommendation
        case 'attachmentUrl':
          return existingAuditDetail.attachmentUrl
        case 'attachmentName':
          return existingAuditDetail.attachmentName
        default:
          return ''
      }
    }
    return field === 'auditBy'
      ? userData?.id || ''
      : field === 'auditRuleId'
        ? 1
        : ''
  }

  // Function to get user display name
  const getUserDisplayName = (userId: string) => {
    const user = organizationUsers?.find((u) => u.id === userId)
    return user?.fullName || user?.email || 'Unknown User'
  }

  // Function to get audit rules from framework status
  const getFrameworkAuditRules = () => {
    if (!currentFramework?.status?.auditRules) return []
    return currentFramework.status.auditRules
  }

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="flex w-full flex-col items-start gap-[1.875rem]"
    >
      <div className="flex w-full items-center justify-center gap-2">
        <House
          className="size-5 cursor-pointer"
          onClick={() => router.back()}
        />
        <span className="font-medium">
          {parentSelectedAttribute?.value} -&gt;{' '}
        </span>{' '}
        {selectedAttribute.value}{' '}
      </div>

      {/* Show audit details section only when auditId exists in query */}
      {selectedAuditCycleId && (
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-5">
            <span>
              <b>Audit:</b> {auditData?.name.split('-').slice(0, 2).join('-')}
            </span>
            <span>
              <b>Initiated By:</b> {auditData?.user?.fullName}
            </span>
            <span>
              <b>Initiated date:</b>
              {auditData?.startDate
                ? new Date(auditData.startDate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : ''}
            </span>
          </div>
          <Button
            onClick={() => saveAuditDetails()}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {t('save')}
          </Button>
        </div>
      )}
      <div className="flex w-full flex-col items-center justify-center gap-0.5">
        {/* Table Header */}
        <div className="flex w-full items-center gap-6 rounded-t-lg border-b bg-primary p-4 text-white">
          <span className="w-10 shrink-0">#</span>
          {remainingColumns.map((columnIndex) => {
            const relatedAttributes =
              getRelatedAttributesFromColumn(columnIndex)
            return (
              <span key={columnIndex} className="flex-1">
                {relatedAttributes?.[0]?.name}
              </span>
            )
          })}
          {selectedAuditCycleId && (
            <>
              <span className="w-32">{t('audit-status')}</span>
              <span className="w-32">{t('owner')}</span>
              <span className="w-32">{t('auditor')}</span>
              <span className="w-24">{t('attachment')}</span>
              <span className="w-40">{t('comment')}</span>
              <span className="w-40">{t('recommendations')}</span>
            </>
          )}
        </div>

        {/* Table Body */}
        {directChildren.map((child, childIndex) => {
          // Get the specific related attribute for this child in the given column
          const getChildSpecificAttribute = (columnIndex: number) => {
            // Find the current child's index in the framework attributes
            const currentChildIndex = currentFramework.attributes.findIndex(
              (attr) => attr.id === child.id,
            )

            if (currentChildIndex !== -1) {
              // Look for the next attribute in the specified column after this child
              for (
                let i = currentChildIndex + 1;
                i < currentFramework.attributes.length;
                i++
              ) {
                const attr = currentFramework.attributes[i]

                // Stop if we hit a new section (colIndex <= child.colIndex)
                if (attr.colIndex <= child.colIndex) {
                  break
                }

                // Return the first attribute that matches the target column
                if (attr.colIndex === columnIndex) {
                  return attr
                }
              }
            }

            return null
          }

          // Create one row per child
          return (
            <div
              key={child.id}
              className="flex w-full items-center gap-6 border-b p-4 hover:bg-[#266a55]/10"
            >
              <span className="w-10 shrink-0 font-medium">
                {childIndex + 1}
              </span>
              {remainingColumns.map((columnIndex) => {
                const currentAttribute = getChildSpecificAttribute(columnIndex)

                return (
                  <span
                    key={`${child.id}-${columnIndex}`}
                    className="flex-1 text-sm"
                  >
                    {currentAttribute ? currentAttribute.value : '-'}
                  </span>
                )
              })}{' '}
              {selectedAuditCycleId && (
                <>
                  {/* Audit Status */}
                  <div
                    className="w-32 rounded p-1"
                    style={{
                      backgroundColor:
                        getFrameworkAuditRules()?.find(
                          (rule) =>
                            rule.id ===
                            Number(
                              getAuditDetailValue(child.id, 'auditRuleId'),
                            ),
                        )?.color || 'transparent',
                    }}
                  >
                    <Select
                      value={
                        getAuditDetailValue(
                          child.id,
                          'auditRuleId',
                        )?.toString() || ''
                      }
                      onValueChange={(value) =>
                        updateAuditDetail(
                          child.id,
                          'auditRuleId',
                          Number(value),
                        )
                      }
                    >
                      <SelectTrigger className="w-full bg-white/70">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {getFrameworkAuditRules()?.map((rule) => (
                          <SelectItem key={rule.id} value={rule.id.toString()}>
                            {rule.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>{' '}
                  {/* Owner */}
                  <div className="w-32">
                    <Select
                      value={
                        getAuditDetailValue(child.id, 'ownedBy')?.toString() ||
                        ''
                      }
                      onValueChange={(value) =>
                        updateAuditDetail(child.id, 'ownedBy', value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Owner" />
                      </SelectTrigger>
                      <SelectContent>
                        {organizationUsers?.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.fullName || user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Auditor */}
                  <div className="w-32">
                    <span className="text-sm text-gray-700">
                      {getAuditDetailValue(child.id, 'auditBy')
                        ? getUserDisplayName(
                            getAuditDetailValue(child.id, 'auditBy') as string,
                          )
                        : '-'}
                    </span>
                  </div>
                  {/* Attachment */}
                  <div className="w-24">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        // Handle file upload here
                        toast({
                          title: 'Coming Soon',
                          description:
                            'File upload functionality will be added',
                        })
                      }}
                    >
                      <Paperclip className="size-4" />
                    </Button>
                  </div>
                  {/* Comment */}
                  <div className="w-40">
                    <Textarea
                      placeholder="Add comment..."
                      value={
                        getAuditDetailValue(child.id, 'comment')?.toString() ||
                        ''
                      }
                      onChange={(e) =>
                        updateAuditDetail(child.id, 'comment', e.target.value)
                      }
                      className="min-h-[40px] resize-none"
                      rows={1}
                    />
                  </div>
                  {/* Recommendation */}
                  <div className="w-40">
                    <Textarea
                      placeholder="Add recomme..."
                      value={
                        getAuditDetailValue(
                          child.id,
                          'recommendation',
                        )?.toString() || ''
                      }
                      onChange={(e) =>
                        updateAuditDetail(
                          child.id,
                          'recommendation',
                          e.target.value,
                        )
                      }
                      className="min-h-[40px] resize-none"
                      rows={1}
                    />
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default FrameworkAttributeDetail
