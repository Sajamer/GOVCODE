'use client'

import LinkedFrameworksDisplay from '@/components/shared/LinkedFrameworksDisplay'
import AssignTaskDialog from '@/components/shared/modals/AssignTaskDialog'
import ConfirmationDialog from '@/components/shared/modals/ConfirmationDialog'
import FrameworkLinkDialog from '@/components/shared/modals/FrameworkLinkDialog'
import ShowAuditTasksDialog from '@/components/shared/modals/ShowAuditTasksDialog'
import NoResultFound from '@/components/shared/NoResultFound'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
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
import { deleteFileLocally } from '@/lib/local-upload'
import { cn } from '@/lib/utils'
import { useGlobalStore } from '@/stores/global-store'
import { IFrameworkAttribute } from '@/types/framework'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  House,
  Link2,
  Loader2,
  Plus,
  Save,
  Trash2,
} from 'lucide-react'
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

  // State for framework linking
  const [openFrameworkLink, setOpenFrameworkLink] = useState(false)
  const [selectedChildForLink, setSelectedChildForLink] = useState<
    string | null
  >(null)
  const [openLinkedFrameworks, setOpenLinkedFrameworks] = useState(false)
  const [selectedChildForViewLinks, setSelectedChildForViewLinks] = useState<
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

      // Save audit details
      const savedAuditDetails =
        await saveMultipleAuditDetails(auditDetailsArray)

      // Since attachments are now saved directly when uploaded,
      // we don't need to process temporary attachments here

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
        if (!auditDetailsData[`${attributeId}-${selectedAuditCycleId}`]) {
          updateAuditDetail(attributeId, 'comment', '')
        }

        // Upload file to local storage immediately (no temporary state needed)
        // Since we're using local storage, we can save directly to the database
        const formData = new FormData()
        formData.append('file', file)

        // We need an audit detail ID, so create one if it doesn't exist
        let auditDetailId = ''

        // Check if we have a saved audit detail
        const existingAuditDetail = currentFramework?.attributes
          .find((attr) => attr.id === attributeId)
          ?.auditDetails?.find(
            (detail) => detail.auditCycleId === selectedAuditCycleId,
          )

        if (existingAuditDetail) {
          auditDetailId = existingAuditDetail.id
        } else {
          // Create a temporary audit detail first
          const tempAuditDetail: IAuditDetailsManipulator = {
            frameworkAttributeId: attributeId,
            auditCycleId: selectedAuditCycleId || 0,
            auditBy: userData?.id || '',
            ownedBy: '',
            auditRuleId: 1,
            comment: '',
            recommendation: '',
          }

          // Save the audit detail first
          const savedAuditDetails = await saveMultipleAuditDetails([
            tempAuditDetail,
          ])
          auditDetailId = savedAuditDetails[0].id
        }

        formData.append('auditDetailId', auditDetailId)

        const response = await fetch('/api/upload/local', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Upload failed')
        }

        const uploadResult = await response.json()

        // Add to local state for immediate UI update
        const newAttachment = {
          id: uploadResult.id,
          name: uploadResult.name,
          url: uploadResult.url,
          size: uploadResult.size,
          type: uploadResult.type,
        }

        // Update local state
        setAttachmentsByAttribute((prev) => ({
          ...prev,
          [attributeId]: [...(prev[attributeId] || []), newAttachment],
        }))

        toast({
          variant: 'success',
          title: 'File uploaded',
          description: `${uploadResult.name} uploaded successfully.`,
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
    [
      selectedAuditCycleId,
      updateAuditDetail,
      auditDetailsData,
      currentFramework?.attributes,
      userData?.id,
    ],
  )

  // Function to delete attachment
  const handleDeleteAttachment = useCallback(
    async (attributeId: string, attachmentId: string) => {
      setDeletingAttachments((prev) => new Set(prev).add(attachmentId))

      try {
        // Delete from local storage and database
        await deleteFileLocally(attachmentId)

        // Update local state
        setAttachmentsByAttribute((prev) => ({
          ...prev,
          [attributeId]: (prev[attributeId] || []).filter(
            (att) => att.id !== attachmentId,
          ),
        }))

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
      // Navigate back to framework detail page with auditId parameter if it exists
      const currentPath = pathname
      const frameworkPath = currentPath.split('/').slice(0, -1).join('/') // Remove only attributeId, keep framework/id

      if (selectedAuditCycleId) {
        router.push(`${frameworkPath}?auditId=${selectedAuditCycleId}`)
      } else {
        router.push(frameworkPath)
      }
    }
  }, [hasUnsavedChanges, pathname, router, selectedAuditCycleId])

  // Confirm navigation without saving
  const handleConfirmLeave = useCallback(() => {
    setHasUnsavedChanges(false)
    setShowLeaveConfirmation(false)

    // Navigate back to framework detail page with auditId parameter if it exists
    const currentPath = pathname
    const frameworkPath = currentPath.split('/').slice(0, -1).join('/') // Remove only attributeId, keep framework/id

    if (selectedAuditCycleId) {
      router.push(`${frameworkPath}?auditId=${selectedAuditCycleId}`)
    } else {
      router.push(frameworkPath)
    }
  }, [pathname, router, selectedAuditCycleId])

  // Function to handle exit button - navigate to previous route with auditId
  const handleExit = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowLeaveConfirmation(true)
    } else {
      // Navigate back to framework detail page with auditId parameter if it exists
      const currentPath = pathname
      const frameworkPath = currentPath.split('/').slice(0, -1).join('/') // Remove only attributeId, keep framework/id

      if (selectedAuditCycleId) {
        router.push(`${frameworkPath}?auditId=${selectedAuditCycleId}`)
      } else {
        router.push(frameworkPath)
      }
    }
  }, [hasUnsavedChanges, pathname, router, selectedAuditCycleId])

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
    (attr) => attr.parentId === selectedAttribute.id,
  )

  // Fallback for legacy data that might not have proper parentId relationships
  const directChildrenFallback =
    directChildren.length === 0
      ? currentFramework.attributes.filter(
          (attr) => attr.value === selectedAttribute.value,
        )
      : directChildren

  // Helper function to get all descendants of an attribute
  const getAllDescendants = (parentId: string): IFrameworkAttribute[] => {
    const children = currentFramework.attributes.filter(
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

  // Get remaining columns (include column 2 and up) - moved here so it can be used in createExpandedChildren
  const remainingColumns = Object.keys(attributesByColumn)
    .map(Number)
    .filter((colIndex) => colIndex >= 2) // Changed to include column 2
    .sort((a, b) => a - b)

  // Create expanded children list where each parent appears once for each of its deepest descendants
  const createExpandedChildren = () => {
    const expandedChildren: Array<{
      parent: IFrameworkAttribute
      descendant: IFrameworkAttribute | null
      uniqueKey: string
      auditId: string // Unique ID for audit operations
      lastColumnAttributeId: string // ID of the attribute from the last column
    }> = []

    directChildrenFallback.forEach((parent) => {
      const descendants = getAllDescendants(parent.id)

      // Get the deepest level descendants (those that have no children)
      const deepestDescendants = descendants.filter(
        (desc) =>
          !currentFramework.attributes.some(
            (attr) => attr.parentId === desc.id,
          ),
      )

      if (deepestDescendants.length > 0) {
        // Add one entry for each deepest descendant
        deepestDescendants.forEach((descendant, index) => {
          // Find the attribute from the last column for this descendant
          const lastColumnIndex =
            remainingColumns[remainingColumns.length - 1] || 0
          let lastColumnAttributeId = descendant.id

          // If descendant is not in the last column, find the related attribute in the last column
          if (descendant.colIndex !== lastColumnIndex) {
            const descendantTree = getAllDescendants(descendant.id)
            const lastColumnAttr = descendantTree.find(
              (attr) => attr.colIndex === lastColumnIndex,
            )
            if (lastColumnAttr) {
              lastColumnAttributeId = lastColumnAttr.id
            }
          }

          expandedChildren.push({
            parent,
            descendant,
            uniqueKey: `${parent.id}-${descendant.id}-${index}`,
            auditId: descendant.id, // Use descendant ID for audit operations
            lastColumnAttributeId, // ID of the attribute from the last column
          })
        })
      } else {
        // If no descendants, just add the parent once
        expandedChildren.push({
          parent,
          descendant: null,
          uniqueKey: `${parent.id}-standalone`,
          auditId: parent.id, // Use parent ID for audit operations
          lastColumnAttributeId: parent.id, // Use parent ID as last column attribute
        })
      }
    })

    return expandedChildren
  }

  const finalDirectChildren = createExpandedChildren()

  // Helper function to get related attributes from a specific column using parentId hierarchy
  // This replaces the legacy index-based approach with proper parent-child relationships
  const getRelatedAttributesFromColumn = (columnIndex: number) => {
    // Helper function to get all descendants of an attribute
    const getAllDescendants = (parentId: string): IFrameworkAttribute[] => {
      const children = currentFramework.attributes.filter(
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

    // Get all descendants of the selected attribute
    const allDescendants = getAllDescendants(selectedAttribute.id)

    // Filter to only include attributes from the specified column
    return allDescendants.filter((attr) => attr.colIndex === columnIndex)
  }

  // Function to get the value from the last column for a specific child
  const getLastColumnValue = (lastColumnAttributeId: string): string => {
    if (remainingColumns.length === 0) return ''

    const childEntry = finalDirectChildren.find(
      (c) => c.lastColumnAttributeId === lastColumnAttributeId,
    )
    if (!childEntry) return ''

    // Find the actual attribute by its ID
    const lastColumnAttribute = currentFramework.attributes.find(
      (attr) => attr.id === lastColumnAttributeId,
    )

    return lastColumnAttribute?.value || childEntry.parent.value || ''
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

    return finalDirectChildren.some((child) =>
      hasExistingAuditDetail(child.lastColumnAttributeId),
    )
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

  // Function to handle framework linking
  const handleLinkFramework = (attributeId: string) => {
    setSelectedChildForLink(attributeId)
    setOpenFrameworkLink(true)
  }

  // Function to handle viewing framework links
  const handleViewFrameworkLinks = (attributeId: string) => {
    setSelectedChildForViewLinks(attributeId)
    setOpenLinkedFrameworks(true)
  }

  return (
    <>
      <div
        dir={isArabic ? 'rtl' : 'ltr'}
        className="flex w-full flex-col items-start gap-[1.875rem]"
      >
        <div className="flex w-full items-center justify-center gap-2">
          <House className="size-5 cursor-pointer" onClick={handleGoBack} />
          <span className="font-medium" dir="auto">
            {parentSelectedAttribute?.value} -&gt;{' '}
          </span>
          <span dir="auto">{selectedAttribute.value}</span>
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
            <div className="flex items-center gap-2">
              <Button
                onClick={handleExit}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="size-4" />
                {t('exit')}
              </Button>
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
                    'text-sm font-medium',
                    selectedAuditCycleId
                      ? 'w-full min-w-[100px] max-w-[150px] break-words'
                      : 'flex-1 w-full',
                  )}
                  dir="auto"
                >
                  {relatedAttributes?.[0]?.name}
                </span>
              )
            })}
            {selectedAuditCycleId ? (
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
            ) : (
              <span className="w-40">{t('link')}</span>
            )}
          </div>

          {/* Table Body */}
          {finalDirectChildren.map((child, childIndex) => {
            // Create one row per child
            return (
              <div
                key={child.uniqueKey}
                className="flex w-full items-center gap-3 border-b p-4 hover:bg-[#266a55]/10"
              >
                <span className="w-10 shrink-0 font-medium">
                  {childIndex + 1}
                </span>
                {remainingColumns.map((columnIndex) => {
                  // Display the descendant value for this column if it exists, otherwise the parent value
                  const displayValue =
                    child.descendant &&
                    child.descendant.colIndex === columnIndex
                      ? child.descendant.value
                      : child.parent.value

                  return (
                    <span
                      key={`${child.uniqueKey}-${columnIndex}`}
                      className={cn(
                        'text-sm',
                        selectedAuditCycleId
                          ? 'w-full min-w-[100px] max-w-[150px] break-words'
                          : 'flex-1 w-full',
                      )}
                      dir="auto"
                    >
                      {displayValue || '-'}
                    </span>
                  )
                })}

                {selectedAuditCycleId ? (
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
                                getAuditDetailValue(
                                  child.lastColumnAttributeId,
                                  'auditRuleId',
                                ),
                              ),
                          )?.color || 'transparent',
                      }}
                    >
                      <Select
                        value={
                          getAuditDetailValue(
                            child.lastColumnAttributeId,
                            'auditRuleId',
                          )?.toString() || ''
                        }
                        onValueChange={(value) =>
                          updateAuditDetail(
                            child.lastColumnAttributeId,
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
                            child.lastColumnAttributeId,
                            'ownedBy',
                          )?.toString() || ''
                        }
                        onValueChange={(value) =>
                          updateAuditDetail(
                            child.lastColumnAttributeId,
                            'ownedBy',
                            value,
                          )
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
                        {getAuditDetailValue(
                          child.lastColumnAttributeId,
                          'auditBy',
                        )
                          ? getUserDisplayName(
                              getAuditDetailValue(
                                child.lastColumnAttributeId,
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
                          fileInputRefs.current[child.lastColumnAttributeId] =
                            el
                        }}
                        style={{ display: 'none' }}
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.xls,.xlsx"
                        onChange={(e) =>
                          handleFileInputChange(child.lastColumnAttributeId, e)
                        }
                      />

                      {/* Render multiple attachments */}
                      <div className="flex flex-col gap-1">
                        {attachmentsByAttribute[
                          child.lastColumnAttributeId
                        ]?.map((attachment) => (
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
                                handleDeleteAttachment(
                                  child.lastColumnAttributeId,
                                  attachment.id,
                                )
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
                          onClick={() =>
                            triggerFileInput(child.lastColumnAttributeId)
                          }
                          disabled={uploadingFiles.has(
                            child.lastColumnAttributeId,
                          )}
                          title="Add attachment"
                        >
                          {uploadingFiles.has(child.lastColumnAttributeId) ? (
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
                            child.lastColumnAttributeId,
                            'comment',
                          )?.toString() || ''
                        }
                        onChange={(e) =>
                          updateAuditDetail(
                            child.lastColumnAttributeId,
                            'comment',
                            e.target.value,
                          )
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
                            child.lastColumnAttributeId,
                            'recommendation',
                          )?.toString() || ''
                        }
                        onChange={(e) =>
                          updateAuditDetail(
                            child.lastColumnAttributeId,
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
                        {hasExistingAuditDetail(child.lastColumnAttributeId) ? (
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleAssignTask(child.lastColumnAttributeId)
                              }
                            >
                              <Plus className="size-4" />
                              {t('add-task')}
                            </Button>
                            {hasTasksForAuditDetail(
                              child.lastColumnAttributeId,
                            ) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleViewTasks(child.lastColumnAttributeId)
                                }
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
                ) : (
                  <div className="flex w-40 gap-2">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleLinkFramework(child.lastColumnAttributeId)
                        }
                      >
                        <Link2 className="size-4" />
                        {t('link')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleViewFrameworkLinks(child.lastColumnAttributeId)
                        }
                      >
                        {t('show-links')}
                      </Button>
                    </div>
                  </div>
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

      {/* Framework Link Dialog */}
      <FrameworkLinkDialog
        open={openFrameworkLink}
        onClose={() => {
          setOpenFrameworkLink(false)
          setSelectedChildForLink(null)
        }}
        sourceFrameworkId={frameworkId}
        sourceAttributeId={selectedChildForLink || ''}
        sourceAttributeName={
          selectedChildForLink
            ? getLastColumnValue(selectedChildForLink)
            : undefined
        }
        onSuccess={() => {
          // Optionally refresh data or show success message
          toast({
            title: t('success'),
            description: t('framework-linked-successfully'),
          })
        }}
      />

      {/* Linked Frameworks Display Dialog */}
      {selectedChildForViewLinks && (
        <Dialog
          open={openLinkedFrameworks}
          onOpenChange={setOpenLinkedFrameworks}
        >
          <DialogContent className="max-w-4xl overflow-hidden">
            <DialogHeader className="mt-2">
              <DialogTitle className={cn(isArabic && 'text-right')}>
                {t('linked-frameworks')}
              </DialogTitle>
              <DialogDescription className={cn(isArabic && 'text-right')}>
                {t('viewing-links-for')}:{' '}
                {getLastColumnValue(selectedChildForViewLinks)}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] rounded-lg">
              <LinkedFrameworksDisplay
                attributeId={selectedChildForViewLinks}
              />
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

export default FrameworkAttributeDetail
