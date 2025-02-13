import StatusBadge from '@/components/shared/badges/StatusBadge'
import { Card } from '@/components/ui/card'
import { Priority, TaskStatus } from '@prisma/client'
import { Clock10 } from 'lucide-react'
import moment from 'moment'
import { FC } from 'react'

interface ITasksCardProps {
  taskName: string
  dueDate: Date | null
  comment: string
  status: TaskStatus
  priority: Priority
}

const TasksCard: FC<ITasksCardProps> = ({
  comment,
  dueDate,
  priority,
  status,
  taskName,
}) => {
  return (
    <Card className="relative flex h-fit w-full flex-col items-start justify-between rounded-[2.5rem] border border-neutral-100 p-6 shadow-sm backdrop-blur-[1.25rem] dark:bg-white">
      <div className="flex w-full flex-col items-start gap-2.5">
        <span className="text-lg font-medium leading-normal text-neutral-900 dark:text-neutral-200">
          {taskName}
        </span>
        <span className="text-sm leading-normal text-neutral-900 dark:text-neutral-300">
          {comment}
        </span>
        <div className="flex w-full flex-col items-start justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <StatusBadge status={status} />
            <StatusBadge status={priority} />
          </div>
          {dueDate && (
            <div className="flex items-center gap-1 whitespace-nowrap">
              <Clock10 className="size-3 text-neutral-500" />
              <span className="text-xs text-neutral-500">
                {moment(dueDate).format('YYYY-MM-DD')}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export default TasksCard
