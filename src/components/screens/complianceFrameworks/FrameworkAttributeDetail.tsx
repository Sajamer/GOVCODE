'use client'

import NoResultFound from '@/components/shared/NoResultFound'
import { getAllFrameworks } from '@/lib/actions/framework.actions'
import { IFrameworkAttribute } from '@/types/framework'
import { useQuery } from '@tanstack/react-query'
import { House, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { FC } from 'react'

interface FrameworkAttributeDetailProps {
  frameworkId: string
  attributeId: string
}

const FrameworkAttributeDetail: FC<FrameworkAttributeDetailProps> = ({
  frameworkId,
  attributeId,
}) => {
  const t = useTranslations('general')
  const router = useRouter()
  const pathname = usePathname()
  const isArabic = pathname.includes('/ar')

  const { data, isLoading } = useQuery({
    queryKey: ['frameworks'],
    queryFn: async () => getAllFrameworks(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const frameworks = data?.frameworks || []
  const currentFramework = frameworks.find((f) => f.id === frameworkId)

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] w-full items-center justify-center">
        <Loader2 className="size-16 animate-spin" />
      </div>
    )
  }

  if (!currentFramework) {
    return <NoResultFound label={t('framework-not-found')} />
  }

  // Group attributes by column index
  const attributesByColumn: Record<number, IFrameworkAttribute[]> = {}
  currentFramework.attributes.forEach((attr) => {
    const colIndex = attr.colIndex || 0
    if (!attributesByColumn[colIndex]) {
      attributesByColumn[colIndex] = []
    }
    attributesByColumn[colIndex].push(attr)
  })

  // Find the selected attribute and its children
  const selectedAttribute = currentFramework.attributes.find(
    (attr) => attr.id === attributeId,
  )
  const parentSelectedAttribute = currentFramework.attributes.find(
    (attr) => attr.id === selectedAttribute?.parentId,
  )

  if (!selectedAttribute) {
    return <NoResultFound label={t('attribute-not-found')} />
  }

  // Get all attributes that have the selected attribute as parent (direct children)
  const directChildren = currentFramework.attributes.filter(
    (attr) => attr.value === selectedAttribute.value,
  )
  const getRelatedAttributesFromColumn = (columnIndex: number) => {
    const relatedAttributes: IFrameworkAttribute[] = []

    // Find the index of selected attribute
    const selectedIndex = currentFramework.attributes.findIndex(
      (attr) => attr.id === selectedAttribute.id,
    )

    if (selectedIndex !== -1) {
      // Get all records after selectedAttribute
      for (
        let i = selectedIndex + 1;
        i < currentFramework.attributes.length;
        i++
      ) {
        const attr = currentFramework.attributes[i]

        // If we hit a colIndex 0 or 1, we're in a new main section
        if (attr.colIndex <= 1) {
          continue
        }

        // Add all records that match the target column
        if (attr.colIndex === columnIndex) {
          relatedAttributes.push(attr)
        }
      }
    }

    return relatedAttributes
  }

  // Get remaining columns (include column 2 and up)
  const remainingColumns = Object.keys(attributesByColumn)
    .map(Number)
    .filter((colIndex) => colIndex >= 2) // Changed to include column 2
    .sort((a, b) => a - b)

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="flex w-full flex-col items-start gap-[1.875rem]"
    >
      <div className="flex w-full items-center justify-center gap-2">
        <House
          className="size-5 cursor-pointer"
          onClick={() => router.back()}
        />
        <span className="font-medium">
          {parentSelectedAttribute?.value} -&gt;{' '}
        </span>{' '}
        {selectedAttribute.value}
      </div>
      <div className="flex w-full flex-col items-center justify-center gap-0.5">
        {/* Table Header */}
        <div className="flex w-full items-center gap-6 rounded-t-lg border-b bg-primary p-4 text-white">
          <span className="w-10 shrink-0">#</span>
          {remainingColumns.map((columnIndex) => {
            const relatedAttributes =
              getRelatedAttributesFromColumn(columnIndex)
            return (
              <span key={columnIndex} className="flex-1">
                {relatedAttributes?.[0]?.name}
              </span>
            )
          })}
        </div>{' '}
        {/* Table Body */}
        {directChildren.map((child, childIndex) => {
          // Get the specific related attribute for this child in the given column
          const getChildSpecificAttribute = (columnIndex: number) => {
            // Find the current child's index in the framework attributes
            const currentChildIndex = currentFramework.attributes.findIndex(
              (attr) => attr.id === child.id,
            )

            if (currentChildIndex !== -1) {
              // Look for the next attribute in the specified column after this child
              for (
                let i = currentChildIndex + 1;
                i < currentFramework.attributes.length;
                i++
              ) {
                const attr = currentFramework.attributes[i]

                // Stop if we hit a new section (colIndex <= child.colIndex)
                if (attr.colIndex <= child.colIndex) {
                  break
                }

                // Return the first attribute that matches the target column
                if (attr.colIndex === columnIndex) {
                  return attr
                }
              }
            }

            return null
          }

          // Create one row per child
          return (
            <div
              key={child.id}
              className="flex w-full items-center gap-6 border-b p-4 hover:bg-[#266a55]/60 hover:text-white"
            >
              <span className="w-10 shrink-0 font-medium">
                {childIndex + 1}
              </span>

              {remainingColumns.map((columnIndex) => {
                const currentAttribute = getChildSpecificAttribute(columnIndex)

                return (
                  <span
                    key={`${child.id}-${columnIndex}`}
                    className="flex-1 text-sm"
                  >
                    {currentAttribute ? currentAttribute.value : '-'}
                  </span>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default FrameworkAttributeDetail
