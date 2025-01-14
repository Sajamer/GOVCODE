/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { Download } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { FC } from 'react'
import * as XLSX from 'xlsx'

interface IExportButtonProps<T = any> {
  data: T[]
  name: string
  headers?: Record<string, string>
}

const ExportButton: FC<IExportButtonProps> = ({ data, name, headers }) => {
  const t = useTranslations('general')

  const handleDownload = () => {
    if (!data || data.length === 0) {
      toast({
        variant: 'warning',
        title: t('no-data-to-export'),
        description: t('please-provide-data'),
      })
      return
    }

    const formattedData = headers
      ? data.map((item) =>
          Object.keys(headers).reduce(
            (acc, key) => {
              acc[headers[key]] = item[key]
              return acc
            },
            {} as Record<string, any>,
          ),
        )
      : data

    const worksheet = XLSX.utils.json_to_sheet(formattedData)
    const workbook = XLSX.utils.book_new()

    const timestamp = new Date().toISOString().replace(/[:.-]/g, '')
    const filename = `${name}-${timestamp}.xlsx`

    // Adjust column widths dynamically
    const columnWidths = Object.keys(formattedData[0] || {}).map((key) => {
      const maxLength = Math.max(
        key.length, // Header length
        ...formattedData.map((item) => String(item[key] || '').length), // Data length
      )
      return { width: maxLength + 2 } // Add padding for better spacing
    })

    worksheet['!cols'] = columnWidths

    XLSX.utils.book_append_sheet(workbook, worksheet, name)
    XLSX.writeFile(workbook, filename)

    toast({
      variant: 'success',
      title: `${name} downloaded successfully`,
    })
  }

  return (
    <Button
      variant="secondary"
      className="flex size-[2.375rem] items-center justify-center !gap-1 px-3 lg:h-11 lg:w-fit lg:px-0 2xl:w-[13.75rem]"
      onClick={handleDownload}
    >
      <Download size="24" className="text-primary-foreground" />
      <span className="hidden text-sm font-medium lg:flex">
        {t('export-excel')}
      </span>
    </Button>
  )
}

export default ExportButton
