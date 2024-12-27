'use client'

import Image from 'next/image'
import { FC } from 'react'

interface IChartData {
  expanded: boolean
  type: string
  data: {
    image: string
    name: string
    title: string
    index?: number
  }
  children?: IChartData[]
}

interface IOrganizationTreeProps {
  chartData: IChartData[]
}

const OrganizationTree: FC<IOrganizationTreeProps> = ({ chartData }) => {
  const renderNode = (node: IChartData, level: number = 0): JSX.Element => {
    return (
      <div className="flex flex-col items-center" key={node.data.name}>
        <div className="relative flex flex-col items-center">
          {/* Card */}
          <div className="relative mt-6 flex w-52 flex-col items-center rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
            {/* Profile Image */}
            <div className="absolute -top-6 mb-3">
              <div className="size-12 overflow-hidden rounded-full border-2 border-white shadow-lg">
                <Image
                  alt={node.data.name}
                  src={node.data.image}
                  width={48}
                  height={48}
                  className="size-full object-cover"
                />
              </div>
            </div>
            {/* Content */}
            <div className="mt-5 flex flex-col items-center space-y-1">
              <span className="text-sm font-medium text-gray-900">
                {node.data.name}
              </span>
              <span className="text-xs text-gray-500">{node.data.title}</span>
            </div>
            {/* Children Count Badge */}
            {node.children && node.children.length > 0 && (
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
                <div className="flex h-8 w-12 items-center justify-center rounded-xl bg-[#EDEAFF] text-xs font-medium text-[#7C3AED]">
                  {node.children.length}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Children */}
        {node.children && node.children.length > 0 && (
          <div className={`relative mt-12 flex justify-center gap-8`}>
            {/* Vertical Line */}
            <div className="absolute -top-8 left-1/2 h-8 w-px -translate-x-1/2 bg-[#7C3AED]" />

            {/* Horizontal Line */}
            {node.children.length > 1 && (
              <div className="absolute  top-0 h-px w-[53.5%] bg-[#7C3AED]" />
            )}

            {node.children.map((child, index) => (
              <div key={index} className="mt-5 flex flex-col items-center">
                {/* Curved Connection Line */}

                <div className="absolute top-0 h-8 w-px bg-[#7C3AED]" />
                {renderNode(child, level + 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-full overflow-x-auto p-8">
      <div className="min-w-max">
        {chartData.map((node) => renderNode(node))}
      </div>
    </div>
  )
}

export default OrganizationTree
