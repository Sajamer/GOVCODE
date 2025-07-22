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

    // Create a map of attributes by ID for easy lookup
    const attributesMap = new Map<string, IFrameworkAttribute>()
    framework.attributes.forEach((attr) => {
      attributesMap.set(attr.id, attr)
    })

    // Build rows by following parent-child relationships from the last column
    const rows: Array<{
      id: string
      cells: Array<{
        value: string | null
        attributeId: string | null
        colIndex: number
      }>
    }> = []

    // Find the last column (evidence) and build relationships backwards
    const lastColumnIndex = Math.max(...sortedColumns)
    const lastColumnAttrs = attributesByColumn[lastColumnIndex] || []

    lastColumnAttrs.forEach((evidenceAttr, index) => {
      const rowCells: Array<{
        value: string | null
        attributeId: string | null
        colIndex: number
      }> = []

      // Build the hierarchy chain backwards from evidence to root
      const buildHierarchyChain = (
        attr: IFrameworkAttribute,
      ): IFrameworkAttribute[] => {
        const chain: IFrameworkAttribute[] = [attr]
        let currentAttr = attr

        while (currentAttr.parentId) {
          const parentAttr = attributesMap.get(currentAttr.parentId)
          if (parentAttr) {
            chain.unshift(parentAttr) // Add to beginning
            currentAttr = parentAttr
          } else {
            break
          }
        }

        return chain
      }

      const hierarchyChain = buildHierarchyChain(evidenceAttr)

      // Create cells for each column
      sortedColumns.forEach((colIndex) => {
        const attrInColumn = hierarchyChain.find(
          (attr) => attr.colIndex === colIndex,
        )

        rowCells.push({
          value: attrInColumn?.value || attrInColumn?.name || null,
          attributeId: attrInColumn?.id || null,
          colIndex,
        })
      })

      rows.push({
        id: `${framework.id}-row-${index}`,
        cells: rowCells,
      })
    })

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
                      dir="auto"
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
                            <span className="block" dir="auto">
                              {cell.value}
                            </span>
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
