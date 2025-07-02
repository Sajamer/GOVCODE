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
import {
  createUINestedStructure,
  getUIAttributeDisplayValue,
  hasChildren,
} from '@/lib/ui-framework-utils'
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
import { usePathname } from 'next/navigation'
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
  targetAttributeId?: string // The specific attribute to link to
}

interface NestedAttribute {
  id: string
  name?: string
  value?: string | null
  colIndex?: number
  rowIndex?: number
  parentId?: string | null
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
  const isArabic = usePathname().includes('/ar')

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
  const [linkedAttributes, setLinkedAttributes] = useState<Map<string, string>>(
    new Map(),
  ) // Maps frameworkId to selected attributeId

  // Fetch available frameworks
  const { data: frameworksData, isLoading: isLoadingFrameworks } = useQuery({
    queryKey: ['available-frameworks-for-linking', sourceFrameworkId],
    queryFn: () => getAvailableFrameworksForLinking(sourceFrameworkId),
    enabled: open,
  })

  const availableFrameworks = frameworksData?.frameworks || []

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

  // Toggle attribute linking for a specific framework
  const toggleAttributeLink = (frameworkId: string, attributeId: string) => {
    setLinkedAttributes((prev) => {
      const newMap = new Map(prev)
      if (newMap.get(frameworkId) === attributeId) {
        // If this attribute is already selected for this framework, remove it
        newMap.delete(frameworkId)
      } else {
        // Set this attribute as the selected one for this framework
        newMap.set(frameworkId, attributeId)
      }
      return newMap
    })
  }

  // Render nested attribute structure
  const renderNestedAttributes = (
    attributes: NestedAttribute[],
    frameworkId: string,
    level = 0,
  ): JSX.Element[] => {
    return attributes.map((attr) => {
      const attributeHasChildren = hasChildren(attr)
      const isExpanded = expandedAttributes.has(attr.id)
      const isLinked = linkedAttributes.get(frameworkId) === attr.id

      return (
        <div key={attr.id} className="space-y-1">
          <div
            className={cn(
              'group flex items-center justify-between rounded px-2 py-1 hover:bg-muted/50 transition-colors border-l-2 border-transparent',
              level > 0 && 'border-l-muted-foreground/20',
            )}
            style={
              isArabic
                ? { marginRight: `${level * 20}px` }
                : { marginLeft: `${level * 20}px` }
            }
          >
            <div className="flex flex-1 items-center gap-2">
              {/* Expand/Collapse button for parent nodes */}
              {attributeHasChildren ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-5 p-0 hover:bg-transparent"
                  onClick={() => toggleAttributeExpansion(attr.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="size-3 text-muted-foreground" />
                  ) : (
                    <ChevronRight
                      className={cn(
                        'size-3 text-muted-foreground',
                        isArabic && 'rotate-180',
                      )}
                    />
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
                  attributeHasChildren ? 'font-medium' : 'font-normal',
                  isLinked && 'text-primary font-medium',
                )}
                onClick={() =>
                  attributeHasChildren && toggleAttributeExpansion(attr.id)
                }
              >
                {getUIAttributeDisplayValue(attr)}
              </span>
            </div>

            {/* Link button for leaf nodes only */}
            {!attributeHasChildren && (
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'size-6 p-0 transition-all duration-200',
                  isLinked
                    ? 'opacity-100 text-primary hover:text-primary/80'
                    : 'opacity-0 group-hover:opacity-100 hover:text-primary',
                )}
                onClick={() => toggleAttributeLink(frameworkId, attr.id)}
              >
                <Link2 className="size-3" />
              </Button>
            )}
          </div>

          {/* Render children recursively when expanded */}
          {attributeHasChildren && isExpanded && attr.children && (
            <div className="space-y-1">
              {renderNestedAttributes(attr.children, frameworkId, level + 1)}
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
        description: t('framework-link-created-successfully'),
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
            : t('failed-to-create-framework-link'),
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

    // Also remove the linked attribute for this framework
    setLinkedAttributes((prev) => {
      const newMap = new Map(prev)
      newMap.delete(frameworkId)
      return newMap
    })
  }, [])

  // Handle form submission
  const handleSubmit = useCallback(() => {
    if (!userData?.id) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('user-not-authenticated'),
      })
      return
    }

    if (selectedFrameworks.length === 0) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('please-select-at-least-one-framework'),
      })
      return
    }

    // Check if all selected frameworks have a target attribute selected
    const frameworksWithMissingAttributes = selectedFrameworks.filter(
      (f) => !linkedAttributes.has(f.id),
    )

    if (frameworksWithMissingAttributes.length > 0) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('please-select-target-attribute-for-all-frameworks'),
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
        targetAttributeId: linkedAttributes.get(f.id)!,
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
    linkedAttributes,
    t,
  ])

  // Reset form
  const handleReset = useCallback(() => {
    setLinkName('')
    setLinkDescription('')
    setSelectedFrameworks([])
    setExpandedFrameworks(new Set())
    setExpandedAttributes(new Set())
    setLinkedAttributes(new Map())
  }, [])

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      handleReset()
    }
  }, [open, handleReset])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        <DialogHeader className="mt-2">
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="size-5" />
            {t('link-frameworks')}
          </DialogTitle>
          <DialogDescription className={cn(isArabic && 'text-right')}>
            {t('link-frameworks-description')} &quot;{sourceAttributeName}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 flex-col gap-6 overflow-hidden">
          {/* Link Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="link-name">{t('link-name')}</Label>
                <Input
                  id="link-name"
                  value={linkName}
                  onChange={(e) => setLinkName(e.target.value)}
                  placeholder={t('link-name-placeholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link-description">
                  {t('link-description')}
                </Label>
                <Input
                  id="link-description"
                  value={linkDescription}
                  onChange={(e) => setLinkDescription(e.target.value)}
                  placeholder={t('link-description-placeholder')}
                />
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col items-start justify-center gap-3">
            {/* Available Frameworks */}
            <div className="w-full space-y-3">
              <h3 className="font-medium">{t('available-frameworks')}</h3>
              <ScrollArea
                className="h-[200px] w-full rounded-md border p-4"
                dir={isArabic ? 'rtl' : 'ltr'}
              >
                {isLoadingFrameworks ? (
                  <div className="flex h-32 items-center justify-center">
                    <Loader2 className="size-6 animate-spin" />
                  </div>
                ) : availableFrameworks.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    {t('no-frameworks-available-for-linking')}
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
                            'flex items-center gap-2 p-3 rounded-md border cursor-pointer transition-colors',
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
                              {framework.attributes.length} {t('attributes')}
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
            <div className="w-full space-y-3">
              <h3 className="font-medium">
                {t('selected-frameworks-details')}
              </h3>
              <ScrollArea
                className="h-[250px] rounded-md border p-4"
                dir={isArabic ? 'rtl' : 'ltr'}
              >
                {selectedFrameworks.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                    <Plus className="mx-auto mb-2 size-8 opacity-50" />
                    {t('select-frameworks-to-view-structure')}
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
                              className={cn(
                                'flex cursor-pointer items-center gap-2',
                                isArabic && 'flex-row-reverse',
                              )}
                              onClick={() =>
                                toggleFrameworkExpansion(framework.id)
                              }
                            >
                              {isExpanded ? (
                                <ChevronDown className="size-4" />
                              ) : (
                                <ChevronRight
                                  className={cn(
                                    'size-4',
                                    isArabic && 'rotate-180',
                                  )}
                                />
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
                                  createUINestedStructure(framework)
                                return renderNestedAttributes(
                                  nestedStructure,
                                  framework.id,
                                )
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
            {t('cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isCreating || selectedFrameworks.length === 0}
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {t('creating-link')}
              </>
            ) : (
              <>
                <Link2 className="mr-2 size-4" />
                {t('create-link')}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default FrameworkLinkDialog
