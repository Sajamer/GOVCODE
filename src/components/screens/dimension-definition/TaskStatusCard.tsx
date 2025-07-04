'use client'

import TaskStatusTable from '@/components/shared/tables/kpiDimensions/TaskStatusTable'
import { getAllStatusByOrganizationId } from '@/lib/actions/status.actions'
import { useGlobalStore } from '@/stores/global-store'
import { ITaskStatus } from '@/types/tasks'
import { useQuery } from '@tanstack/react-query'
import { LayoutList } from 'lucide-react'
import { FC } from 'react'

const TaskStatusCard: FC = () => {
  const { organizationId } = useGlobalStore((store) => store)

  const { data, isLoading } = useQuery({
    queryKey: ['task-status', organizationId],
    queryFn: async () => {
      return await getAllStatusByOrganizationId(organizationId)
    },
    staleTime: 5 * 60 * 1000,
  })

  const taskStatusData = data || []

  return (
    <TaskStatusTable<ITaskStatus>
      title="task-status"
      description="taskStatusDescription"
      entityKey="id"
      sheetName={'task-status'}
      data={taskStatusData}
      isLoading={isLoading}
      icon={<LayoutList className="text-white" />}
      columns={[
        { key: 'name', isSortable: false, type: 'string' },
        { key: 'color', isSortable: false, type: 'color' },
      ]}
    />
  )
}

export default TaskStatusCard
