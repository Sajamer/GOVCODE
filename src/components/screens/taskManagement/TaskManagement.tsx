'use client'

import TasksTable from '@/components/shared/tables/tasks/TasksTable'
import { getAllTasks } from '@/lib/actions/task.actions'
import { ITasksManagementResponse } from '@/types/tasks'
import { useQuery } from '@tanstack/react-query'
import { LayoutList } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { FC } from 'react'

const TaskManagement: FC = () => {
  const { data: session } = useSession()
  const userId = session?.user?.id

  const { data, isLoading } = useQuery({
    queryKey: ['tasks-management', userId],
    queryFn: async () => {
      if (!userId) return []
      return await getAllTasks({}, userId)
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })

  const tasksData = data || []

  return (
    <TasksTable<ITasksManagementResponse>
      title="tasks"
      description="taskDescription"
      taskType="KPI_RELATED"
      entityKey="id"
      sheetName={'tasks-management'}
      data={tasksData}
      isLoading={isLoading}
      icon={<LayoutList className="text-white" />}
      columns={[
        { key: 'name', isSortable: false, type: 'string' },
        { key: 'description', isSortable: false, type: 'string' },
        { key: 'startDate', isSortable: false, type: 'date' },
        { key: 'dueDate', isSortable: false, type: 'date' },
        { key: 'actualEndDate', isSortable: false, type: 'date' },
        { key: 'priority', isSortable: false, type: 'priority' },
        { key: 'status', isSortable: false, type: 'status' },
      ]}
    />
  )
}

export default TaskManagement
