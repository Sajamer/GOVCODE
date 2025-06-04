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
  frameworks: IFramework[]
}

const ComplianceListView: FC<IComplianceListViewProps> = ({ frameworks }) => {
  const pathname = usePathname()
  const isArabic = pathname.includes('/ar')
  const t = useTranslations('general')

  // Process data for table display
  const tableData = useMemo(() => {
    return frameworks.map((framework) => {
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

      // Create rows by matching attributes across columns
      const rows: Array<{
        id: string
        cells: Array<{
          value: string | null
          attributeId: string | null
          colIndex: number
        }>
      }> = []

      // Get the maximum number of rows needed (based on the column with most attributes)
      const maxRows = Math.max(
        ...sortedColumns.map((col) => attributesByColumn[col]?.length || 0),
      )

      for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
        const row = {
          id: `${framework.id}-row-${rowIndex}`,
          cells: sortedColumns.map((colIndex) => {
            const attributesInColumn = attributesByColumn[colIndex] || []
            const attr = attributesInColumn[rowIndex] // Get attribute at this row position
            return {
              value: attr?.value || null,
              attributeId: attr?.id || null,
              colIndex,
            }
          }),
        }
        rows.push(row)
      }

      return {
        framework,
        headers: sortedColumns.map((colIndex) => ({
          colIndex,
          name: headers.get(colIndex) || `Column ${colIndex}`,
        })),
        rows,
      }
    })
  }, [frameworks])

  if (frameworks.length === 0) {
    return (
      <div className="flex min-h-[200px] w-full items-center justify-center">
        <p className="text-muted-foreground">{t('no-frameworks-yet')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {tableData.map(({ framework, headers, rows }) => (
        <Card key={framework.id} className="rounded-[1.25rem]">
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
                    {headers.map((header) => (
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
                  {rows.map((row, rowIndex) => (
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
                          <span>{cell.value ? cell.value : '-'}</span>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default ComplianceListView
