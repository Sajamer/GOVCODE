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
  Link2,
  Loader2,
  Settings,
  Trash2,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { FC, useState } from 'react'
import ConfirmationDialog from './modals/ConfirmationDialog'

interface LinkedFrameworksDisplayProps {
  attributeId: string
  onEditLink?: (linkId: string) => void
}

const LinkedFrameworksDisplay: FC<LinkedFrameworksDisplayProps> = ({
  attributeId,
  onEditLink,
}) => {
  const t = useTranslations('general')
  const isArabic = usePathname().includes('/ar')

  const queryClient = useQueryClient()
  const [expandedLinks, setExpandedLinks] = useState<Set<string>>(new Set())

  // Confirmation dialog state
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [linkToDelete, setLinkToDelete] = useState<{
    id: string
    name?: string
  } | null>(null)

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
        description: t('framework-link-deleted-successfully'),
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
            : t('failed-to-delete-framework-link'),
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
    setLinkToDelete({ id: linkId, name: linkName })
    setShowDeleteConfirmation(true)
  }

  // Confirm delete handler
  const handleConfirmDelete = () => {
    if (linkToDelete) {
      deleteLink(linkToDelete.id)
    }
    setShowDeleteConfirmation(false)
    setLinkToDelete(null)
  }

  // Close confirmation dialog
  const handleCloseConfirmation = () => {
    setShowDeleteConfirmation(false)
    setLinkToDelete(null)
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
        <p className="text-muted-foreground">{t('no-framework-links-found')}</p>
        <p className="text-sm text-muted-foreground">
          {t('click-link-icon-to-create')}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4" dir={isArabic ? 'rtl' : 'ltr'}>
        {frameworkLinks.map((link) => {
          const isExpanded = expandedLinks.has(link.id)

          return (
            <Card key={link.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link2 className="size-5 text-primary" />
                    <CardTitle className="text-lg">
                      {link.name || t('framework-link')}
                    </CardTitle>
                    <span className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                      {link.linkedFrameworks.length}{' '}
                      {link.linkedFrameworks.length === 1
                        ? t('frameworks-count')
                        : t('frameworks-count-plural')}
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
                          {isExpanded ? t('collapse') : t('expand')}{' '}
                          {t('details')}
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
                          <TooltipContent>{t('edit-link')}</TooltipContent>
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
                        <TooltipContent>{t('delete-link')}</TooltipContent>
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
                  {t('created-by')}{' '}
                  {link.creator.fullName || link.creator.email}
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent>
                  <div className="space-y-4">
                    <h4 className="font-medium">
                      {t('linked-frameworks-hierarchy')}
                    </h4>

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
                                {t('level')} {linkedFramework.level} •{' '}
                                {linkedFramework.targetFramework.attributes
                                  ?.length || 0}{' '}
                                {t('attributes')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Preview of framework data */}
                    <div className="mt-6">
                      <h5 className="mb-3 font-medium">
                        {t('framework-data-preview')}
                      </h5>

                      {/* Show the source attribute that we are linking with */}
                      <ScrollArea
                        className={cn('h-48 rounded-md border')}
                        dir={isArabic ? 'rtl' : 'ltr'}
                      >
                        <div className="bg-primary/10 p-3">
                          <h6 className="mb-1 text-sm font-medium text-primary">
                            {t('linking-attribute')}:
                          </h6>
                          <p className="text-primary/80 text-sm">
                            <span className="font-medium">
                              {link.sourceAttribute.name}
                            </span>
                            {link.sourceAttribute.value && (
                              <>: {link.sourceAttribute.value}</>
                            )}
                          </p>
                        </div>
                        <div className="p-3">
                          {link.linkedFrameworks.map((linkedFramework) => (
                            <div key={linkedFramework.id} className="mb-4">
                              <h6 className="mb-1 text-sm font-medium text-primary">
                                {t('with')}
                              </h6>
                              {linkedFramework.targetAttribute && (
                                <div className="ml-4 space-y-1 text-sm">
                                  <div className="flex gap-2">
                                    <span className="text-muted-foreground">
                                      •
                                    </span>
                                    <span>
                                      {linkedFramework.targetAttribute.value ||
                                        'N/A'}
                                    </span>
                                  </div>
                                </div>
                              )}
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

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteConfirmation}
        onClose={handleCloseConfirmation}
        callback={handleConfirmDelete}
        title={t('delete-framework-link')}
        subTitle={t('delete-confirmation', {
          name: linkToDelete?.name || t('framework-link'),
        })}
        type="destructive"
        isLoading={isDeleting}
      />
    </>
  )
}

export default LinkedFrameworksDisplay
