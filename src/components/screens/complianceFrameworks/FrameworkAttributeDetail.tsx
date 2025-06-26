'use client'

import NoResultFound from '@/components/shared/NoResultFound'
import AssignTaskDialog from '@/components/shared/modals/AssignTaskDialog'
import ConfirmationDialog from '@/components/shared/modals/ConfirmationDialog'
import ShowAuditTasksDialog from '@/components/shared/modals/ShowAuditTasksDialog'
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
  createAttachment,
  deleteAttachment,
} from '@/lib/actions/attachment.actions'
import {
  IAuditDetailsManipulator,
  saveMultipleAuditDetails,
} from '@/lib/actions/audit-details.actions'
import { getAllFrameworks } from '@/lib/actions/framework.actions'
import { getAllOrganizationUsers } from '@/lib/actions/userActions'
import { CustomUser } from '@/lib/auth'
import { uploadFiles } from '@/lib/uploadthing'
import { cn } from '@/lib/utils'
import { useGlobalStore } from '@/stores/global-store'
import { IFrameworkAttribute } from '@/types/framework'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { House, Loader2, Plus, Save, Trash2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { FC, useCallback, useEffect, useRef, useState } from 'react'

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
  const [openAssignTask, setOpenAssignTask] = useState(false)

  const [selectedChildForTask, setSelectedChildForTask] = useState<
    string | null
  >(null)

  const [openShowTasks, setOpenShowTasks] = useState(false)
  const [selectedChildForViewTasks, setSelectedChildForViewTasks] = useState<
    string | null
  >(null)

  // State for audit details
  const [auditDetailsData, setAuditDetailsData] = useState<
    Record<string, IAuditDetailsManipulator>
  >({})

  // State for tracking unsaved changes and navigation confirmation
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false)

  // State for file upload management
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set())
  const [deletingAttachments, setDeletingAttachments] = useState<Set<string>>(
    new Set(),
  )
  const [attachmentsByAttribute, setAttachmentsByAttribute] = useState<
    Record<
      string,
      Array<{
        id: string
        name: string
        url: string
        size?: number
        type?: string
      }>
    >
  >({})
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

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

      // Save audit details first
      const savedAuditDetails =
        await saveMultipleAuditDetails(auditDetailsArray)

      // Process temporary attachments
      const attachmentPromises: Promise<unknown>[] = []

      Object.entries(attachmentsByAttribute).forEach(
        ([attributeId, attachments]) => {
          // Find the corresponding saved audit detail
          const auditDetail = savedAuditDetails.find(
            (detail) => detail.frameworkAttributeId === attributeId,
          )

          if (auditDetail) {
            // Filter only temporary attachments (those with "temp-" prefix)
            const tempAttachments = attachments.filter((att) =>
              att.id.startsWith('temp-'),
            )

            tempAttachments.forEach((tempAttachment) => {
              attachmentPromises.push(
                createAttachment({
                  name: tempAttachment.name,
                  url: tempAttachment.url,
                  size: tempAttachment.size,
                  type: tempAttachment.type,
                  auditDetailId: auditDetail.id,
                }),
              )
            })
          }
        },
      )

      // Wait for all attachments to be created
      if (attachmentPromises.length > 0) {
        await Promise.all(attachmentPromises)
      }

      return savedAuditDetails
    },
    onSuccess: async () => {
      // Invalidate and refetch framework data to get updated attachments
      await queryClient.invalidateQueries({ queryKey: ['frameworks'] })
      await queryClient.invalidateQueries({
        queryKey: ['single-framework', frameworkId],
      })
      setHasUnsavedChanges(false) // Reset unsaved changes after successful save

      toast({
        variant: 'success',
        title: t('success'),
        description: 'Audit details and attachments saved successfully',
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

  // Function to update audit detail
  const updateAuditDetail = useCallback(
    (
      attributeId: string,
      field: keyof IAuditDetailsManipulator,
      value: string | number,
    ) => {
      const key = `${attributeId}-${selectedAuditCycleId}`

      // Ensure the audit detail exists first
      if (!auditDetailsData[key] && selectedAuditCycleId) {
        const attribute = currentFramework?.attributes.find(
          (attr) => attr.id === attributeId,
        )

        const existingAuditDetail = attribute?.auditDetails?.find(
          (detail) => detail.auditCycleId === selectedAuditCycleId,
        )

        const newAuditDetail: IAuditDetailsManipulator = {
          frameworkAttributeId: attributeId,
          auditCycleId: selectedAuditCycleId, // TypeScript knows this is not null due to the guard above
          auditBy: userData?.id || '', // Always set to current user when creating new audit detail
          ownedBy: existingAuditDetail?.ownedBy || '', // Use existing owner or empty
          auditRuleId: existingAuditDetail?.auditRuleId || 1,
          comment: existingAuditDetail?.comment || '',
          recommendation: existingAuditDetail?.recommendation || '',
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

      // Mark as having unsaved changes
      setHasUnsavedChanges(true)
    },
    [
      selectedAuditCycleId,
      currentFramework?.attributes,
      userData?.id,
      auditDetailsData,
    ],
  )

  // File upload functions
  const handleFileUpload = useCallback(
    async (attributeId: string, file: File) => {
      if (!file || !selectedAuditCycleId) return

      setUploadingFiles((prev) => new Set(prev).add(attributeId))

      try {
        // First, ensure audit detail exists
        const key = `${attributeId}-${selectedAuditCycleId}`
        if (!auditDetailsData[key]) {
          updateAuditDetail(attributeId, 'comment', '')
        }

        // Upload file to storage
        const uploadResponse = await uploadFiles('fileUploader', {
          files: [file],
          input: {
            description: `Attachment for framework attribute ${attributeId}`,
          },
        })

        if (!uploadResponse || !uploadResponse[0]?.url) {
          throw new Error('Failed to upload file')
        }

        const fileUrl = uploadResponse[0].url
        const fileName = uploadResponse[0].name || file.name

        // For now, we'll store attachments temporarily in local state
        // They will be properly linked to audit details when saved
        const tempAttachment = {
          id: `temp-${Date.now()}-${Math.random()}`, // Temporary ID
          name: fileName,
          url: fileUrl,
          size: file.size,
          type: file.type,
        }

        // Update local state
        setAttachmentsByAttribute((prev) => ({
          ...prev,
          [attributeId]: [...(prev[attributeId] || []), tempAttachment],
        }))

        toast({
          variant: 'success',
          title: 'File uploaded',
          description: `${fileName} uploaded successfully. Save audit details to persist.`,
        })
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Upload failed',
          description: `Failed to upload file: ${error}`,
        })
      } finally {
        setUploadingFiles((prev) => {
          const newSet = new Set(prev)
          newSet.delete(attributeId)
          return newSet
        })
      }
    },
    [selectedAuditCycleId, updateAuditDetail, auditDetailsData],
  )

  // Function to delete attachment
  const handleDeleteAttachment = useCallback(
    async (attributeId: string, attachmentId: string) => {
      setDeletingAttachments((prev) => new Set(prev).add(attachmentId))

      try {
        // Check if it's a temporary attachment (starts with "temp-")
        if (attachmentId.startsWith('temp-')) {
          // Just remove from local state for temporary attachments
          setAttachmentsByAttribute((prev) => ({
            ...prev,
            [attributeId]: (prev[attributeId] || []).filter(
              (att) => att.id !== attachmentId,
            ),
          }))
        } else {
          // For real attachments, delete from database
          await deleteAttachment(attachmentId)

          // Update local state
          setAttachmentsByAttribute((prev) => ({
            ...prev,
            [attributeId]: (prev[attributeId] || []).filter(
              (att) => att.id !== attachmentId,
            ),
          }))
        }

        toast({
          variant: 'success',
          title: 'Attachment deleted',
          description: 'Attachment deleted successfully',
        })
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Delete failed',
          description: `Failed to delete attachment: ${error}`,
        })
      } finally {
        setDeletingAttachments((prev) => {
          const newSet = new Set(prev)
          newSet.delete(attachmentId)
          return newSet
        })
      }
    },
    [],
  )

  // Function to trigger file input
  const triggerFileInput = (attributeId: string) => {
    const input = fileInputRefs.current[attributeId]
    if (input) {
      input.click()
    }
  }

  // Function to handle file input change
  const handleFileInputChange = (
    attributeId: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(attributeId, file)
    }
    // Reset the input value to allow selecting the same file again
    event.target.value = ''
  }

  // Function to download/view attachment
  const handleAttachmentClick = (url: string, name: string) => {
    if (url) {
      const link = document.createElement('a')
      link.href = url
      link.target = '_blank'
      link.download = name || 'attachment'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // Navigation guard function
  const handleGoBack = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowLeaveConfirmation(true)
    } else {
      router.back()
    }
  }, [hasUnsavedChanges, router])

  // Confirm navigation without saving
  const handleConfirmLeave = useCallback(() => {
    setHasUnsavedChanges(false)
    setShowLeaveConfirmation(false)
    // Use window.history.go(-2) for browser navigation to handle both router and browser back
    window.history.go(-2)
  }, [])

  // Add browser navigation guard for back button, refresh, and tab close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        return '' // This is required for some browsers
      }
    }

    // Push a dummy state to capture back button clicks
    if (hasUnsavedChanges) {
      window.history.pushState(null, '', window.location.href)
    }

    const handlePopState = () => {
      if (hasUnsavedChanges) {
        // Push the current state back to prevent navigation
        window.history.pushState(null, '', window.location.href)
        setShowLeaveConfirmation(true)
      }
    }

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)

    // Cleanup event listeners
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [hasUnsavedChanges])

  // Load attachments when framework data is available
  useEffect(() => {
    if (currentFramework && selectedAuditCycleId) {
      const newAttachments: Record<
        string,
        Array<{
          id: string
          name: string
          url: string
          size?: number
          type?: string
        }>
      > = {}

      currentFramework.attributes.forEach((attr) => {
        const auditDetail = attr.auditDetails?.find(
          (detail) => detail.auditCycleId === selectedAuditCycleId,
        )

        if (auditDetail?.attachments && auditDetail.attachments.length > 0) {
          newAttachments[attr.id] = auditDetail.attachments.map((att) => ({
            id: att.id,
            name: att.name,
            url: att.url,
            size: att.size || undefined,
            type: att.type || undefined,
          }))
        }
      })

      setAttachmentsByAttribute(newAttachments)
    }
  }, [currentFramework, selectedAuditCycleId])

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

  // Function to get the value from the last column for a specific child
  const getLastColumnValue = (childId: string): string => {
    if (remainingColumns.length === 0) return ''

    const lastColumnIndex = remainingColumns[remainingColumns.length - 1]
    const child = directChildren.find((c) => c.id === childId)
    if (!child) return ''

    // Find the current child's index in the framework attributes
    const currentChildIndex = currentFramework.attributes.findIndex(
      (attr) => attr.id === child.id,
    )

    if (currentChildIndex !== -1) {
      // Look for the next attribute in the last column after this child
      for (
        let i = currentChildIndex + 1;
        i < currentFramework.attributes.length;
        i++
      ) {
        const attr = currentFramework.attributes[i]

        // If we hit a colIndex 0 or 1, we're in a new main section
        if (attr.colIndex <= 1) {
          break
        }

        // Return the first attribute that matches the last column
        if (attr.colIndex === lastColumnIndex) {
          return attr.value || ''
        }
      }
    }

    return ''
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

  // Function to get existing audit detail ID or null if it doesn't exist
  const getExistingAuditDetailId = (
    attributeId: string,
  ): string | undefined => {
    const attribute = currentFramework?.attributes.find(
      (attr) => attr.id === attributeId,
    )
    const existingAuditDetail = attribute?.auditDetails?.find(
      (detail) => detail.auditCycleId === selectedAuditCycleId,
    )

    return existingAuditDetail?.id
  }

  // Function to check if audit detail exists for an attribute
  const hasExistingAuditDetail = (attributeId: string): boolean => {
    return !!getExistingAuditDetailId(attributeId)
  }

  // Function to check if any audit details exist for the current audit cycle
  const hasAnyAuditDetails = (): boolean => {
    if (!selectedAuditCycleId || !currentFramework) return false

    return directChildren.some((child) => hasExistingAuditDetail(child.id))
  }

  // Function to handle task assignment
  const handleAssignTask = (attributeId: string) => {
    const auditDetailId = getExistingAuditDetailId(attributeId)

    if (auditDetailId) {
      setSelectedChildForTask(attributeId)
      setOpenAssignTask(true)
    }
  }

  // Function to handle viewing tasks
  const handleViewTasks = (attributeId: string) => {
    const auditDetailId = getExistingAuditDetailId(attributeId)

    if (auditDetailId) {
      setSelectedChildForViewTasks(attributeId)
      setOpenShowTasks(true)
    }
  }

  // Function to check if an audit detail has tasks (you can implement a more efficient check if needed)
  const hasTasksForAuditDetail = (attributeId: string): boolean => {
    // For now, we'll assume that if an audit detail exists, it might have tasks
    // In a real scenario, you might want to fetch task count or cache this information
    return hasExistingAuditDetail(attributeId)
  }

  return (
    <>
      <div
        dir={isArabic ? 'rtl' : 'ltr'}
        className="flex w-full flex-col items-start gap-[1.875rem]"
      >
        <div className="flex w-full items-center justify-center gap-2">
          <House className="size-5 cursor-pointer" onClick={handleGoBack} />
          <span className="font-medium">
            {parentSelectedAttribute?.value} -&gt;{' '}
          </span>
          {selectedAttribute.value}
        </div>

        {/* Show audit details section only when auditId exists in query */}
        {selectedAuditCycleId && (
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-5">
              <span>
                <b>{t('audit')}:</b>{' '}
                {auditData?.name.split('-').slice(0, 2).join('-')}
              </span>
              <span>
                <b>{t('initiate-by')}:</b> {auditData?.user?.fullName}
              </span>
              <span>
                <b>{t('initiated-date')}:</b>
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
          <div className="flex w-full items-center gap-3 rounded-t-lg border-b bg-primary p-4 text-white">
            <span className="w-10 shrink-0">#</span>
            {remainingColumns.map((columnIndex) => {
              const relatedAttributes =
                getRelatedAttributesFromColumn(columnIndex)
              return (
                <span
                  key={columnIndex}
                  className={cn(
                    selectedAuditCycleId ? 'w-full max-w-20' : 'flex-1 w-full',
                  )}
                >
                  {relatedAttributes?.[0]?.name}
                </span>
              )
            })}
            {selectedAuditCycleId && (
              <>
                <span className="w-full max-w-28">{t('audit-status')}</span>{' '}
                <span className="w-32">{t('owner')}</span>
                <span className="w-32">{t('auditor')}</span>
                <span className="w-24">{t('attachment')}</span>
                <span className="w-40">{t('comment')}</span>
                <span className="min-w-40 flex-1">{t('recommendations')}</span>
                {hasAnyAuditDetails() && (
                  <span className="w-40">{t('task-management')}</span>
                )}
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
                className="flex w-full items-center gap-3 border-b p-4 hover:bg-[#266a55]/10"
              >
                <span className="w-10 shrink-0 font-medium">
                  {childIndex + 1}
                </span>
                {remainingColumns.map((columnIndex) => {
                  const currentAttribute =
                    getChildSpecificAttribute(columnIndex)

                  return (
                    <span
                      key={`${child.id}-${columnIndex}`}
                      className={cn(
                        'text-sm',
                        selectedAuditCycleId
                          ? 'w-full max-w-20'
                          : 'flex-1 w-full',
                      )}
                    >
                      {currentAttribute ? currentAttribute.value : '-'}
                    </span>
                  )
                })}

                {selectedAuditCycleId && (
                  <>
                    {/* Audit Status */}
                    <div
                      className="w-full max-w-28 rounded p-1"
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
                            <SelectItem
                              key={rule.id}
                              value={rule.id.toString()}
                            >
                              {rule.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Owner */}
                    <div className="w-32">
                      <Select
                        value={
                          getAuditDetailValue(
                            child.id,
                            'ownedBy',
                          )?.toString() || ''
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
                              getAuditDetailValue(
                                child.id,
                                'auditBy',
                              ) as string,
                            )
                          : '-'}
                      </span>
                    </div>
                    {/* Attachment */}
                    <div className="w-24">
                      <input
                        type="file"
                        ref={(el) => {
                          fileInputRefs.current[child.id] = el
                        }}
                        style={{ display: 'none' }}
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.xls,.xlsx"
                        onChange={(e) => handleFileInputChange(child.id, e)}
                      />

                      {/* Render multiple attachments */}
                      <div className="flex flex-col gap-1">
                        {attachmentsByAttribute[child.id]?.map((attachment) => (
                          <div
                            key={attachment.id}
                            className="flex items-center gap-1"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 truncate p-1 text-xs"
                              onClick={() =>
                                handleAttachmentClick(
                                  attachment.url,
                                  attachment.name,
                                )
                              }
                              title={attachment.name}
                            >
                              {attachment.name.length > 8
                                ? `${attachment.name.substring(0, 8)}...`
                                : attachment.name}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 text-red-500 hover:text-red-700"
                              onClick={() =>
                                handleDeleteAttachment(child.id, attachment.id)
                              }
                              disabled={deletingAttachments.has(attachment.id)}
                              title="Delete attachment"
                            >
                              {deletingAttachments.has(attachment.id) ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : (
                                <Trash2 className="size-3" />
                              )}
                            </Button>
                          </div>
                        ))}

                        {/* Add attachment button */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => triggerFileInput(child.id)}
                          disabled={uploadingFiles.has(child.id)}
                          title="Add attachment"
                        >
                          {uploadingFiles.has(child.id) ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Plus className="size-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    {/* Comment */}
                    <div className="w-40">
                      <Textarea
                        placeholder={t('add-comment')}
                        value={
                          getAuditDetailValue(
                            child.id,
                            'comment',
                          )?.toString() || ''
                        }
                        onChange={(e) =>
                          updateAuditDetail(child.id, 'comment', e.target.value)
                        }
                        className="min-h-[40px] resize-none"
                        rows={1}
                      />
                    </div>
                    {/* Recommendation */}
                    <div className="min-w-40 flex-1">
                      <Textarea
                        placeholder={t('add-recommendation')}
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
                    {/* Task Management - Only show if audit details exist and this row has audit details */}
                    {hasAnyAuditDetails() && (
                      <div className="flex w-40 gap-2">
                        {hasExistingAuditDetail(child.id) ? (
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAssignTask(child.id)}
                            >
                              <Plus className="size-4" />
                              {t('add-task')}
                            </Button>
                            {hasTasksForAuditDetail(child.id) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewTasks(child.id)}
                              >
                                {t('view-tasks')}
                              </Button>
                            )}
                          </div>
                        ) : (
                          <span></span>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Confirmation Dialog for Unsaved Changes */}
      <ConfirmationDialog
        open={showLeaveConfirmation}
        onClose={() => setShowLeaveConfirmation(false)}
        callback={() => handleConfirmLeave()}
        title="Unsaved Changes"
        subTitle="You have unsaved changes. Are you sure you want to leave this page? Your changes will be lost."
        type="warning"
      />

      <AssignTaskDialog
        open={openAssignTask}
        taskType="AUDIT_RELATED"
        title={
          selectedChildForTask
            ? `${t('audit-cycle-id')}: ${auditData?.name.split('-').slice(0, 2).join('-')} - ${getLastColumnValue(selectedChildForTask)}`
            : `${t('audit-cycle-id')}: ${auditData?.name.split('-').slice(0, 2).join('-')}` ||
              ''
        }
        auditDetailId={getExistingAuditDetailId(selectedChildForTask || '')}
        onClose={() => {
          setOpenAssignTask(false)
          setSelectedChildForTask(null)
        }}
      />

      <ShowAuditTasksDialog
        open={openShowTasks}
        onClose={() => {
          setOpenShowTasks(false)
          setSelectedChildForViewTasks(null)
        }}
        auditDetailId={
          selectedChildForViewTasks
            ? getExistingAuditDetailId(selectedChildForViewTasks)
            : undefined
        }
        title={
          selectedChildForViewTasks
            ? `${getLastColumnValue(selectedChildForViewTasks)}`
            : undefined
        }
      />
    </>
  )
}

export default FrameworkAttributeDetail
