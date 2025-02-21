import { Priority } from '@prisma/client'
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
  status: Priority
}

const StatusBadge: FC<IStatusBadgeProps> = ({ status }) => {
  let variantColor: VariantColor = 'warning'

  switch (status) {
    case 'MEDIUM':
      variantColor = 'warning'
      break
    case 'HIGH':
      variantColor = 'destructive'
      break
    case 'LOW':
      variantColor = 'dark'
      break
    default:
      variantColor = 'warning'
      break
  }

  return (
    <Badge variant={variantColor} size={'sm'} className="px-2.5 py-0.5">
      <span className="text-xs font-normal capitalize">{status}</span>
    </Badge>
  )
}

export default StatusBadge
