'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { toast } from '@/hooks/use-toast'
import {
  deleteFrameworkLink,
  getFrameworkLinksForAttribute,
} from '@/lib/actions/framework-link.actions'
import { cn } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowDown,
  ArrowUp,
  Eye,
  Link2,
  Loader2,
  Settings,
  Trash2,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { FC, useState } from 'react'

interface LinkedFrameworksDisplayProps {
  attributeId: string
  onEditLink?: (linkId: string) => void
}

const LinkedFrameworksDisplay: FC<LinkedFrameworksDisplayProps> = ({
  attributeId,
  onEditLink,
}) => {
  const t = useTranslations('general')
  const queryClient = useQueryClient()
  const [expandedLinks, setExpandedLinks] = useState<Set<string>>(new Set())

  // Fetch framework links for this attribute
  const { data: linksData, isLoading } = useQuery({
    queryKey: ['framework-links-for-attribute', attributeId],
    queryFn: () => getFrameworkLinksForAttribute(attributeId),
  })

  const frameworkLinks = linksData?.frameworkLinks || []

  // Delete framework link mutation
  const { mutate: deleteLink, isPending: isDeleting } = useMutation({
    mutationFn: async (linkId: string) => {
      const result = await deleteFrameworkLink(linkId)
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete framework link')
      }
      return result
    },
    onSuccess: () => {
      toast({
        variant: 'success',
        title: t('success'),
        description: 'Framework link deleted successfully',
      })

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['framework-links-for-attribute', attributeId],
      })
      queryClient.invalidateQueries({ queryKey: ['frameworks'] })
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: t('error'),
        description:
          error instanceof Error
            ? error.message
            : 'Failed to delete framework link',
      })
    },
  })

  // Toggle expanded state for a link
  const toggleExpanded = (linkId: string) => {
    setExpandedLinks((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(linkId)) {
        newSet.delete(linkId)
      } else {
        newSet.add(linkId)
      }
      return newSet
    })
  }

  // Handle delete link
  const handleDeleteLink = (linkId: string, linkName?: string) => {
    if (
      confirm(
        `Are you sure you want to delete the link "${linkName || 'Unnamed Link'}"?`,
      )
    ) {
      deleteLink(linkId)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-md border p-8">
        <Loader2 className="size-6 animate-spin" />
      </div>
    )
  }

  if (frameworkLinks.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center">
        <Link2 className="mx-auto mb-4 size-12 text-muted-foreground/50" />
        <p className="text-muted-foreground">No framework links found</p>
        <p className="text-sm text-muted-foreground">
          Click the link icon to create framework relationships
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {frameworkLinks.map((link) => {
        const isExpanded = expandedLinks.has(link.id)

        return (
          <Card key={link.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link2 className="size-5 text-primary" />
                  <CardTitle className="text-lg">
                    {link.name || 'Framework Link'}
                  </CardTitle>
                  <span className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                    {link.linkedFrameworks.length} framework
                    {link.linkedFrameworks.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(link.id)}
                        >
                          {isExpanded ? (
                            <ArrowUp className="size-4" />
                          ) : (
                            <ArrowDown className="size-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isExpanded ? 'Collapse' : 'Expand'} details
                      </TooltipContent>
                    </Tooltip>

                    {onEditLink && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditLink(link.id)}
                          >
                            <Settings className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit link</TooltipContent>
                      </Tooltip>
                    )}

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDeleteLink(link.id, link.name || undefined)
                          }
                          disabled={isDeleting}
                          className="text-destructive hover:text-destructive"
                        >
                          {isDeleting ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete link</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {link.description && (
                <p className="text-sm text-muted-foreground">
                  {link.description}
                </p>
              )}

              <div className="text-xs text-muted-foreground">
                Created by {link.creator.fullName || link.creator.email}
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent>
                <div className="space-y-4">
                  <h4 className="font-medium">Linked Frameworks Hierarchy</h4>

                  <div className="space-y-3">
                    {link.linkedFrameworks.map((linkedFramework, index) => (
                      <div
                        key={linkedFramework.id}
                        className={cn(
                          'flex items-center gap-3 rounded-md border p-3',
                          index % 2 === 0 ? 'bg-muted/30' : 'bg-background',
                        )}
                        style={{
                          marginLeft: `${(linkedFramework.level - 1) * 20}px`,
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                            {linkedFramework.level}
                          </span>
                          <div>
                            <p className="font-medium">
                              {linkedFramework.targetFramework.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Level {linkedFramework.level} •{' '}
                              {linkedFramework.targetFramework.attributes
                                ?.length || 0}{' '}
                              attributes
                            </p>
                          </div>
                        </div>

                        <div className="ml-auto">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1"
                            onClick={() => {
                              // Navigate to framework details - you can implement this
                              toast({
                                title: 'Navigate to Framework',
                                description: `Opening ${linkedFramework.targetFramework.name}`,
                              })
                            }}
                          >
                            <Eye className="size-3" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Preview of framework data */}
                  <div className="mt-6">
                    <h5 className="mb-3 font-medium">Framework Data Preview</h5>
                    <ScrollArea className="h-48 rounded-md border">
                      <div className="p-4">
                        {link.linkedFrameworks.map((linkedFramework) => (
                          <div key={linkedFramework.id} className="mb-4">
                            <h6 className="mb-2 font-medium text-primary">
                              {linkedFramework.targetFramework.name} (Level{' '}
                              {linkedFramework.level})
                            </h6>
                            <div className="ml-4 space-y-1 text-sm">
                              {linkedFramework.targetFramework.attributes
                                ?.slice(0, 3)
                                .map((attr) => (
                                  <div key={attr.id} className="flex gap-2">
                                    <span className="text-muted-foreground">
                                      •
                                    </span>
                                    <span>
                                      {attr.name}: {attr.value || 'N/A'}
                                    </span>
                                  </div>
                                ))}
                              {(linkedFramework.targetFramework.attributes
                                ?.length || 0) > 3 && (
                                <div className="flex gap-2 text-muted-foreground">
                                  <span>•</span>
                                  <span>
                                    ... and{' '}
                                    {(linkedFramework.targetFramework.attributes
                                      ?.length || 0) - 3}{' '}
                                    more attributes
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
}

export default LinkedFrameworksDisplay
