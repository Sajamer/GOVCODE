import KPIForm from '@/components/forms/KPIForm'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { axiosDelete } from '@/lib/axios'
import { generateTableData, searchObjectValueRecursive } from '@/lib/utils'
import { useGlobalStore } from '@/stores/global-store'
import { SheetNames, useSheetStore } from '@/stores/sheet-store'
import { IKpiResponse } from '@/types/kpi'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ChartSpline, Loader2, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import PageHeader from '../headers/PageHeader'
import ConfirmationDialog from '../modals/ConfirmationDialog'
import NoResultFound from '../NoResultFound'
import SheetComponent from '../sheets/SheetComponent'
import TableActionButtons from './GenericTableActionButtons'
import TableComponent from './TableComponent'

interface IGenericTableProps<T extends Record<string, unknown>> {
  title: string
  description: string
  icon?: JSX.Element
  entityKey: keyof T
  sheetName: SheetNames
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

  const { hasPermission } = useGlobalStore((store) => store)

  const [openConfirmation, setOpenConfirmation] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

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
          )}
        </PageHeader>
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
