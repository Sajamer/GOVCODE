'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { IFramework, IFrameworkAttribute } from '@/types/framework'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { FC, useMemo } from 'react'

interface IComplianceListViewProps {
  framework: IFramework
}

const ComplianceListView: FC<IComplianceListViewProps> = ({ framework }) => {
  const pathname = usePathname()
  const isArabic = pathname.includes('/ar')
  const t = useTranslations('general')

  // Process data for table display with relationships
  const tableData = useMemo(() => {
    // Group attributes by column index
    const attributesByColumn: Record<number, IFrameworkAttribute[]> = {}

    framework.attributes.forEach((attr) => {
      const colIndex = attr.colIndex || 0
      if (!attributesByColumn[colIndex]) {
        attributesByColumn[colIndex] = []
      }
      attributesByColumn[colIndex].push(attr)
    })

    // Get all unique column names (headers) from all attributes
    const headers = new Map<number, string>()
    framework.attributes.forEach((attr) => {
      if (attr.name && typeof attr.colIndex === 'number') {
        headers.set(attr.colIndex, attr.name)
      }
    })

    // Sort columns by index
    const sortedColumns = Array.from(headers.keys()).sort((a, b) => a - b)

    // Create a map of parent-child relationships
    const attributesMap = new Map<string, IFrameworkAttribute>()
    framework.attributes.forEach((attr) => {
      attributesMap.set(attr.id, attr)
    })

    // Build relationships: Create a hierarchical structure for all columns
    const relationships: Array<{
      cells: Array<{
        attribute: IFrameworkAttribute | null
        colIndex: number
      }>
    }> = []

    // Create a simpler approach: for each column, find all related attributes
    const buildAllRelationships = () => {
      // Start with the first column and build relationships outward
      const firstColumnAttrs = attributesByColumn[sortedColumns[0]] || []

      if (firstColumnAttrs.length === 0) return

      firstColumnAttrs.forEach((firstAttr) => {
        // Find all possible combinations of related attributes in other columns
        const findRelatedCombinations = (
          currentAttr: IFrameworkAttribute,
          currentColIndex: number,
          currentPath: Array<{
            attribute: IFrameworkAttribute | null
            colIndex: number
          }>,
        ): void => {
          // Add current attribute to path
          const newPath = [
            ...currentPath,
            { attribute: currentAttr, colIndex: currentColIndex },
          ]

          // Find next column
          const nextColIndex = sortedColumns.find(
            (col) => col > currentColIndex,
          )

          if (!nextColIndex) {
            // No more columns, add this path as a relationship
            relationships.push({ cells: newPath })
            return
          }

          // Find all children of current attribute in the next column
          const nextColumnAttrs = attributesByColumn[nextColIndex] || []
          const relatedAttrs = nextColumnAttrs.filter(
            (attr) =>
              attr.parentId === currentAttr.id ||
              isRelatedAttribute(currentAttr, attr),
          )

          if (relatedAttrs.length > 0) {
            // Create combinations with each related attribute
            relatedAttrs.forEach((relatedAttr) => {
              findRelatedCombinations(relatedAttr, nextColIndex, newPath)
            })
          } else {
            // No related attributes in next column, but continue with remaining columns
            const remainingColumns = sortedColumns.filter(
              (col) => col > currentColIndex,
            )
            if (remainingColumns.length > 0) {
              // Fill remaining columns with nulls or continue searching
              const finalPath = [...newPath]
              remainingColumns.forEach((colIndex) => {
                finalPath.push({ attribute: null, colIndex })
              })
              relationships.push({ cells: finalPath })
            }
          }
        }

        // Start building relationships from first column
        findRelatedCombinations(firstAttr, sortedColumns[0], [])
      })
    }

    // Helper function to check if attributes are related
    const isRelatedAttribute = (
      parent: IFrameworkAttribute,
      child: IFrameworkAttribute,
    ): boolean => {
      // Direct parent-child relationship
      if (child.parentId === parent.id) return true

      // Check if they're in the same hierarchy
      const findAllAncestors = (attrId: string): string[] => {
        const ancestors: string[] = []
        const attr = framework.attributes.find((a) => a.id === attrId)
        if (attr?.parentId) {
          ancestors.push(attr.parentId)
          ancestors.push(...findAllAncestors(attr.parentId))
        }
        return ancestors
      }

      const childAncestors = findAllAncestors(child.id)
      return childAncestors.includes(parent.id)
    }

    buildAllRelationships()

    // Create rows from relationships
    const rows: Array<{
      id: string
      cells: Array<{
        value: string | null
        attributeId: string | null
        colIndex: number
      }>
    }> = []

    relationships.forEach((rel, relIndex) => {
      const row = {
        id: `${framework.id}-rel-${relIndex}`,
        cells: sortedColumns.map((colIndex) => {
          // Find the cell for this column in the relationship
          const cellInColumn = rel.cells.find(
            (cell) => cell.colIndex === colIndex,
          )

          if (cellInColumn?.attribute) {
            return {
              value:
                cellInColumn.attribute.value || cellInColumn.attribute.name,
              attributeId: cellInColumn.attribute.id,
              colIndex,
            }
          }

          return {
            value: null,
            attributeId: null,
            colIndex,
          }
        }),
      }
      rows.push(row)
    })

    // Fallback: If no relationships found, create cross-product of all columns
    if (rows.length === 0) {
      // Create all possible combinations between all columns
      const createCrossProduct = (
        colIndex: number,
        currentCombination: Array<IFrameworkAttribute | null>,
      ): void => {
        if (colIndex >= sortedColumns.length) {
          // Complete combination found
          if (currentCombination.some((attr) => attr !== null)) {
            const row = {
              id: `${framework.id}-cross-${rows.length}`,
              cells: currentCombination.map((attr, idx) => ({
                value: attr?.value || attr?.name || null,
                attributeId: attr?.id || null,
                colIndex: sortedColumns[idx],
              })),
            }
            rows.push(row)
          }
          return
        }

        const currentColIndex = sortedColumns[colIndex]
        const attrsInColumn = attributesByColumn[currentColIndex] || []

        if (attrsInColumn.length === 0) {
          // No attributes in this column, continue with null
          const newCombination = [...currentCombination]
          newCombination[colIndex] = null
          createCrossProduct(colIndex + 1, newCombination)
        } else {
          // Try each attribute in this column
          attrsInColumn.forEach((attr) => {
            const newCombination = [...currentCombination]
            newCombination[colIndex] = attr
            createCrossProduct(colIndex + 1, newCombination)
          })
        }
      }

      createCrossProduct(0, [])
    }

    // Debug: Log the structure to help understand the data
    console.log('Framework attributes:', framework.attributes)
    console.log('Relationships:', relationships)
    console.log('Final rows:', rows)

    return {
      framework,
      headers: sortedColumns.map((colIndex) => ({
        colIndex,
        name: headers.get(colIndex) || `Column ${colIndex}`,
      })),
      rows,
    }
  }, [framework])

  if (!framework) {
    return (
      <div className="flex min-h-[200px] w-full items-center justify-center">
        <p className="text-muted-foreground">{t('no-frameworks-yet')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card key={tableData.framework.id} className="rounded-[1.25rem]">
        <CardContent className="p-0">
          <div className="relative overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border">
                  <TableHead
                    className={cn(
                      'w-12 bg-primary text-center font-medium text-white',
                      isArabic && 'text-right',
                    )}
                  >
                    #
                  </TableHead>
                  {tableData.headers.map((header) => (
                    <TableHead
                      key={header.colIndex}
                      className={cn(
                        'bg-primary font-medium text-white flex-1',
                        isArabic && 'text-right',
                      )}
                    >
                      {header.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.rows.map((row, rowIndex) => (
                  <TableRow
                    key={row.id}
                    className="border-b border-border hover:bg-[#266a55]/60 hover:text-white"
                  >
                    <TableCell
                      className={cn(
                        'w-12 text-center font-medium text-muted-foreground',
                        isArabic && 'text-right',
                      )}
                    >
                      {rowIndex + 1}
                    </TableCell>
                    {row.cells.map((cell, cellIndex) => (
                      <TableCell
                        key={`${row.id}-${cellIndex}`}
                        className={cn(
                          'text-sm max-w-sm',
                          isArabic && 'text-right',
                        )}
                      >
                        <div className="space-y-1">
                          {cell.value ? (
                            <span className="block">{cell.value}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ComplianceListView
