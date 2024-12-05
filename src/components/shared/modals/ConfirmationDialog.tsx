import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { useSheetStore } from '@/stores/sheet-store'
import { Bell, CircleCheck, Info } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { FC, useEffect, useRef } from 'react'

export type ConfirmationType = 'default' | 'warning' | 'success' | 'destructive'

interface IConfirmationDialogProps {
  isLoading?: boolean
  type: ConfirmationType
  open: boolean
  title: string
  subTitle?: string
  onClose: () => void
  callback: () => void
}

const ConfirmationDialog: FC<IConfirmationDialogProps> = ({
  callback,
  onClose,
  open,
  title,
  subTitle,
  type = 'default',
  isLoading,
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const { isConfirmationModalOpen, actions } = useSheetStore((store) => store)
  const { openConfirmationModal } = actions
  const t = useTranslations('general')

  const iconToShow = (type: ConfirmationType): JSX.Element => {
    switch (type) {
      case 'warning':
        return (
          <div className="flex size-12 items-center justify-center rounded-full bg-amber-400">
            <Info className="text-amber-600" />
          </div>
        )
      case 'success':
        return (
          <div className="flex size-12 items-center justify-center rounded-full bg-success/20">
            <CircleCheck className="text-success" />
          </div>
        )
      case 'destructive':
        return (
          <div className="bg-destructive/20 flex size-12 items-center justify-center rounded-full">
            <Info className="text-destructive" />
          </div>
        )
      default:
        return (
          <div className="flex size-12 items-center justify-center rounded-full bg-zinc-200">
            <Bell className="text-zinc-800" />
          </div>
        )
    }
  }

  useEffect(() => {
    if (open) {
      ref.current?.focus()
    }
    if (isConfirmationModalOpen !== open) openConfirmationModal(open)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        aria-describedby={undefined}
        ref={ref}
        tabIndex={-1}
        className="flex h-fit w-full max-w-[95%] flex-col items-center justify-center gap-[1.875rem] !rounded-[1.875rem] border-none bg-zinc-50 p-4 sm:h-[17.5625rem] sm:max-w-[25rem] sm:p-[1.875rem]"
      >
        <div className="flex w-full flex-col items-center gap-5">
          {iconToShow(type)}
          <div className="flex w-full flex-col items-start justify-center gap-2 text-center">
            <DialogTitle className="w-full text-2xl font-medium leading-[1.8rem] text-zinc-900">
              {title}
            </DialogTitle>
            {subTitle && (
              <DialogDescription className="w-full text-sm text-zinc-500">
                {subTitle}
              </DialogDescription>
            )}
          </div>
        </div>
        <div className="flex w-full items-center justify-center gap-3">
          <Button
            variant={'outline'}
            className="w-full max-w-36 sm:max-w-[10.25rem]"
            onClick={() => onClose()}
          >
            {t('cancel')}
          </Button>
          <Button
            variant={type === 'destructive' ? 'destructive' : 'default'}
            disabled={isLoading}
            isLoading={isLoading}
            className="w-full max-w-36 sm:max-w-[10.25rem]"
            onClick={() => callback()}
          >
            {t('confirm')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmationDialog
