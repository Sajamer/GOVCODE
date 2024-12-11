'use client'

import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FC } from 'react'

interface ICustomCardHeaderProps {
  title: string
  description?: string
}

const CustomCardHeader: FC<ICustomCardHeaderProps> = ({
  title,
  description,
}) => {
  return (
    <CardHeader>
      <div className="flex w-full items-start justify-between gap-2">
        <div className="flex w-full flex-col items-start gap-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description} </CardDescription>
        </div>
      </div>
    </CardHeader>
  )
}

export default CustomCardHeader
