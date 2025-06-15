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
                auditRule: {
                  include: {
                    status: true,
                  },
                },
                attachments: {
                  orderBy: {
                    createdAt: 'desc',
                  },
                },
              },
            },
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
        auditDetails:
          attribute.auditDetails?.map((detail) => ({
            id: detail.id,
            frameworkAttributeId: detail.frameworkAttributeId,
            auditCycleId: detail.auditCycleId,
            auditBy: detail.auditBy,
            ownedBy: detail.ownedBy,
            auditRuleId: detail.auditRuleId,
            comment: detail.comment,
            recommendation: detail.recommendation,
            auditor: {
              id: detail.auditor.id,
              fullName: detail.auditor.fullName,
            },
            owner: detail.owner
              ? {
                  id: detail.owner.id,
                  fullName: detail.owner.fullName,
                }
              : null,
            auditRule: {
              id: detail.auditRule.id,
              label: detail.auditRule.label,
              color: detail.auditRule.color,
              statusId: detail.auditRule.statusId,
            },
            attachments:
              detail.attachments?.map((attachment) => ({
                id: attachment.id,
                name: attachment.name,
                url: attachment.url,
                size: attachment.size,
                type: attachment.type,
              })) || [],
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
