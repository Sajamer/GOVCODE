'use client'

import InvitationForm from '@/components/forms/InvitationForm'
import ManualUserForm from '@/components/forms/ManualUserForm'
import PageHeader from '@/components/shared/headers/PageHeader'
import ConfirmationDialog from '@/components/shared/modals/ConfirmationDialog'
import NoResultFound from '@/components/shared/NoResultFound'
import SheetComponent from '@/components/shared/sheets/SheetComponent'
import EditDeleteTableActions from '@/components/shared/tables/EditDeleteTableActions'
import TableComponent from '@/components/shared/tables/TableComponent'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { deleteUser, getAllOrganizationUsers } from '@/lib/actions/userActions'
import { generateTableData } from '@/lib/utils'
import { SheetNames, useSheetStore } from '@/stores/sheet-store'
import { IUsers } from '@/types/users'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Info, KeyRound, Loader2, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { FC, useEffect, useMemo, useState } from 'react'

interface IUserAccessComponentProps {
  data: IOrganizationWithDepartments
}

const UserAccessComponent: FC<IUserAccessComponentProps> = ({ data }) => {
  const entityKey = 'id'
  const orgId = data.id
  const t = useTranslations('general')
  const queryClient = useQueryClient()
  const deleteConfirmationTitle = 'user'

  const [openConfirmation, setOpenConfirmation] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data: userData, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      return await getAllOrganizationUsers({
        organizationId: String(orgId),
      })
    },
    staleTime: 5 * 60 * 1000,
  })

  const columns: IColumn[] = [
    { key: 'fullName', isSortable: false, type: 'string' },
    { key: 'email', isSortable: false, type: 'string' },
    { key: 'role', isSortable: false, type: 'string' },
  ]

  const staticPageData = {
    title: 'user-access',
    buttonCTA: t('invite-user'),
    addManually: t('user-manually'),
    manualSheetSubtitle: t('manual-user-subtitle'),
    sheetTitle: t('invite-user'),
    sheetSubTitle: t('user-sheet-subtitle'),
    description: 'user-access-description',
  }

  const { actions, sheetToOpen, isEdit, rowId } = useSheetStore(
    (store) => store,
  )
  const { openSheet, setSearchTerm } = actions

  const entityData = useMemo(() => userData ?? [], [userData])

  const singleEntityData = isEdit
    ? (entityData.find((r) => r[entityKey] === rowId) as IUsers)
    : undefined

  const { mutate, isPending } = useMutation({
    mutationFn: async () => await deleteUser(selectedId as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setOpenConfirmation(false)
      toast({
        variant: 'success',
        title: 'Deleted Successfully',
        description: `User successfully deleted`,
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

  const { headers, values } = generateTableData(entityData, columns)

  useEffect(() => {
    setSearchTerm('')
  }, [setSearchTerm])

  const tableActions = (rowData: IUsers): JSX.Element => (
    <EditDeleteTableActions
      rowId={rowData[entityKey] as string}
      callback={() => {
        setSelectedId(rowData[entityKey] as string)
        setOpenConfirmation(true)
      }}
      sheetName={'userAccessManually'}
    />
  )

  return (
    <>
      <div className="w-full">
        <PageHeader
          title={staticPageData.title}
          description={staticPageData.description}
          iconWrapper="bg-primary"
          icon={<KeyRound className="text-primary-foreground" />}
        >
          <SheetComponent
            sheetName={'userAccessManually'}
            title={
              isEdit
                ? `${t('edit')} ${staticPageData.addManually}`
                : `${t('add')} ${staticPageData.addManually}`
            }
            subtitle={
              isEdit
                ? `${t('edit')} ${staticPageData.manualSheetSubtitle}`
                : `${t('create')} ${staticPageData.manualSheetSubtitle}`
            }
          >
            {sheetToOpen === 'userAccessManually' ? (
              <ManualUserForm data={singleEntityData} />
            ) : null}
          </SheetComponent>
          <Button
            variant="secondary"
            onClick={() =>
              openSheet({
                sheetToOpen: 'userAccessManually' as SheetNames,
                isEdit: false,
              })
            }
            className="flex size-[2.375rem] items-center justify-center !gap-[0.38rem] px-3 lg:h-11 lg:w-fit 2xl:w-[13.75rem]"
          >
            <Plus size="24" className="text-primary-foreground" />
            <span className="hidden text-sm font-medium lg:flex">
              {staticPageData.addManually}
            </span>
          </Button>
          <SheetComponent
            sheetName={'userAccess'}
            title={
              isEdit
                ? `${t('edit')} ${staticPageData.sheetTitle}`
                : `${staticPageData.sheetTitle}`
            }
            subtitle={
              isEdit
                ? `${t('edit')} ${staticPageData.sheetTitle} ${t('here')}`
                : `${staticPageData.sheetSubTitle}`
            }
          >
            {sheetToOpen === 'userAccess' ? <InvitationForm /> : null}
          </SheetComponent>
          <Button
            variant="default"
            onClick={() =>
              openSheet({
                sheetToOpen: 'userAccess' as SheetNames,
                isEdit: false,
              })
            }
            className="flex size-[2.375rem] items-center justify-center !gap-[0.38rem] px-3 lg:h-11 lg:w-fit 2xl:w-[13.75rem]"
          >
            <Plus size="24" className="text-primary-foreground" />
            <span className="hidden text-sm font-medium lg:flex">
              {staticPageData.buttonCTA}
            </span>
          </Button>
        </PageHeader>
        <div className="mt-3 flex items-start gap-3 rounded-[1.25rem] bg-neutral-100 p-[1.875rem]">
          <Info className="mt-[0.31rem] size-4 min-w-4 text-neutral-600" />
          <div className="flex flex-col items-start gap-1">
            <h3 className="text-base font-medium text-neutral-800">
              People who can access this organization:
            </h3>
            <p className="text-sm font-medium text-neutral-600">
              Only the people listed below can access this consolidated
              organization. If you can&apos;t find someone, they may not have
              been invited to {data?.name} organization.
            </p>
          </div>
        </div>
        <div className="mt-10 flex w-full flex-col gap-[1.88rem]">
          {isLoading ? (
            <div className="flex min-h-[200px] w-full items-center justify-center">
              <Loader2 className="size-16 animate-spin" />
            </div>
          ) : entityData.length > 0 ? (
            <TableComponent
              data={values}
              headers={headers}
              hasFooter
              addProps={{
                label: `invite user to ${data?.name} organization`,
                sheetToOpen: 'userAccess',
              }}
              tableActions={tableActions}
            />
          ) : (
            // <></>
            <NoResultFound label={`No ${staticPageData.title} yet.`} />
          )}
        </div>
      </div>
      <ConfirmationDialog
        title={t('confirm-deletion')}
        subTitle={t('deleteConfirmation', { title: deleteConfirmationTitle })}
        type="destructive"
        open={openConfirmation}
        onClose={() => setOpenConfirmation(false)}
        isLoading={isPending}
        callback={() => mutate()}
      />
    </>
  )
}

export default UserAccessComponent
