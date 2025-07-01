'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from '@/hooks/use-toast'
import {
  createFrameworkLink,
  getAvailableFrameworksForLinking,
  type CreateFrameworkLinkData,
} from '@/lib/actions/framework-link.actions'
import { CustomUser } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ChevronDown,
  ChevronRight,
  Link2,
  Loader2,
  Plus,
  X,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { FC, useCallback, useEffect, useState } from 'react'

interface FrameworkLinkDialogProps {
  open: boolean
  onClose: () => void
  sourceFrameworkId: string
  sourceAttributeId: string
  sourceAttributeName?: string
  onSuccess?: () => void
}

interface SelectedFramework {
  id: string
  name: string
  level: number
  order: number
}

interface NestedAttribute {
  id: string
  name?: string
  value?: string | null
  children?: NestedAttribute[] | null
}

const FrameworkLinkDialog: FC<FrameworkLinkDialogProps> = ({
  open,
  onClose,
  sourceFrameworkId,
  sourceAttributeId,
  sourceAttributeName,
  onSuccess,
}) => {
  const t = useTranslations('general')
  const { data: session } = useSession()
  const userData = session?.user as CustomUser | undefined
  const queryClient = useQueryClient()

  // Form state
  const [linkName, setLinkName] = useState('')
  const [linkDescription, setLinkDescription] = useState('')
  const [selectedFrameworks, setSelectedFrameworks] = useState<
    SelectedFramework[]
  >([])

  // State for expandable framework details
  const [expandedFrameworks, setExpandedFrameworks] = useState<Set<string>>(
    new Set(),
  )
  const [expandedAttributes, setExpandedAttributes] = useState<Set<string>>(
    new Set(),
  )
  const [linkedAttributes, setLinkedAttributes] = useState<Set<string>>(
    new Set(),
  )

  // Fetch available frameworks
  const { data: frameworksData, isLoading: isLoadingFrameworks } = useQuery({
    queryKey: ['available-frameworks-for-linking', sourceFrameworkId],
    queryFn: () => getAvailableFrameworksForLinking(sourceFrameworkId),
    enabled: open,
  })

  const availableFrameworks = frameworksData?.frameworks || []

  // Helper functions for framework structure processing
  const getFrameworkStructure = (framework: {
    attributes: Array<{
      id: string
      name?: string
      value?: string | null
      colIndex?: number
      rowIndex?: number
    }>
  }) => {
    // Group attributes by column index
    const attributesByColumn: Record<
      number,
      Array<{
        id: string
        name?: string
        value?: string | null
        colIndex?: number
        rowIndex?: number
      }>
    > = {}
    framework.attributes.forEach((attr) => {
      const colIndex = attr.colIndex || 0
      if (!attributesByColumn[colIndex]) {
        attributesByColumn[colIndex] = []
      }
      attributesByColumn[colIndex].push(attr)
    })

    // Get sorted column indices
    const sortedColumns = Object.keys(attributesByColumn)
      .map(Number)
      .sort((a, b) => a - b)

    return { attributesByColumn, sortedColumns }
  }

  // Create nested structure from framework attributes
  const createNestedStructure = (framework: {
    attributes: Array<{
      id: string
      name?: string
      value?: string | null
      colIndex?: number
      rowIndex?: number
    }>
  }) => {
    const { attributesByColumn, sortedColumns } =
      getFrameworkStructure(framework)

    // Start with first column attributes as root nodes
    const firstColumnAttributes = attributesByColumn[0] || []
    const uniqueFirstColumn = firstColumnAttributes.filter(
      (attr, index, array) =>
        array.findIndex(
          (a) => (a.value || a.name) === (attr.value || attr.name),
        ) === index,
    )

    const nestedStructure = uniqueFirstColumn.map((parent) => {
      const buildChildren = (
        parentAttr: {
          id: string
          name?: string
          value?: string | null
          colIndex?: number
          rowIndex?: number
        },
        currentColIndex: number,
      ): NestedAttribute[] | null => {
        if (currentColIndex >= sortedColumns.length - 1) return null

        const nextColIndex = sortedColumns[currentColIndex + 1]
        if (!nextColIndex) return null

        // Find children in the next column that belong to this parent
        const children = getChildAttributesForParent(
          framework,
          parentAttr,
          nextColIndex,
        )

        if (children.length === 0) return null

        return children.map((child) => ({
          ...child,
          children: buildChildren(child, currentColIndex + 1),
        }))
      }

      return {
        ...parent,
        children: buildChildren(
          parent,
          sortedColumns.findIndex((col) => col === parent.colIndex),
        ),
      }
    })

    return nestedStructure
  }

  // Get child attributes for a specific parent
  const getChildAttributesForParent = (
    framework: {
      attributes: Array<{
        id: string
        name?: string
        value?: string | null
        colIndex?: number
        rowIndex?: number
      }>
    },
    parentAttr: {
      id: string
      name?: string
      value?: string | null
      colIndex?: number
      rowIndex?: number
    },
    targetColIndex: number,
  ) => {
    const parentIndex = framework.attributes.findIndex(
      (attr) => attr.id === parentAttr.id,
    )

    if (parentIndex === -1) return []

    const children = []
    // Look for attributes in the target column that come after this parent
    for (let i = parentIndex + 1; i < framework.attributes.length; i++) {
      const attr = framework.attributes[i]

      // Stop if we hit a new main section (colIndex <= parent.colIndex)
      if (
        attr.colIndex &&
        parentAttr.colIndex &&
        attr.colIndex <= parentAttr.colIndex
      ) {
        break
      }

      // Add attributes that match the target column
      if (attr.colIndex === targetColIndex) {
        children.push(attr)
      }
    }

    // Remove duplicates
    return children.filter(
      (attr, index, array) =>
        array.findIndex(
          (a) => (a.value || a.name) === (attr.value || attr.name),
        ) === index,
    )
  }

  // Toggle framework expansion
  const toggleFrameworkExpansion = (frameworkId: string) => {
    setExpandedFrameworks((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(frameworkId)) {
        newSet.delete(frameworkId)
      } else {
        newSet.add(frameworkId)
      }
      return newSet
    })
  }

  // Toggle attribute expansion
  const toggleAttributeExpansion = (attributeId: string) => {
    setExpandedAttributes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(attributeId)) {
        newSet.delete(attributeId)
      } else {
        newSet.add(attributeId)
      }
      return newSet
    })
  }

  // Toggle attribute linking
  const toggleAttributeLink = (attributeId: string) => {
    setLinkedAttributes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(attributeId)) {
        newSet.delete(attributeId)
      } else {
        newSet.add(attributeId)
      }
      return newSet
    })
  }

  // Render nested attribute structure
  const renderNestedAttributes = (
    attributes: NestedAttribute[],
    level = 0,
  ): JSX.Element[] => {
    return attributes.map((attr) => {
      const hasChildren = attr.children && attr.children.length > 0
      const isExpanded = expandedAttributes.has(attr.id)
      const isLinked = linkedAttributes.has(attr.id)

      return (
        <div key={attr.id} className="space-y-1">
          <div
            className={cn(
              'group flex items-center justify-between rounded px-2 py-1 hover:bg-muted/50 transition-colors border-l-2 border-transparent',
              level > 0 && 'border-l-muted-foreground/20',
            )}
            style={{ marginLeft: `${level * 20}px` }}
          >
            <div className="flex flex-1 items-center gap-2">
              {/* Expand/Collapse button for parent nodes */}
              {hasChildren ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-5 p-0 hover:bg-transparent"
                  onClick={() => toggleAttributeExpansion(attr.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="size-3 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="size-3 text-muted-foreground" />
                  )}
                </Button>
              ) : (
                <div className="size-5" /> // Spacer for leaf nodes
              )}

              {/* Level indicator */}
              <span className="min-w-[20px] font-mono text-xs text-muted-foreground">
                {level + 1}.
              </span>

              {/* Attribute name/value */}
              <span
                className={cn(
                  'text-sm flex-1 cursor-pointer',
                  hasChildren ? 'font-medium' : 'font-normal',
                  isLinked && 'text-primary font-medium',
                )}
                onClick={() => hasChildren && toggleAttributeExpansion(attr.id)}
              >
                {attr.value || attr.name}
              </span>
            </div>

            {/* Link button for leaf nodes only */}
            {!hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'size-6 p-0 transition-all duration-200',
                  isLinked
                    ? 'opacity-100 text-primary hover:text-primary/80'
                    : 'opacity-0 group-hover:opacity-100 hover:text-primary',
                )}
                onClick={() => toggleAttributeLink(attr.id)}
              >
                <Link2 className="size-3" />
              </Button>
            )}
          </div>

          {/* Render children recursively when expanded */}
          {hasChildren && isExpanded && (
            <div className="space-y-1">
              {renderNestedAttributes(attr.children!, level + 1)}
            </div>
          )}
        </div>
      )
    })
  }

  // Create framework link mutation
  const { mutate: createLink, isPending: isCreating } = useMutation({
    mutationFn: async (data: CreateFrameworkLinkData) => {
      const result = await createFrameworkLink(data)
      if (!result.success) {
        throw new Error(result.error || 'Failed to create framework link')
      }
      return result
    },
    onSuccess: () => {
      toast({
        variant: 'success',
        title: t('success'),
        description: 'Framework link created successfully',
      })

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['frameworks'] })
      queryClient.invalidateQueries({
        queryKey: ['framework-links-for-attribute', sourceAttributeId],
      })

      // Reset form and close
      handleReset()
      onClose()
      onSuccess?.()
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: t('error'),
        description:
          error instanceof Error
            ? error.message
            : 'Failed to create framework link',
      })
    },
  })

  // Handle framework selection
  const handleFrameworkToggle = useCallback(
    (frameworkId: string, frameworkName: string) => {
      setSelectedFrameworks((prev) => {
        const existing = prev.find((f) => f.id === frameworkId)

        if (existing) {
          // Remove framework and reorder remaining ones
          const filtered = prev.filter((f) => f.id !== frameworkId)
          return filtered.map((f, index) => ({
            ...f,
            level: index + 1,
            order: 1,
          }))
        } else {
          // Add framework with next level
          const newLevel = prev.length + 1
          return [
            ...prev,
            {
              id: frameworkId,
              name: frameworkName,
              level: newLevel,
              order: 1,
            },
          ]
        }
      })
    },
    [],
  )

  // Remove framework from selection
  const removeFramework = useCallback((frameworkId: string) => {
    setSelectedFrameworks((prev) => {
      const filtered = prev.filter((f) => f.id !== frameworkId)
      return filtered.map((f, index) => ({
        ...f,
        level: index + 1,
      }))
    })
  }, [])

  // Handle form submission
  const handleSubmit = useCallback(() => {
    if (!userData?.id) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: 'User not authenticated',
      })
      return
    }

    if (selectedFrameworks.length === 0) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: 'Please select at least one framework to link',
      })
      return
    }

    const linkData: CreateFrameworkLinkData = {
      name: linkName.trim() || undefined,
      description: linkDescription.trim() || undefined,
      sourceFrameworkId,
      sourceAttributeId,
      createdBy: userData.id,
      targetFrameworks: selectedFrameworks.map((f) => ({
        frameworkId: f.id,
        level: f.level,
        order: f.order,
      })),
    }

    createLink(linkData)
  }, [
    userData?.id,
    selectedFrameworks,
    linkName,
    linkDescription,
    sourceFrameworkId,
    sourceAttributeId,
    createLink,
    t,
  ])

  // Reset form
  const handleReset = useCallback(() => {
    setLinkName('')
    setLinkDescription('')
    setSelectedFrameworks([])
    setExpandedFrameworks(new Set())
    setExpandedAttributes(new Set())
    setLinkedAttributes(new Set())
  }, [])

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      handleReset()
    }
  }, [open, handleReset])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="size-5" />
            Link Frameworks
          </DialogTitle>
          <DialogDescription>
            Link frameworks to &quot;{sourceAttributeName}&quot; to create
            hierarchical relationships
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 flex-col gap-6 overflow-hidden">
          {/* Link Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="link-name">Link Name (Optional)</Label>
                <Input
                  id="link-name"
                  value={linkName}
                  onChange={(e) => setLinkName(e.target.value)}
                  placeholder="e.g., Governance Standards Mapping"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link-description">Description (Optional)</Label>
                <Input
                  id="link-description"
                  value={linkDescription}
                  onChange={(e) => setLinkDescription(e.target.value)}
                  placeholder="Brief description of this link"
                />
              </div>
            </div>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-6 overflow-hidden">
            {/* Available Frameworks */}
            <div className="space-y-3">
              <h3 className="font-medium">Available Frameworks</h3>
              <ScrollArea className="h-[400px] rounded-md border p-4">
                {isLoadingFrameworks ? (
                  <div className="flex h-32 items-center justify-center">
                    <Loader2 className="size-6 animate-spin" />
                  </div>
                ) : availableFrameworks.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    No frameworks available for linking
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availableFrameworks.map((framework) => {
                      const isSelected = selectedFrameworks.some(
                        (f) => f.id === framework.id,
                      )
                      return (
                        <div
                          key={framework.id}
                          className={cn(
                            'flex items-center space-x-2 p-3 rounded-md border cursor-pointer transition-colors',
                            isSelected
                              ? 'bg-primary/10 border-primary'
                              : 'hover:bg-muted',
                          )}
                          onClick={() =>
                            handleFrameworkToggle(framework.id, framework.name)
                          }
                        >
                          <Checkbox checked={isSelected} onChange={() => {}} />
                          <div className="flex-1">
                            <p className="font-medium">{framework.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {framework.attributes.length} attributes
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Selected Frameworks Details */}
            <div className="space-y-3">
              <h3 className="font-medium">Selected Frameworks Details</h3>
              <ScrollArea className="h-[400px] rounded-md border p-4">
                {selectedFrameworks.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <Plus className="mx-auto mb-2 size-8 opacity-50" />
                    Select frameworks to view their structure
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedFrameworks.map((selectedFramework) => {
                      const framework = availableFrameworks.find(
                        (f) => f.id === selectedFramework.id,
                      )
                      if (!framework) return null

                      const isExpanded = expandedFrameworks.has(framework.id)

                      return (
                        <div
                          key={framework.id}
                          className="rounded-md border bg-muted/20 p-3"
                        >
                          {/* Framework Header */}
                          <div className="flex items-center justify-between">
                            <div
                              className="flex cursor-pointer items-center gap-2"
                              onClick={() =>
                                toggleFrameworkExpansion(framework.id)
                              }
                            >
                              {isExpanded ? (
                                <ChevronDown className="size-4" />
                              ) : (
                                <ChevronRight className="size-4" />
                              )}
                              <span className="font-medium">
                                {framework.name}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                removeFramework(selectedFramework.id)
                              }
                              className="size-8 p-0 text-destructive hover:text-destructive"
                            >
                              <X className="size-4" />
                            </Button>
                          </div>

                          {/* Framework Details */}
                          {isExpanded && (
                            <div className="mt-3 space-y-2">
                              {(() => {
                                const nestedStructure =
                                  createNestedStructure(framework)
                                return renderNestedAttributes(nestedStructure)
                              })()}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={onClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isCreating || selectedFrameworks.length === 0}
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Creating Link...
              </>
            ) : (
              <>
                <Link2 className="mr-2 size-4" />
                Create Link
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default FrameworkLinkDialog
