import KPIForm from '@/components/forms/KPIForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { axiosDelete } from '@/lib/axios'
import { cn, generateTableData, searchObjectValueRecursive } from '@/lib/utils'
import { importKpis } from '@/queries/kpiQueries'
import { useGlobalStore } from '@/stores/global-store'
import { SheetNames, useSheetStore } from '@/stores/sheet-store'
import { IKpiResponse } from '@/types/kpi'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ChartSpline,
  Download,
  Import,
  Loader2,
  Plus,
  Trash,
  X,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import PageHeader from '../headers/PageHeader'
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
  isLoading?: boolean
  columns: Array<{
    key: keyof T | 'actions'
    isSortable: boolean
    type: CellType
  }>
}

const GenericComponent = <T extends Record<string, unknown>>({
  title,
  description,
  icon,
  entityKey,
  sheetName,
  showImportExcel = false,
  columns,
  isLoading,
  data,
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

  const [openConfirmation, setOpenConfirmation] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false)
  const [uploadedFile, setUploadedFile] = useState<File | undefined>(undefined)

  const entityData = useMemo(() => data ?? [], [data])

  const filteredData = useMemo(
    () =>
      entityData.filter(
        (entity) =>
          !searchTerm || searchObjectValueRecursive(entity, searchTerm),
      ),
    [entityData, searchTerm],
  )

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
    mutationFn: async () => await importKpis(uploadedFile as File),
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
        title: 'Operation Failed',
        description: error?.message,
      })
    },
  })

  const singleEntityData = isEdit
    ? (entityData.find((r) => r[entityKey] === rowId) as T | undefined)
    : undefined

  const localizedTitle = t(title)

  return (
    <>
      <div
        dir={isArabic ? 'rtl' : 'ltr'}
        className="flex w-full flex-col items-start gap-[1.875rem]"
      >
        <PageHeader
          title={title}
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
                    {t('import-excel')}
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
                Download CSV{' '}
                <span className="font-medium text-neutral-800">
                  Sample File
                </span>
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
                  uploadMutation()
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
            <TableComponent
              data={values}
              headers={headers}
              hasFooter={hasPermission && true}
              addProps={{
                label: `${t('add') + ' ' + localizedTitle}`,
                sheetToOpen: sheetName as SheetNames,
              }}
              tableActions={tableActions}
            />
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
    </>
  )
}

export default GenericComponent
