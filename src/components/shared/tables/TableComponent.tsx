'use client'

import { Icons } from '@/components/icons/Icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useSheetStore, type SheetNames } from '@/stores/sheet-store'
import { ArrowUp } from 'iconsax-react'
import _ from 'lodash'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import Date from './tableColumnComponents/Date'

interface ITableComponentProps<T extends object> {
  hasHeader?: boolean
  hideActions?: boolean
  showSettings?: boolean
  title?: string
  subtitle?: string
  filters?: string[]
  actionButton?: JSX.Element
  hasFooter?: boolean
  tableActions?: (rowData: T) => JSX.Element // Define tableActions to accept a T
  addProps?: {
    sheetToOpen: SheetNames
    label: string
    rowId?: string
  }
  data: Array<ITableRow<T>> // Array of ITableRow objects constrained by T
  headers: Array<ITableHeader<T>>
  tableFooterStyle?: string
}

const TableComponent = <T extends object>({
  hasHeader,
  hideActions,
  title: initialTitle,
  subtitle,
  showSettings,
  filters,
  actionButton,
  addProps,
  hasFooter,
  tableActions, // Accept a function for actions
  data,
  headers,
  tableFooterStyle,
}: ITableComponentProps<T>): JSX.Element => {
  const [isPushed, setIsPushed] = useState(false)
  const tableRef = useRef<HTMLTableElement>(null)
  const cardContentRef = useRef<HTMLDivElement>(null)
  const [sortedColumn, setSortedColumn] = useState<{
    column: number | null
    order: 'asc' | 'desc' | null
  }>({ column: null, order: null })

  const { openSheet } = useSheetStore((store) => store.actions)

  const router = useRouter()

  const isArabic = usePathname().includes('/ar')
  const t = useTranslations('general')

  const checkHorizontalScroll = useCallback(() => {
    const cardContent = cardContentRef.current
    if (
      cardContent &&
      cardContent.scrollWidth > cardContent.clientWidth &&
      !hideActions
    ) {
      const lastChildren = tableRef.current?.querySelectorAll(
        'tbody tr td:last-child',
      )
      lastChildren?.forEach((lastChild) => {
        lastChild.classList.add('absolute-last-child')
      })
      setIsPushed(true)
    } else {
      const lastChildren = tableRef.current?.querySelectorAll(
        'tbody tr td:last-child',
      )
      lastChildren?.forEach((lastChild) => {
        lastChild.classList.remove('absolute-last-child')
      })
      setIsPushed(false)
    }
  }, [hideActions, setIsPushed])

  const sortedData =
    sortedColumn.column !== null
      ? _.sortBy(data, (toSort) => {
          if (sortedColumn.column === null) return toSort

          // Access the cell using the column index and get the value
          const cell = toSort.cells[sortedColumn.column]
          const value = cell.value

          if (typeof value === 'object' && value !== null && 'name' in value) {
            return String((value as { name: string }).name).toLowerCase()
          }

          return typeof value === 'string' ? value.toLowerCase() : value
        })
      : data

  if (sortedColumn.order === 'desc') {
    sortedData.reverse()
  }

  const TableHeader = (header: ITableHeader<T>): JSX.Element => {
    const { isSortable, key } = header

    const formatKey = (key: string): string => {
      const formattedKey = key.replace(/^_/, '').replace(/_/g, ' ')
      return formattedKey.charAt(0).toUpperCase() + formattedKey.slice(1)
    }

    return isSortable ? (
      <th className="px-6 py-3 text-left">
        <div
          className="flex cursor-pointer items-center gap-1 text-sm font-medium capitalize text-zinc-800"
          onClick={() => sortColumn(headers.indexOf(header))}
        >
          <span>{t(formatKey(String(key)))}</span>
          <div>
            <Icons.SortingArrows className="size-3 min-h-3 min-w-3" />
          </div>
        </div>
      </th>
    ) : (
      <th
        className={cn(
          'px-6 py-3 text-left text-sm font-medium capitalize text-zinc-800',
          isArabic && 'text-right',
        )}
      >
        {t(formatKey(String(key)))}
      </th>
    )
  }

  const sortColumn = (columnKey: number): void => {
    const isAsc =
      sortedColumn.column === columnKey && sortedColumn.order === 'asc'
    const isDesc =
      sortedColumn.column === columnKey && sortedColumn.order === 'desc'
    if (isAsc) {
      setSortedColumn({ column: columnKey, order: 'desc' })
    } else if (isDesc) {
      setSortedColumn({ column: null, order: null })
    } else {
      setSortedColumn({ column: columnKey, order: 'asc' })
    }
  }

  const TableRow = <T extends object>({
    row,
    rowIndex,
    originalRow,
    tableActions, // Receive tableActions explicitly
    hideActions,
    isPushed,
  }: {
    row: ITableCell<T>[]
    rowIndex: number
    originalRow: T
    tableActions?: (rowData: T) => JSX.Element
    hideActions?: boolean
    isPushed: boolean
  }): JSX.Element => (
    <tr
      key={rowIndex}
      className={cn(
        'group h-12 w-full border-b border-zinc-200 hover:bg-surface-primary',
        isPushed && 'children:last:pr-[5.6875rem] md:children:last:pr-11',
      )}
    >
      {row.map((value, index) => (
        <td key={index} className="px-6 py-4 text-left">
          {TableCell(value.type, value.value)}
        </td>
      ))}
      {!hideActions && tableActions ? (
        <td className="relative w-[4.5rem] px-6 py-4 md:w-[5.75rem]">
          {/* Explicitly call tableActions with originalRow */}
          {tableActions(originalRow)}
        </td>
      ) : null}
    </tr>
  )

  useEffect(() => {
    checkHorizontalScroll()
    window.addEventListener('resize', checkHorizontalScroll)
    return (): void => {
      window.removeEventListener('resize', checkHorizontalScroll)
    }
  }, [checkHorizontalScroll])

  return (
    <div className="w-full">
      <Card className="rounded-[1.25rem]">
        <CardContent className="remove-scrollbar relative flex w-full flex-col overflow-hidden rounded-[1.25rem] bg-zinc-50 p-0">
          {hasHeader && (
            <div className="flex h-[5.375rem] w-full items-center justify-between py-4 pl-4 pr-3 md:px-6">
              <div className="flex max-w-[30%] flex-col gap-1 sm:max-w-none">
                <div className="flex flex-col items-start gap-2.5 md:min-w-[12.5rem] md:flex-row">
                  <div className="group flex items-center">
                    <div className="line-clamp-1 text-xl font-medium capitalize text-zinc-800">
                      {initialTitle}
                    </div>
                  </div>
                  {filters && filters.length > 0 ? (
                    <div className="flex max-w-full items-center gap-2.5 overflow-hidden">
                      {filters.map((filter) => (
                        <div
                          key={filter}
                          className="w-fit whitespace-nowrap rounded-2xl bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-800"
                        >
                          {filter}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div
                  className={cn(
                    'line-clamp-1 max-w-full text-[0.8125rem] text-zinc-500 md:min-w-[12.5rem]',
                    filters && filters.length > 0 && 'hidden md:block',
                  )}
                >
                  {subtitle}
                </div>
              </div>
              <div className="flex items-center">
                {addProps && (
                  <>
                    <Button
                      variant={'default'}
                      onClick={() => {
                        openSheet({
                          sheetToOpen: addProps.sheetToOpen,
                          rowId: addProps.rowId,
                          isEdit: false,
                        })
                      }}
                      className={cn(
                        'flex h-11 items-center justify-center !gap-[0.38rem] px-2.5 text-sm font-medium',
                        hasHeader
                          ? 'text-zinc-800 bg-transparent hover:bg-zinc-0'
                          : 'hidden',
                      )}
                    >
                      <Icons.Add
                        className={cn(
                          'size-4 min-h-4 min-w-4 text-zinc-0',
                          hasHeader && 'text-zinc-800',
                        )}
                      />
                      <span>{addProps.label}</span>
                    </Button>
                    <div className="pl-1 md:pl-6">{actionButton}</div>
                  </>
                )}

                {showSettings && (
                  <Button
                    variant={'outline'}
                    className="px-2.5"
                    onClick={() => router.push('/master-settings')}
                  >
                    <Label className="cursor-pointer">Go to settings</Label>
                    <ArrowUp
                      className="size-4 rotate-45 font-medium text-zinc-800"
                      variant="Linear"
                    />
                  </Button>
                )}
              </div>
            </div>
          )}
          <div className={cn('border-t border-zinc-200 p-5')}>
            <div
              ref={cardContentRef}
              className="remove-scrollbar relative max-w-full overflow-auto"
            >
              <table
                ref={tableRef}
                dir={isArabic ? 'rtl' : 'ltr'}
                className="table-1 relative w-full border-collapse"
              >
                <thead>
                  <tr className="h-12 w-full border-b border-zinc-200">
                    {headers.map((header) => (
                      <Fragment key={String(header.key)}>
                        {TableHeader(header)}
                      </Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((rowData, rowIndex) => (
                    <TableRow
                      key={rowIndex}
                      row={rowData.cells}
                      rowIndex={rowIndex}
                      originalRow={rowData.original}
                      tableActions={tableActions}
                      hideActions={hideActions}
                      isPushed={isPushed}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            {hasFooter && (
              <div
                className={cn(
                  'flex w-full items-center justify-center pb-2.5',
                  tableFooterStyle,
                )}
              >
                <Button
                  variant={'ghost'}
                  onClick={() => {
                    openSheet({
                      sheetToOpen: addProps?.sheetToOpen,
                      isEdit: false,
                    })
                  }}
                  className={cn(
                    'flex h-[4rem] items-center justify-center gap-[0.38rem] px-3 text-sm font-medium',
                    hasFooter &&
                      'font-normal group text-zinc-500 w-full flex !gap-[0.38rem] !justify-start rounded-t-none rounded-b-2xl hover:bg-zinc-50 hover:text-zinc-800',
                  )}
                >
                  <Icons.Add
                    className={cn(
                      'size-4 min-h-4 min-w-4 text-zinc-0',
                      hasFooter &&
                        'text-zinc-500 transition-colors group-hover:text-zinc-800',
                    )}
                  />
                  <span className={cn(!hasFooter && 'hidden md:block')}>
                    {addProps?.label}
                  </span>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TableComponent

const TableCell = <T,>(type: CellType, value: T): JSX.Element => {
  const isArabic = usePathname().includes('/ar')
  const t = useTranslations('general')

  const translatedValue = value as string
  translatedValue.toLowerCase()

  console.log('translatedValue', translatedValue)

  switch (type.toLowerCase()) {
    case 'date':
      return <Date date={value as string} />
    case 'translated':
      return (
        <div
          className={cn(
            'max-w-xs truncate whitespace-nowrap text-sm font-medium capitalize text-zinc-800',
            isArabic && 'text-right',
          )}
        >
          {t(`options.${translatedValue}`) ?? '-'}
        </div>
      )
    default:
      return (
        <div
          className={cn(
            'max-w-xs truncate whitespace-nowrap text-sm font-medium capitalize text-zinc-800',
            isArabic && 'text-right',
          )}
        >
          {value ? String(value) : '-'}
        </div>
      )
  }
}
