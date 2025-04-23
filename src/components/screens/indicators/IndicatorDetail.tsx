'use client'

import { ISerializedIndicator, ISerializedLevel } from '@/types/serialized'
import { Minus, Plus } from 'lucide-react'
import { FC, useState } from 'react'

interface IIndicatorDetailProps {
  data: ISerializedIndicator
}

const IndicatorDetail: FC<IIndicatorDetailProps> = ({ data }) => {
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set())

  const toggleLevel = (id: string) => {
    setExpandedLevels((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const renderTree = (levels: ISerializedLevel[]) => {
    if (!levels || levels.length === 0) return null

    return (
      <ul className="ml-4 border-l-2 border-gray-300 pl-4">
        {levels.map((level) => {
          const isExpanded = expandedLevels.has(level._id)

          return (
            <li key={level._id} className="relative mb-2">
              <div
                className="flex cursor-pointer items-center space-x-2"
                onClick={() => toggleLevel(level._id)}
              >
                {level.subLevels &&
                  level.subLevels.length > 0 &&
                  (isExpanded ? (
                    <Minus className="size-4 text-gray-500" />
                  ) : (
                    <Plus className="size-4 text-gray-500" />
                  ))}
                <span className="font-medium">{level.levelName}</span>
              </div>
              {isExpanded &&
                level.subLevels &&
                level.subLevels.length > 0 &&
                renderTree(level.subLevels)}
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">{data?.name} Detail</h1>
      {data.levels && data.levels.length > 0 ? (
        renderTree(data.levels)
      ) : (
        <p className="text-gray-500">No levels available</p>
      )}
    </div>
  )
}

export default IndicatorDetail
