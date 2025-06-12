'use server'

import prisma from '@/lib/db_connection'

export const getAllFrameworks = async () => {
  try {
    const frameworks = await prisma.framework.findMany({
      include: {
        status: {
          include: {
            auditRules: true,
          },
        },
        attributes: {
          include: {
            children: true, // Include children relationships
          },
          orderBy: [{ rowIndex: 'asc' }, { colIndex: 'asc' }],
        },
        auditCycles: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
    })

    const totalFrameworks = frameworks.length

    if (!frameworks || totalFrameworks === 0) {
      return {
        frameworks: [],
      }
    }

    const frameworksWithAttributes = frameworks.map((framework) => ({
      id: framework.id,
      name: framework.name,
      status: {
        id: framework.status.id,
        name: framework.status.name,
        auditRules: framework.status.auditRules.map((rule) => ({
          id: rule.id,
          label: rule.label,
          color: rule.color,
        })),
      },
      attributes: framework.attributes.map((attribute) => ({
        id: attribute.id,
        name: attribute.name,
        value: attribute.value,
        parentId: attribute.parentId,
        rowIndex: attribute.rowIndex,
        colIndex: attribute.colIndex,
        children:
          attribute.children?.map((child) => ({
            id: child.id,
            name: child.name,
            value: child.value,
            parentId: child.parentId,
            rowIndex: child.rowIndex,
            colIndex: child.colIndex,
          })) || [],
      })),
      auditCycles: framework.auditCycles.map((cycle) => ({
        id: cycle.id,
        name: cycle.name,
        startDate: cycle.startDate,
        auditBy: cycle.auditBy,
        description: cycle.description,
        user: {
          id: cycle.user.id,
          fullName: cycle.user.fullName,
        },
      })),
    }))

    return {
      frameworks: frameworksWithAttributes,
    }
  } catch (error) {
    console.error('Error fetching Frameworks:', error)
    throw error
  }
}
