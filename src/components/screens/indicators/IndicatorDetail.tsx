'use client'

import IndicatorForm from '@/components/forms/IndicatorForm'
import SheetComponent from '@/components/shared/sheets/SheetComponent'
import { Button } from '@/components/ui/button'
import { SheetNames, useSheetStore } from '@/stores/sheet-store'
import { IMongoIndicator } from '@/types/indicator'
import { ISerializedIndicator, ISerializedLevel } from '@/types/serialized'
import { Minus, Pencil, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { FC, useState } from 'react'

interface IIndicatorDetailProps {
  data: ISerializedIndicator
}

const IndicatorDetail: FC<IIndicatorDetailProps> = ({ data }) => {
  const t = useTranslations('general')
  const { actions, isEdit } = useSheetStore((store) => store)
  const { openSheet } = actions

  const localizedTitle = t('indicators')
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
    <>
      <div className="p-4">
        <div className="flex items-start justify-start">
          <h1 className="mb-4 text-2xl font-bold">{data?.name} Detail</h1>
          <Button
            variant="icon"
            size={'ghost'}
            className="mt-2"
            onClick={() =>
              openSheet({
                sheetToOpen: 'indicator' as SheetNames,
                isEdit: true,
              })
            }
          >
            <Pencil size="8" className="text-primary" />
          </Button>
        </div>
        {data.levels && data.levels.length > 0 ? (
          renderTree(data.levels)
        ) : (
          <p className="text-gray-500">No levels available</p>
        )}
      </div>
      <SheetComponent
        sheetName={'indicator' as SheetNames}
        title={
          isEdit
            ? `${t('edit')} ${localizedTitle}`
            : `${t('add-new')} ${localizedTitle}`
        }
        subtitle={
          isEdit
            ? `${t('edit')} ${localizedTitle} ${t('here')}`
            : `${t('define-new')} ${localizedTitle}`
        }
        className="w-full !max-w-[80vw]"
      >
        <IndicatorForm data={data as unknown as IMongoIndicator} />
      </SheetComponent>
    </>
  )
}

export default IndicatorDetail
