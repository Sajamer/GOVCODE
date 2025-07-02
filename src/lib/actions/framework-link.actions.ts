'use server'

import prisma from '@/lib/db_connection'
import { revalidatePath } from 'next/cache'

// Types for framework linking
export interface CreateFrameworkLinkData {
  name?: string
  description?: string
  sourceFrameworkId: string
  sourceAttributeId: string
  createdBy: string
  targetFrameworks: {
    frameworkId: string
    level: number
    order: number
    targetAttributeId: string // Now required
  }[]
}

export interface UpdateFrameworkLinkData {
  id: string
  name?: string
  description?: string
  targetFrameworks?: {
    id?: string // For updating existing items
    frameworkId: string
    level: number
    order: number
    targetAttributeId: string // Now required
  }[]
}

// Get all frameworks available for linking (excluding the current one)
export const getAvailableFrameworksForLinking = async (
  excludeFrameworkId?: string,
) => {
  try {
    const frameworks = await prisma.framework.findMany({
      where: excludeFrameworkId
        ? {
            id: {
              not: excludeFrameworkId,
            },
          }
        : undefined,
      select: {
        id: true,
        name: true,
        createdAt: true,
        attributes: {
          select: {
            id: true,
            name: true,
            value: true,
            colIndex: true,
            rowIndex: true,
          },
          orderBy: [{ rowIndex: 'asc' }, { colIndex: 'asc' }],
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return {
      success: true,
      frameworks,
    }
  } catch (error) {
    console.error('Error fetching available frameworks for linking:', error)
    return {
      success: false,
      error: 'Failed to fetch available frameworks',
      frameworks: [],
    }
  }
}

// Create a new framework link
export const createFrameworkLink = async (data: CreateFrameworkLinkData) => {
  try {
    // Validate that source framework and attribute exist
    const sourceAttribute = await prisma.frameworkAttribute.findFirst({
      where: {
        id: data.sourceAttributeId,
        frameworkId: data.sourceFrameworkId,
      },
    })

    if (!sourceAttribute) {
      return {
        success: false,
        error: 'Source framework attribute not found',
      }
    }

    // Validate that all target frameworks exist
    const targetFrameworkIds = data.targetFrameworks.map((tf) => tf.frameworkId)
    const existingFrameworks = await prisma.framework.findMany({
      where: {
        id: {
          in: targetFrameworkIds,
        },
      },
      select: { id: true },
    })

    if (existingFrameworks.length !== targetFrameworkIds.length) {
      return {
        success: false,
        error: 'One or more target frameworks not found',
      }
    }

    // Create the framework link with nested items
    const frameworkLink = await prisma.frameworkLink.create({
      data: {
        name: data.name,
        description: data.description,
        sourceFrameworkId: data.sourceFrameworkId,
        sourceAttributeId: data.sourceAttributeId,
        createdBy: data.createdBy,
        linkedFrameworks: {
          create: data.targetFrameworks.map((tf) => ({
            targetFramework: {
              connect: { id: tf.frameworkId },
            },
            targetAttribute: {
              connect: { id: tf.targetAttributeId },
            },
            level: tf.level,
            order: tf.order,
          })),
        },
      },
      include: {
        sourceFramework: {
          select: {
            id: true,
            name: true,
          },
        },
        sourceAttribute: {
          select: {
            id: true,
            name: true,
            value: true,
          },
        },
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        linkedFrameworks: {
          include: {
            targetFramework: {
              select: {
                id: true,
                name: true,
              },
            },
            targetAttribute: {
              select: {
                id: true,
                name: true,
                value: true,
              },
            },
          },
          orderBy: [{ level: 'asc' }, { order: 'asc' }],
        },
      },
    })

    // Revalidate related pages
    revalidatePath('/frameworks')
    revalidatePath(`/frameworks/${data.sourceFrameworkId}`)

    return {
      success: true,
      frameworkLink,
    }
  } catch (error) {
    console.error('Error creating framework link:', error)
    return {
      success: false,
      error: 'Failed to create framework link',
    }
  }
}

// Get framework links for a specific attribute
export const getFrameworkLinksForAttribute = async (attributeId: string) => {
  try {
    const frameworkLinks = await prisma.frameworkLink.findMany({
      where: {
        sourceAttributeId: attributeId,
      },
      include: {
        sourceFramework: {
          select: {
            id: true,
            name: true,
          },
        },
        sourceAttribute: {
          select: {
            id: true,
            name: true,
            value: true,
          },
        },
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        linkedFrameworks: {
          include: {
            targetFramework: {
              include: {
                attributes: {
                  select: {
                    id: true,
                    name: true,
                    value: true,
                    colIndex: true,
                    rowIndex: true,
                    parentId: true,
                  },
                  orderBy: [{ rowIndex: 'asc' }, { colIndex: 'asc' }],
                },
              },
            },
            targetAttribute: {
              select: {
                id: true,
                name: true,
                value: true,
              },
            },
          },
          orderBy: [{ level: 'asc' }, { order: 'asc' }],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return {
      success: true,
      frameworkLinks,
    }
  } catch (error) {
    console.error('Error fetching framework links for attribute:', error)
    return {
      success: false,
      error: 'Failed to fetch framework links',
      frameworkLinks: [],
    }
  }
}

// Get detailed linked frameworks data for display
export const getLinkedFrameworksData = async (frameworkLinkId: string) => {
  try {
    const frameworkLink = await prisma.frameworkLink.findUnique({
      where: {
        id: frameworkLinkId,
      },
      include: {
        sourceFramework: true,
        sourceAttribute: true,
        linkedFrameworks: {
          include: {
            targetFramework: {
              include: {
                attributes: {
                  include: {
                    children: true,
                    auditDetails: {
                      include: {
                        auditor: {
                          select: {
                            id: true,
                            fullName: true,
                          },
                        },
                        owner: {
                          select: {
                            id: true,
                            fullName: true,
                          },
                        },
                        auditRule: true,
                        attachments: true,
                      },
                    },
                  },
                  orderBy: [{ rowIndex: 'asc' }, { colIndex: 'asc' }],
                },
              },
            },
            targetAttribute: true,
          },
          orderBy: [{ level: 'asc' }, { order: 'asc' }],
        },
      },
    })

    if (!frameworkLink) {
      return {
        success: false,
        error: 'Framework link not found',
      }
    }

    return {
      success: true,
      frameworkLink,
    }
  } catch (error) {
    console.error('Error fetching linked frameworks data:', error)
    return {
      success: false,
      error: 'Failed to fetch linked frameworks data',
    }
  }
}

// Update framework link
export const updateFrameworkLink = async (data: UpdateFrameworkLinkData) => {
  try {
    const existingLink = await prisma.frameworkLink.findUnique({
      where: { id: data.id },
      include: {
        linkedFrameworks: true,
      },
    })

    if (!existingLink) {
      return {
        success: false,
        error: 'Framework link not found',
      }
    }

    // Update the main link data
    const updateData: {
      name?: string
      description?: string
      linkedFrameworks?: {
        create: {
          targetFramework: {
            connect: { id: string }
          }
          targetAttribute: {
            connect: { id: string }
          }
          level: number
          order: number
        }[]
      }
    } = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined)
      updateData.description = data.description

    // Handle target frameworks update
    if (data.targetFrameworks) {
      // Delete existing linked frameworks
      await prisma.frameworkLinkItem.deleteMany({
        where: {
          frameworkLinkId: data.id,
        },
      })

      // Create new linked frameworks
      updateData.linkedFrameworks = {
        create: data.targetFrameworks.map((tf) => ({
          targetFramework: {
            connect: { id: tf.frameworkId },
          },
          targetAttribute: {
            connect: { id: tf.targetAttributeId },
          },
          level: tf.level,
          order: tf.order,
        })),
      }
    }

    const updatedLink = await prisma.frameworkLink.update({
      where: { id: data.id },
      data: updateData,
      include: {
        sourceFramework: {
          select: {
            id: true,
            name: true,
          },
        },
        sourceAttribute: {
          select: {
            id: true,
            name: true,
            value: true,
          },
        },
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        linkedFrameworks: {
          include: {
            targetFramework: {
              select: {
                id: true,
                name: true,
              },
            },
            targetAttribute: {
              select: {
                id: true,
                name: true,
                value: true,
              },
            },
          },
          orderBy: [{ level: 'asc' }, { order: 'asc' }],
        },
      },
    })

    // Revalidate related pages
    revalidatePath('/frameworks')
    revalidatePath(`/frameworks/${existingLink.sourceFrameworkId}`)

    return {
      success: true,
      frameworkLink: updatedLink,
    }
  } catch (error) {
    console.error('Error updating framework link:', error)
    return {
      success: false,
      error: 'Failed to update framework link',
    }
  }
}

// Delete framework link
export const deleteFrameworkLink = async (frameworkLinkId: string) => {
  try {
    const existingLink = await prisma.frameworkLink.findUnique({
      where: { id: frameworkLinkId },
      select: {
        sourceFrameworkId: true,
      },
    })

    if (!existingLink) {
      return {
        success: false,
        error: 'Framework link not found',
      }
    }

    await prisma.frameworkLink.delete({
      where: { id: frameworkLinkId },
    })

    // Revalidate related pages
    revalidatePath('/frameworks')
    revalidatePath(`/frameworks/${existingLink.sourceFrameworkId}`)

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error deleting framework link:', error)
    return {
      success: false,
      error: 'Failed to delete framework link',
    }
  }
}

// Get all framework links for a specific framework
export const getFrameworkLinksForFramework = async (frameworkId: string) => {
  try {
    const frameworkLinks = await prisma.frameworkLink.findMany({
      where: {
        sourceFrameworkId: frameworkId,
      },
      include: {
        sourceAttribute: {
          select: {
            id: true,
            name: true,
            value: true,
          },
        },
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        linkedFrameworks: {
          include: {
            targetFramework: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: [{ level: 'asc' }, { order: 'asc' }],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return {
      success: true,
      frameworkLinks,
    }
  } catch (error) {
    console.error('Error fetching framework links for framework:', error)
    return {
      success: false,
      error: 'Failed to fetch framework links',
      frameworkLinks: [],
    }
  }
}

// Check if an attribute has any linked frameworks
export const hasLinkedFrameworks = async (
  attributeId: string,
): Promise<boolean> => {
  try {
    const count = await prisma.frameworkLink.count({
      where: {
        sourceAttributeId: attributeId,
      },
    })

    return count > 0
  } catch (error) {
    console.error('Error checking linked frameworks:', error)
    return false
  }
}

// Reorder framework link items
export const reorderFrameworkLinkItems = async (
  items: { id: string; level: number; order: number }[],
) => {
  try {
    // Update each item's level and order
    const updatePromises = items.map((item) =>
      prisma.frameworkLinkItem.update({
        where: { id: item.id },
        data: {
          level: item.level,
          order: item.order,
        },
      }),
    )

    await Promise.all(updatePromises)

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error reordering framework link items:', error)
    return {
      success: false,
      error: 'Failed to reorder framework link items',
    }
  }
}
