'use server'

import prisma from '@/lib/db_connection'

export const getAllFrameworks = async () => {
  try {
    const frameworks = await prisma.framework.findMany({
      include: {
        attributes: {
          select: {
            id: true,
            name: true,
            value: true,
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
      attributes: framework.attributes.map((attribute) => ({
        id: attribute.id,
        name: attribute.name,
        value: attribute.value,
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
