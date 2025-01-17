'use client'

import { FC } from 'react'
import ResourceIconToShow, { ResourceType } from './ResourceIconToShow'

interface IResourceComponentProps {
  path: string
  type: string
  name: string
  size: string
}

const ResourceComponent: FC<IResourceComponentProps> = ({
  name,
  size,
  type,
}) => {
  return (
    <div className="flex cursor-pointer items-center gap-2 rounded-[0.5rem] bg-slate-200 p-2">
      <div className="flex h-10 items-center justify-center">
        <ResourceIconToShow type={type as ResourceType} />
      </div>
      <div className="flex w-full max-w-[12.5rem] flex-col items-start truncate">
        <span className="text-xs font-semibold leading-normal text-neutral-800">
          {name}
        </span>
        <span className="text-xs leading-normal text-neutral-500">{size}</span>
      </div>
    </div>
  )
}

export default ResourceComponent
