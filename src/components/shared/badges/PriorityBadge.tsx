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

interface IPriorityBadgeProps {
  status: Priority
}

const PriorityBadge: FC<IPriorityBadgeProps> = ({ status }) => {
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
    <Badge variant={variantColor} size={'sm'} className="w-fit px-2.5 py-1.5">
      <span className="text-sm font-normal capitalize">{status}</span>
    </Badge>
  )
}

export default PriorityBadge
