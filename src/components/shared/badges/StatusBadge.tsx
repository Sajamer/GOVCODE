import { ITaskStatus } from '@/types/tasks'
import { FC } from 'react'
import Badge from './Badge'

type VariantColor =
  | 'warning'
  | 'success'
  | 'default'
  | 'primary'
  | 'secondary'
  | 'destructive'
  | 'dark'

interface IStatusBadgeProps {
  status: ITaskStatus['name']
}

const StatusBadge: FC<IStatusBadgeProps> = ({ status }) => {
  let variantColor: VariantColor = 'warning'

  switch (status?.toLowerCase()) {
    case 'in progress':
      variantColor = 'primary'
      break
    case 'on hold':
      variantColor = 'secondary'
      break
    case 'rejected':
      variantColor = 'destructive'
      break
    case 'todo':
      variantColor = 'dark'
      break
    case 'done':
    case 'completed':
      variantColor = 'success'
      break
    default:
      variantColor = 'warning'
      break
  }

  return (
    <Badge variant={variantColor} size={'sm'} className="w-fit px-2.5 py-0.5">
      <span className="text-sm font-normal capitalize">
        {status?.toLowerCase()}
      </span>
    </Badge>
  )
}

export default StatusBadge
