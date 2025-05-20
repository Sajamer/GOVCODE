import KPIForm from '@/components/forms/KPIForm'
import TaskManagementForm from '@/components/forms/TaskManagementForm'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { getDepartmentsByOrganizationId } from '@/lib/actions/department.actions'
import { axiosDelete, axiosGet } from '@/lib/axios'
import { cn, generateTableData, searchObjectValueRecursive } from '@/lib/utils'
import { importKpis } from '@/queries/kpiQueries'
import { useGlobalStore } from '@/stores/global-store'
import { SheetNames, useSheetStore } from '@/stores/sheet-store'
import { IKpiFormDropdownData, IKpiResponse } from '@/types/kpi'
import { ITasksManagementResponse } from '@/types/tasks'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ChartSpline,
  Download,
  Import,
  Loader2,
  Plus,
  SlidersHorizontal,
  Trash,
  X,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import BasicDropdown from '../dropdowns/BasicDropdown'
import PageHeader from '../headers/PageHeader'
import AssignTaskDialog from '../modals/AssignTaskDialog'
import ConfirmationDialog from '../modals/ConfirmationDialog'
import NoResultFound from '../NoResultFound'
import ResourceComponent from '../ResourceComponent'
import SheetComponent from '../sheets/SheetComponent'
import TableActionButtons from './GenericTableActionButtons'
import TableComponent from './TableComponent'

interface IGenericTableProps<T extends Record<string, unknown>> {
  title: string
  description: string
  icon?: JSX.Element
  entityKey: keyof T
  sheetName: SheetNames
  showImportExcel?: boolean
  data: T[]
  total: number
  isLoading?: boolean
  columns: Array<{
    key: keyof T | 'actions'
    isSortable: boolean
    type: CellType
  }>
  defaultVisibleColumns?: Array<keyof T | 'actions'>
}

const GenericComponent = <T extends Record<string, unknown>>({
  title,
  description,
  icon,
  entityKey,
  sheetName,
  total,
  showImportExcel = false,
  columns,
  isLoading,
  data,
  defaultVisibleColumns = ['code', 'name', 'calibration'] as Array<
    keyof T | 'actions'
  >,
}: IGenericTableProps<T>): JSX.Element => {
  const queryClient = useQueryClient()
  const t = useTranslations('general')
  const pathname = usePathname()
  const isArabic = pathname.includes('/ar')

  const { actions, searchTerm, sheetToOpen, isEdit, rowId } = useSheetStore(
    (store) => store,
  )
  const { openSheet, setSearchTerm } = actions

  const { hasPermission, organizationId } = useGlobalStore((store) => store)

  const { data: departmentData } = useQuery({
    queryKey: ['departments', organizationId],
    queryFn: async () => await getDepartmentsByOrganizationId(organizationId),
    staleTime: 1000 * 60 * 5,
  })

  const { data: multipleOptionsDatabaseValues } = useQuery({
    queryKey: ['multipleOptionsDatabaseValues'],
    queryFn: () => axiosGet<IKpiFormDropdownData>('kpis'),
    staleTime: 1000 * 60 * 5,
  })

  const departmentOptions = departmentData?.map((option) => ({
    id: String(option.id),
    label: option.name,
    value: option.name,
  }))

  const objectivesOptions =
    multipleOptionsDatabaseValues?.data?.objectives?.map((option) => ({
      id: String(option.id),
      label: option.name,
      value: option.name,
    }))

  const complianceOptions =
    multipleOptionsDatabaseValues?.data?.compliances?.map((option) => ({
      id: String(option.id),
      label: option.name,
      value: option.name,
    }))

  const processOptions = multipleOptionsDatabaseValues?.data?.processes?.map(
    (option) => ({
      id: String(option.id),
      label: option.name,
      value: option.name,
    }),
  )

  const [openConfirmation, setOpenConfirmation] = useState(false)
  const [openAssignTask, setOpenAssignTask] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false)
  const [uploadedFile, setUploadedFile] = useState<File | undefined>(undefined)

  // Add filter state
  const [filters, setFilters] = useState<{
    departmentId?: string | number
    objectiveId?: string | number
    complianceId?: string | number
    processId?: string | number
  }>({})

  const entityData = useMemo(() => data ?? [], [data])

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [filteredTotal, setFilteredTotal] = useState(total)

  const filteredData = useMemo(() => {
    if (!Array.isArray(entityData)) return []

    const searchFiltered = entityData?.filter(
      (entity) => !searchTerm || searchObjectValueRecursive(entity, searchTerm),
    )

    const fullFiltered = searchFiltered.filter((entity) => {
      // Check each filter criteria

      // Department filter
      if (
        filters.departmentId &&
        entity.departmentId !== filters.departmentId
      ) {
        return false
      }

      // Objective filter - check if the entity has an objective with matching ID
      if (filters.objectiveId && Array.isArray(entity.objectives)) {
        const hasMatchingObjective = entity.objectives.some(
          (obj) => obj.id === filters.objectiveId,
        )
        if (!hasMatchingObjective) return false
      }

      // Compliance filter - check if the entity has a compliance with matching ID
      if (filters.complianceId && Array.isArray(entity.compliances)) {
        const hasMatchingCompliance = entity.compliances.some(
          (comp) => comp.id === filters.complianceId,
        )
        if (!hasMatchingCompliance) return false
      }

      // Process filter - check if the entity has a process with matching ID
      if (filters.processId && Array.isArray(entity.processes)) {
        const hasMatchingProcess = entity.processes.some(
          (proc) => proc.id === filters.processId,
        )
        if (!hasMatchingProcess) return false
      }

      return true
    })

    // Update filtered total
    setFilteredTotal(fullFiltered.length)

    // Return paginated results with dynamic itemsPerPage
    const startIndex = (currentPage - 1) * itemsPerPage
    return fullFiltered.slice(startIndex, startIndex + itemsPerPage)
  }, [entityData, searchTerm, filters, currentPage, itemsPerPage])

  // Calculate total pages based on filtered total and items per page
  const totalPages = Math.ceil(filteredTotal / itemsPerPage)

  // Reset pagination when filters change or items per page changes
  useEffect(() => {
    setCurrentPage(1)
  }, [filters, searchTerm, itemsPerPage])

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
  }

  // Handler to update filters
  const handleFilterChange = (
    filterType: keyof typeof filters,
    value: string | number | undefined,
  ) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }))
  }

  // Reset filters when leaving the page
  useEffect(() => {
    setSearchTerm('')
    setFilters({})
  }, [setSearchTerm])

  const { mutate, isPending } = useMutation({
    mutationFn: () => axiosDelete(`${sheetName}/${selectedId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [sheetName as string] })
      setOpenConfirmation(false)
      toast({
        variant: 'success',
        title: 'Deleted Successfully',
        description: `${title} successfully deleted`,
      })
    },
    onError: (error) => {
      setOpenConfirmation(false)
      toast({
        variant: 'destructive',
        title: 'Deletion failed',
        description:
          error instanceof Error ? error.message : 'An error occurred.',
      })
    },
  })

  const { headers, values } = generateTableData(filteredData, columns)

  useEffect(() => {
    setSearchTerm('')
  }, [setSearchTerm])

  const tableActions = (rowData: T): JSX.Element => (
    <TableActionButtons
      rowId={rowData[entityKey] as string}
      callback={() => {
        setSelectedId(rowData[entityKey] as string)
        setOpenConfirmation(true)
      }}
      assignTask={() => {
        setSelectedId(rowData[entityKey] as string)
        setOpenAssignTask(true)
      }}
      sheetName={sheetName as SheetNames}
    />
  )

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]

    if (file) {
      // Check for allowed file types (xls, xlsx)
      const allowedExtensions = ['.xls', '.xlsx']
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || ''

      if (!allowedExtensions.includes(`.${fileExtension}`)) {
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description:
            'Invalid file type. Please upload an Excel file (.xls or .xlsx).',
        })
        return
      }

      setUploadedFile(file)
    }
  }

  const { mutate: uploadMutation, isPending: uploadLoading } = useMutation({
    mutationFn: (file: File) => importKpis(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [sheetName as string] })
      toast({
        variant: 'success',
        title: 'Success',
        description: `Excel successfully added`,
      })
      setIsImportOpen(false)
      setUploadedFile(undefined)
    },
    onError: (error: AxiosErrorType) => {
      toast({
        variant: 'destructive',
        title: 'Import Failed',
        description: error.message || 'Failed to import KPIs',
      })
      // Don't reset file here so user can fix and retry
    },
  })

  const singleEntityData = isEdit
    ? (entityData.find((r) => r[entityKey] === rowId) as T | undefined)
    : undefined

  const localizedTitle = t(title)

  // Add state for visible columns
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(defaultVisibleColumns.map((col) => String(col))),
  )

  // Add column visibility toggle handler
  const toggleColumnVisibility = (columnKey: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev)
      if (next.has(columnKey)) {
        next.delete(columnKey)
      } else {
        next.add(columnKey)
      }
      return next
    })
  }

  // Filter headers based on visibility
  const visibleHeaders = headers.filter((header) =>
    visibleColumns.has(String(header.key)),
  )

  // Filter values to only show visible columns
  const visibleValues = values.map((row) => ({
    ...row,
    cells: row.cells.filter((_, index) =>
      visibleColumns.has(String(headers[index].key)),
    ),
  }))

  // Add ColumnSelector component near line 560
  const ColumnSelector = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-11 ">
          <SlidersHorizontal className="mr-2 size-4" />
          {t('columns')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-[400px] w-[250px] overflow-y-auto overflow-x-hidden"
      >
        <DropdownMenuLabel className="flex items-center justify-between rounded-md">
          {t('toggle-columns')}
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setVisibleColumns(
                new Set(defaultVisibleColumns.map((col) => String(col))),
              )
            }
            className="h-8 px-2 text-xs hover:underline"
          >
            {t('reset')}
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={String(column.key)}
            checked={visibleColumns.has(String(column.key))}
            onCheckedChange={() => toggleColumnVisibility(String(column.key))}
          >
            {String(column.key)}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <>
      <div
        dir={isArabic ? 'rtl' : 'ltr'}
        className="flex w-full flex-col items-start gap-[1.875rem]"
      >
        <PageHeader
          title={title}
          total={total}
          description={description}
          iconWrapper="bg-primary"
          icon={icon ?? <ChartSpline className="text-primary-foreground" />}
        >
          <SheetComponent
            sheetName={sheetName as SheetNames}
            title={
              isEdit
                ? `${t('edit')} ${localizedTitle}`
                : `${t('add-new')} ${localizedTitle}`
            }
            subtitle={
              isEdit
                ? `${t('edit')} ${localizedTitle} ${t('here')}`
                : `${t('define-new')} ${localizedTitle}`
            }
          >
            {sheetToOpen === 'kpis' ? (
              <KPIForm data={singleEntityData as unknown as IKpiResponse} />
            ) : sheetToOpen === 'tasks-management' ? (
              <TaskManagementForm
                data={singleEntityData as unknown as ITasksManagementResponse}
              />
            ) : null}
          </SheetComponent>
          {hasPermission && (
            <>
              {showImportExcel && (
                <Button
                  variant="default"
                  className="flex size-[2.375rem] items-center justify-center !gap-1 px-3 lg:h-11 lg:w-fit lg:px-0 2xl:w-[13.75rem]"
                  onClick={() => {
                    setIsImportOpen(true)
                  }}
                >
                  <Import size="24" className="text-primary-foreground" />
                  <span className="hidden text-sm font-medium lg:flex">
                    {t('import-csv')}
                  </span>
                </Button>
              )}

              <Button
                variant="default"
                onClick={() =>
                  openSheet({
                    sheetToOpen: sheetName as SheetNames,
                    isEdit: false,
                  })
                }
                className="flex size-[2.375rem] items-center justify-center !gap-[0.38rem] px-3 lg:h-11 lg:w-fit 2xl:w-[13.75rem]"
              >
                <Plus size="24" className="text-primary-foreground" />
                <span className="hidden text-sm font-medium lg:flex">
                  {t('add-new') + ' ' + localizedTitle}
                </span>
              </Button>
            </>
          )}
        </PageHeader>

        {isImportOpen && (
          <div className="relative mt-5 flex h-[8.75rem] w-full cursor-pointer items-center justify-center gap-4 rounded-[0.875rem] bg-neutral-100 px-4 py-5 duration-100">
            <Button
              variant="ghost"
              className="absolute right-2 top-0"
              onClick={() => setIsImportOpen(false)}
            >
              <X
                size={20}
                className="text-neutral-500 hover:text-neutral-800"
              />
            </Button>
            <div className="flex w-full flex-col items-start justify-center gap-2">
              <Link
                href={`/api/kpis/generate-sample?id=${organizationId}`}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-neutral-500"
              >
                Download Sample
                <span className="px-1 font-medium text-neutral-800">
                  KPI CSV
                </span>
                Template
              </Link>
              <div
                className={cn(
                  'flex h-[4.625rem] w-full flex-col items-center justify-center gap-2.5 rounded-[0.5rem] border border-dashed border-neutral-300 px-0 py-2.5',
                  uploadedFile && 'flex-row',
                )}
              >
                {!uploadedFile ? (
                  <>
                    <Input
                      type="file"
                      id="importCsv"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <Label
                      htmlFor="importCsv"
                      className="flex size-full cursor-pointer items-center justify-center "
                    >
                      <div className="flex items-start justify-center gap-2">
                        <Download size="20" className="text-neutral-500" />
                        <p className="text-sm text-neutral-500">
                          Drop CSV file here or{' '}
                          <span className="font-medium text-primary">
                            Browse
                          </span>
                        </p>
                      </div>
                    </Label>
                  </>
                ) : (
                  <>
                    <ResourceComponent
                      name={uploadedFile?.name ?? ''}
                      size={
                        uploadedFile?.size
                          ? (uploadedFile?.size / 1024).toPrecision(2) + ' KB'
                          : ''
                      }
                      path=""
                      type={'xlsx'}
                    />
                    <Trash
                      className="size-4 text-red-500"
                      onClick={() => {
                        setUploadedFile(undefined)
                      }}
                    />
                  </>
                )}
              </div>
            </div>
            <Button
              type="button"
              size={'sm'}
              className="mt-5 w-[6.25rem] bg-primary text-neutral-50 disabled:cursor-default"
              disabled={!uploadedFile}
              isLoading={uploadLoading}
              onClick={(e) => {
                e.preventDefault()
                if (uploadedFile) {
                  uploadMutation(uploadedFile)
                }
              }}
            >
              Import
            </Button>
          </div>
        )}
        <div className="flex w-full flex-col gap-[1.88rem]">
          {isLoading ? (
            <div className="flex min-h-[200px] w-full items-center justify-center">
              <Loader2 className="size-16 animate-spin" />
            </div>
          ) : entityData.length > 0 ? (
            <div className="flex w-full flex-col items-start justify-start gap-5">
              <div className="flex w-full items-center justify-between gap-4">
                <div className="flex items-center justify-start gap-4">
                  <span className="whitespace-nowrap text-lg font-semibold">
                    {t('filter-by')}:
                  </span>
                  {departmentOptions && departmentOptions?.length > 0 && (
                    <BasicDropdown
                      data={departmentOptions ?? []}
                      triggerStyle="h-11"
                      placeholder={t('department')}
                      defaultValue={departmentOptions?.find(
                        (option) => +option.id === +filters.departmentId!,
                      )}
                      callback={(option) => {
                        handleFilterChange(
                          'departmentId',
                          option?.id ? +option.id : undefined,
                        )
                      }}
                    />
                  )}
                  {objectivesOptions && objectivesOptions?.length > 0 && (
                    <BasicDropdown
                      data={objectivesOptions ?? []}
                      triggerStyle="h-11"
                      placeholder="objective"
                      defaultValue={objectivesOptions?.find(
                        (option) => +option.id === +filters.objectiveId!,
                      )}
                      callback={(option) =>
                        handleFilterChange(
                          'objectiveId',
                          option?.id ? +option.id : undefined,
                        )
                      }
                    />
                  )}
                  {complianceOptions && complianceOptions?.length > 0 && (
                    <BasicDropdown
                      data={complianceOptions ?? []}
                      triggerStyle="h-11"
                      placeholder="compliance"
                      defaultValue={complianceOptions?.find(
                        (option) => +option.id === +filters.complianceId!,
                      )}
                      callback={(option) =>
                        handleFilterChange(
                          'complianceId',
                          option?.id ? +option.id : undefined,
                        )
                      }
                    />
                  )}
                  {processOptions && processOptions?.length > 0 && (
                    <BasicDropdown
                      data={processOptions ?? []}
                      triggerStyle="h-11"
                      placeholder="process"
                      defaultValue={processOptions?.find(
                        (option) => +option.id === +filters.processId!,
                      )}
                      callback={(option) =>
                        handleFilterChange(
                          'processId',
                          option?.id ? +option.id : undefined,
                        )
                      }
                    />
                  )}
                  {Object.keys(filters).length > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setFilters({})}
                      className="h-11"
                    >
                      {t('clear-filters')}
                    </Button>
                  )}
                </div>
                <ColumnSelector />
              </div>
              <TableComponent
                data={visibleValues}
                headers={visibleHeaders}
                hasFooter={hasPermission && true}
                addProps={{
                  label: `${t('add') + ' ' + localizedTitle}`,
                  sheetToOpen: sheetName as SheetNames,
                }}
                tableActions={tableActions}
                tableFooterStyle="pb-0"
                pagination={{
                  currentPage,
                  totalPages,
                  totalItems: filteredTotal, // Use filtered total instead of total
                  itemsPerPage,
                  onPageChange: handlePageChange,
                  onItemsPerPageChange: handleItemsPerPageChange,
                }}
                showExportExcel
                exportFileName="kpis"
                exportExcelHeaders={{
                  code: 'KPI Code',
                  name: 'KPI',
                  description: 'Description',
                  owner: 'Owner',
                  measurementNumerator: 'Numerator',
                  measurementDenominator: 'Denominator',
                  measurementNumber: 'Measurement Number',
                  resources: 'Resources',
                  unit: 'Unit',
                  frequency: 'Frequency',
                  type: 'Type',
                  calibration: 'Calibration',
                }}
              />
            </div>
          ) : (
            <NoResultFound label={`No ${title} yet.`} />
          )}
        </div>
      </div>
      <ConfirmationDialog
        title={t('confirm-deletion')}
        subTitle={t('deleteConfirmation', { title })}
        type="destructive"
        open={openConfirmation}
        onClose={() => setOpenConfirmation(false)}
        isLoading={isPending}
        callback={() => mutate()}
      />
      <AssignTaskDialog
        open={openAssignTask}
        kpiId={Number(selectedId)}
        onClose={() => setOpenAssignTask(false)}
      />
    </>
  )
}

export default GenericComponent
