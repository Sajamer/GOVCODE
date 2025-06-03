'use server'

import prisma from '@/lib/db_connection'

export const getAllFrameworks = async () => {
  try {
    const frameworks = await prisma.framework.findMany({
      include: {
        attributes: {
          include: {
            children: true, // Include children relationships
          },
          orderBy: [{ rowIndex: 'asc' }, { colIndex: 'asc' }],
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
    }))

    return {
      frameworks: frameworksWithAttributes,
    }
  } catch (error) {
    console.error('Error fetching Frameworks:', error)
    throw error
  }
}
