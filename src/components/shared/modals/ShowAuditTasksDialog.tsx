import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { FC } from 'react'

interface IShowAuditTasksDialogProps {
  open: boolean
  onClose: () => void
}

const ShowAuditTasksDialog: FC<IShowAuditTasksDialogProps> = ({
  onClose,
  open,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        aria-describedby={undefined}
        className="flex h-fit w-full max-w-[95%] flex-col items-center justify-center gap-[1.875rem] !rounded-[1.875rem] border-none bg-zinc-50 p-4 sm:h-fit sm:max-w-[50%] sm:p-[1.875rem]"
      >
        <div className="flex w-full flex-col items-start justify-center gap-2 text-center">
          <DialogTitle className="sr-only w-full text-2xl font-medium leading-[1.8rem] text-zinc-900">
            Audit Tasks
          </DialogTitle>
          <DialogDescription className="sr-only w-full text-sm text-zinc-500"></DialogDescription>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ShowAuditTasksDialog
