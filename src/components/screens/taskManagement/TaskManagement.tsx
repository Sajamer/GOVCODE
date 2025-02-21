'use client'

import GenericComponent from '@/components/shared/tables/GenericTable'
import { getAllTasks } from '@/lib/actions/task.actions'
import { ITasksManagementResponse } from '@/types/tasks'
import { useQuery } from '@tanstack/react-query'
import { LayoutList } from 'lucide-react'
import { FC } from 'react'

const TaskManagement: FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['tasks-management'],
    queryFn: async () => {
      return await getAllTasks()
    },
    staleTime: 5 * 60 * 1000,
  })

  const tasksData = data || []

  console.log(tasksData)

  return (
    <GenericComponent<ITasksManagementResponse>
      title="tasks"
      description="taskDescription"
      entityKey="id"
      sheetName={'tasks-management'}
      data={tasksData}
      isLoading={isLoading}
      icon={<LayoutList className="text-white" />}
      columns={[
        { key: 'name', isSortable: false, type: 'string' },
        { key: 'description', isSortable: false, type: 'string' },
        // { key: 'startDate', isSortable: false, type: 'string' },
        // { key: 'dueDate', isSortable: false, type: 'string' },
        // { key: 'startDate', isSortable: false, type: 'string' },
        // { key: 'priority', isSortable: false, type: 'string' },
        // { key: 'statusId', isSortable: false, type: 'number' },
      ]}
    />
  )
}

export default TaskManagement
